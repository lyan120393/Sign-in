const express = require("express");
const { People } = require("./db/model/people.js");
const db = require("./db/dbConfig.js").db;
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const { authentic } = require("./server/middleware/authentic.js");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const moment = require("moment");

const app = express();

app.set("view engine", "pug");
app.use(bodyParser.json());
//使用 app.use 指定静态文件所在的位置在 public 文件夹之后,这样只要/就表示位于 public 文件夹之内.
app.use(express.static(__dirname + "/public/"));

//渲染页面
app.get("/", (req, res) => {
  res.render("reg.pug");
});

// app.get("/reg", (req, res) => {
//   res.render("home.pug", { title: "Home Page of SingIn Project" });
// });

//用户注册  用户注册成功之后真的有必要给 token 吗?
app.post("/reg", (req, res) => {
  let newUser = new People({
    email: req.body.email,
    password: req.body.password
  });
  //防止E-mail 重复
  People.findOne({ email: newUser.email }).then(existUser => {
    if (existUser) {
      res.status(404).send({
        message: "User name duplicated, please make change!"
      });
    } else {
      newUser
        .save()
        .then(user => {
          user.generateToken().then(token => {
            res
              .header("x-auth", token)
              .status(200)
              .send({
                user: user.toJson()
              });
          });
        })
        .catch(err => {
          if (err) {
            res.status(404).send(`${err}`);
          }
        });
    }
  });
});
//用户登录与生成 Token
app.post("/user/login", (req, res) => {
  let tempUser = _.pick(req.body, ["email", "password"]);
  People.findByCredentials(tempUser)
    .then(user => {
      user
        .generateToken()
        .then(token => {
          res
            .status(200)
            .header("x-auth", token)
            .send(user.toJson());
        })
        .catch(err => {
          res.status(404).send(err);
        });
    })
    .catch(err => {
      res.status(404).send({
        message: "Password or Username is incorrect"
      });
    });
});
//修改密码
app.patch("/user/change_password", authentic, (req, res) => {
  let tempUser = _.pick(req.body, ["password", "newPassword"]);
  tempUser.email = req.user.email;
  People.findByCredentials(tempUser)
    .then(user => {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(tempUser.newPassword, salt, (err, result) => {
          tempUser.newPassword = result;
          //set new hashed pwd to user db
          People.findByIdAndUpdate(
            { _id: user._id },
            { $set: { password: tempUser.newPassword } },
            { new: true }
          )
            .then(user => {
              user.save();
              res.status(200).send({
                message: "password has been save sucess"
              });
            })
            .catch(e => {
              res.status(400).send({
                message: `The password is not correct ${e}`
              });
            });
        });
      });
    })
    .catch(e => {
      res.status(400).send({
        message: "User Old password is not correct"
      });
    });
});

//用户登出与删除当前 token
app.delete("/user/logout", authentic, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send(`User successfuly logout`);
    })
    .catch(err => {
      res.status(404).send(`Cannot logout user`);
    });
});

//用户从所有设备上登出与并删除所有 token
app.delete("/user/logoutAll", authentic, (req, res) => {
  req.user
    .removeAllToken(req.token)
    .then(() => {
      res.status(200).send(`All token has been clean`);
    })
    .catch(err => {
      res.status(404).send(`Cannot clean all token`);
    });
});

//验证 token 进入用户的私人路由.
app.get("/user/me", authentic, (req, res) => {
  res.status(200).send(req.user.toJson());
});

//签出记录(签出时间, 小吃, 饮料, note)
app.post("/signOut", authentic, (req, res) => {
  //signOut 的类型设置分为一种, 近似和自定义时间 signOut
  //用户需要传递过来包含签出时间等一系列的字段.
  let signOutObj = _.pick(req.body, ["specificTime", "snack", "drink", "note"]);
  //根据用户传过来的数据进行确定签到时间的 unix 数值 signOutTime
  let signOutTime;
  if (signOutObj.specificTime) {
    let theTime = `${moment().get("month") + 1}-${moment().get(
      "date"
    )}-${moment().get("year")} ${signOutObj.specificTime}`;
    signOutTime = moment(theTime, "MM-DD-YYYY HH:mm").unix();
  }
  // console.log(`signOutTime is ${signOutTime}`);
  //把 signOutTime 的 unix 数值转化为 MM-DD-YYYY 的格式.
  let today = moment(moment.unix(signOutTime)).format("MM-DD-YYYY");
  // console.log(`today is ${today}`);

  //在数据库当中查找对应当天日期的那一条记录所在的位置. promise resolve 之后返回 userID 和dayID
  let workdayPromise = new Promise((resolve, reject) => {
    let workday = req.user.workdays.filter(workday => {
      let theDay = moment(moment.unix(workday.signIn)).format("MM-DD-YYYY");
      return today === theDay;
    });
    //获取当前已 signIn 日期位于 workdays 数组当中的位置
    let index = req.user.workdays.indexOf(workday[0]);
    // console.log(`index is ${index}`);

    // 如果没有搜索到包含的序号
    if (index < 0) {
      return reject(`index less than 0`);
    }
    let userID = req.user._id;
    let dayID = req.user.workdays[index]._id;
    // console.log(`userID is ${userID}`);
    // console.log(`dayID is ${dayID}`);
    //查找指定用户,指定日期 ID 的那一天的数据, 并进行修改
    People.findTheDay(userID, dayID)
      .then(theday => {
        theday[0].signOut = signOutTime;
        theday[0].snack = signOutObj.snack;
        theday[0].drink = signOutObj.drink;
        theday[0].note = signOutObj.note;
        let periodTime = moment(theday[0].signOut).diff(
          moment(theday[0].signIn)
        );
        theday[0].hours = periodTime;
        req.user.saveTheDay(theday);
        res.send(theday);
      })
      .catch(e => res.status(400).send(e));
  });
});

//签到记录时间
app.post("/signIn", authentic, (req, res) => {
  //signIn 的类型设置分为三种: 1.近似时间签到和自定义时间(必须当天);
  //所以用户传递过来的时间需要进行判定. 根据所传递过来的数据.
  //{specificTime}}
  let signInObj = _.pick(req.body, ["specificTime"]);

  //根据用户传过来的数据进行确定签到时间的 unix 数值 signInTime
  let signInTime;
  if (signInObj.specificTime) {
    let theTime = `${moment().get("month") + 1}-${moment().get(
      "date"
    )}-${moment().get("year")} ${signInObj.specificTime}`;
    signInTime = moment(theTime, "MM-DD-YYYY HH:mm").unix();
  }

  //把 signInTime 的 unix 数值转化为 MM-DD-YYYY 的格式.
  let today = moment(moment.unix(signInTime)).format("MM-DD-YYYY");

  //判断当天是否存在签到的数据根据 workday 数组的长度
  let workdayPromise = new Promise((resolve, reject) => {
    let workday = req.user.workdays.filter(workday => {
      let theDay = moment(moment.unix(workday.signIn)).format("MM-DD-YYYY");
      return today === theDay;
    });
    if (workday.length === 0) {
      return resolve(`resolve: workday length is ${workday.length}`);
    } else if (workday.length > 0) {
      return reject(`reject: workday length is ${workday.length}`);
    }
  });

  workdayPromise
    .then(info => {
      let tempWorkday = {
        signIn: signInTime
      };
      People.update(
        { _id: req.user._id },
        { $push: { workdays: tempWorkday } },
        { new: true }
      )
        .then(() => {
          res.status(200).send({
            time: `signInTime is ${moment.unix(signInTime)} , ${signInTime}`,
            message: "signIn success, start to work now"
          });
        })
        .catch(e => {
          res.status(400).send({
            message: `Cannot signIn ${e}`
          });
        });
    })
    .catch(e => {
      res.status(200).send({
        message: `You already sign In today, are you doing to sign In twice today? ${e} `
      });
    });
});

//查找指定内容根据 id
app.get("/user/:id", (req, res) => {
  let id = req.params.id;
  if (!ObjectId.isValid(id)) {
    res.status(404).send("inValid ID");
  }
  People.findById(id)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.listen(3000, () => {
  console.log(`Server is running`);
});
