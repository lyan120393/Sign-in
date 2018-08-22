const express = require("express");
const { People } = require("./db/model/people.js");
const db = require("./db/dbConfig.js").db;
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const { authentic } = require("./server/middleware/authentic.js");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { toUnix } = require("./server/functions/toUnix");

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
  let signOutObj = _.pick(req.body, ["HH", "mm", "apptizer", "drink", "note"]);
  //根据用户传过来的数据进行确定签到时间的 unix 数值 signOutTime
  let signOutTime;
  if (signOutObj.HH && signOutObj.mm) {
    signOutTime = toUnix({ HH: signOutObj.HH, mm: signOutObj.mm });
  }
  //在数据库当中查找对应当天日期的那一条记录所在的位置. promise resolve 之后返回 userID 和dayID
  let workdayPromise = new Promise((resolve, reject) => {
    let workday = req.user.workdays.filter(workday => {
      console.log(moment(moment.unix(toUnix())).format("MM-DD-YYYY"));
      //查看是否有符合当天签到日期的签入记录,当有当日签入信息之后,在进行操作签出. 数组是签入信息的数组,根据长度判断
      return (
        moment(moment.unix(toUnix())).format("MM-DD-YYYY") ===
        moment(moment.unix(workday.signIn)).format("MM-DD-YYYY")
      );
    });
    //获取当前已 signIn 日期位于 workdays 数组当中的位置
    let index = req.user.workdays.indexOf(workday[0]);
    // 如果没有搜索到包含的序号
    if (index < 0) {
      return reject(
        `index less than 0, Mean didn't find the day you try to signOut had signIn`
      );
    }
    let userID = req.user._id;
    let dayID = req.user.workdays[index]._id;
    //查找指定用户,指定日期 ID 的那一天的数据, 并进行修改
    People.findTheDay(userID, dayID)
      .then(theday => {
        theday.signOut = signOutTime;
        theday.apptizer = signOutObj.apptizer;
        theday.note = signOutObj.note;
        theday.hours = moment(theday.signOut).diff(moment(theday.signIn));
        theday.drink = signOutObj.drink;
        req.user.saveTheDay(theday);
        res.send(theday);
      })
      .catch(e => res.status(400).send(e));
  });
});

//签到记录时间, 增加记录
app.post("/signIn", authentic, (req, res) => {
  //signIn 的类型设置: 1.近似时间签到和自定义时间(必须当天);
  //所以用户传递过来的时间需要进行判定. 根据所传递过来的数据.
  let signInObj = _.pick(req.body, ["HH", "mm"]);
  //根据用户传过来的数据进行确定签到时间的 unix 数值 signInTime
  let signInTime;
  if (signInObj.HH && signInObj.mm) {
    signInTime = toUnix({ HH: signInObj.HH, mm: signInObj.mm });
  }
  //判断当天是否存在签到的数据根据 workday 数组的长度
  let workdayPromise = new Promise((resolve, reject) => {
    let workday = req.user.workdays.filter(workday => {
      return (
        //把 signInTime 的 unix 数值转化为 MM-DD-YYYY 的格式.
        moment(moment.unix(workday.signIn)).format("MM-DD-YYYY") ===
        //和今天的日期进行对比.toUnix 不带参数自动是当天日期.
        moment(moment.unix(toUnix())).format("MM-DD-YYYY")
      );
    });
    if (workday.length === 0) {
      //在 user 的 workdays 数组中找不到任何当天有签到的记录,就进行签到
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
//增加记录, 手动增加记录, 查询当日记录,补签到
app.post("/reSign", authentic, (req, res) => {
  //获取用户提供的日期, 根据日期进行查找数据库, 如果没有查找到(说明当日没有签到记录)
  //就可以进行 重新签到( reSign), 然后进行在数据库末尾进行添加数据,返回结果.
  let user = req.user;
  //用户需要传递过来包含签出时间等一系列的字段.
  let reSignObj = _.pick(req.body, [
    // all time data need required
    "signInMM",
    "signInDD",
    "signInYYYY",
    "signInHH",
    "signInmm",
    "signOutMM",
    "signOutDD",
    "signOutYYYY",
    "signOutHH",
    "signOutmm",
    "apptizer",
    "drink",
    "note"
  ]);
  if (reSignObj.signInYYYY && reSignObj.signInDD && reSignObj.signInMM) {
    let resignIn = toUnix({
      MM: reSignObj.signInMM,
      DD: reSignObj.signInDD,
      YYYY: reSignObj.signInYYYY,
      HH: reSignObj.signInHH,
      mm: reSignObj.signInmm
    });
    let resignOut = toUnix({
      MM: reSignObj.signOutMM,
      DD: reSignObj.signOutDD,
      YYYY: reSignObj.signOutYYYY,
      HH: reSignObj.signOutHH,
      mm: reSignObj.signOutmm
    });

    let workdayPromise = new Promise((resolve, reject) => {
      let workday = user.workdays.filter(workday => {
        return (
          //把 signInTime 的 unix 数值转化为 MM-DD-YYYY 的格式.
          moment(moment.unix(workday.signIn)).format("MM-DD-YYYY") ===
          //和今天的日期进行对比.toUnix 不带参数自动是当天日期.
          moment(moment.unix(resignIn)).format("MM-DD-YYYY")
        );
      });
      if (workday.length === 0) {
        //在 user 的 workdays 数组中找不到任何指定日期的签入记录,就进行补签
        return resolve(`resolve: workday length is ${workday.length}`);
      } else if (workday.length > 0) {
        return reject(
          `reject: workday length is ${workday.length}, reject reSign`
        );
      }
    });

    workdayPromise
      .then(() => {
        let tempWorkday = {
          signIn: resignIn,
          signOut: resignOut,
          apptizer: reSignObj.apptizer,
          drink: reSignObj.drink,
          note: reSignObj.note,
          hours: moment(resignOut).diff(moment(resignIn))
        };

        People.update(
          { _id: user._id },
          { $push: { workdays: tempWorkday } },
          { new: true }
        )
          .then(() => {
            res.status(200).send({
              time: `reSign signInTime is ${moment.unix(
                resignIn
              )} , ${resignIn}`,
              message: "reSign success on the date above"
            });
          })
          .catch(e => {
            res.status(400).send({
              message: `Cannot signIn ${e}`
            });
          });
      })
      .catch(e => {
        res.status(400).send({
          message: `The day has been signed`
        });
      });
  }
});

app.delete("/deleteRecord", authentic, (req, res) => {
  //获得用户提交的日期, 根据日期查找数据库是否有指定匹配日期的记录.
  //如果找到元素, 获取元素位于原数组当中的位置, 通过 splice 实例方法进行删除.
  let user = req.user;
  let deleteRecordObj = _.pick(req.body, ["dateMM", "dateDD", "dateYYYY"]);
  if (
    deleteRecordObj.dateMM &&
    deleteRecordObj.dateDD &&
    deleteRecordObj.dateYYYY
  ) {
    let deleteUnix = toUnix({
      MM: deleteRecordObj.dateMM,
      DD: deleteRecordObj.dateDD,
      YYYY: deleteRecordObj.dateYYYY
    });

    let workdayPromise = new Promise((resolve, reject) => {
      let workday = user.workdays.filter(workday => {
        console.log(moment(moment.unix(workday.signIn)).format("MM-DD-YYYY"));
        console.log(moment(moment.unix(deleteUnix)).format("MM-DD-YYYY"));
        return (
          //把 deleteRecordObj 的 unix 数值转化为 MM-DD-YYYY 的格式.
          moment(moment.unix(workday.signIn)).format("MM-DD-YYYY") ===
          moment(moment.unix(deleteUnix)).format("MM-DD-YYYY")
        );
      });

      //获取当前已 signIn 日期位于 workdays 数组当中的位置
      let index = user.workdays.indexOf(workday[0]);
      // 如果没有搜索到包含的序号
      if (index < 0) {
        return reject(
          `index less than 0, Mean didn't find the day you try to delete record`
        );
      } else if (index >= 0) {
        return resolve(index);
      }
    });
    workdayPromise
      .then(index => {
        user.deleteAndSaveTheDay(index);
        res.status(200).send(`The day has been delete`);
      })
      .catch(e => {
        res.status(400).send(`${e}`);
      });
  }
});
//用于根据用户输入的日期, 去查找对应日期的记录, 并返回给用户. 然后对比用户想去修改的内容进行修改. 查询某一日期的记录
app.post("/editcheck", authentic, (req, res) => {
  // 修改指定日期(提供日期), 查询当日是否有签到记录.
  // 如果有记录,根据日期进行修改.
  // 如果没有告诉没有记录无法修改.
  let user = req.user;
  let editRecordObj = _.pick(req.body, ["dateMM", "dateDD", "dateYYYY"]);
  if (editRecordObj.dateMM && editRecordObj.dateDD && editRecordObj.dateYYYY) {
    //editUnix 是用户提供日期的 Unix 数值.
    let editUnix = toUnix({
      MM: editRecordObj.dateMM,
      DD: editRecordObj.dateDD,
      YYYY: editRecordObj.dateYYYY
    });
    let workdayPromise = new Promise((resolve, reject) => {
      let workday = user.workdays.filter(workday => {
        console.log(moment(moment.unix(workday.signIn)).format("MM-DD-YYYY"));
        console.log(moment(moment.unix(editUnix)).format("MM-DD-YYYY"));
        return (
          //把 deleteRecordObj 的 unix 数值转化为 MM-DD-YYYY 的格式.
          moment(moment.unix(workday.signIn)).format("MM-DD-YYYY") ===
          moment(moment.unix(editUnix)).format("MM-DD-YYYY")
        );
      });

      //获取当前已 signIn 日期位于 workdays 数组当中的位置
      let index = user.workdays.indexOf(workday[0]);
      // 如果没有搜索到包含的序号
      if (index < 0) {
        return reject(
          `index less than 0, Mean didn't find the day you try to edit record`
        );
      } else if (index >= 0) {
        return resolve(index);
      }
    });
    workdayPromise
      .then(index => {
        // user.deleteAndSaveTheDay(index);
        res.status(200).send(user.workdays[index]);
      })
      .catch(e => {
        res.status(400).send(`${e}`);
      });
  }
});

app.post("/edit", authentic, (req, res) => {
  //用户传入一天的数据, 包含全部的字段. 用户只能修改具体的时间, 不可以更改日期.
  //根据日期的 Unix 在数据库中找到当天的数据, 然后进行删除.
  //之后再根据用户传入的数据,在数组的尾部添加这一天的数据.
  //成功 or 失败 提示.
  let user = req.user;
  let editRecordObj = _.pick(req.body, [
    // "manualEdit", //应该是默认设置为 true
    "_id",
    "signIn",
    "signInHH",
    "signInmm",
    "signOut",
    "signOutHH",
    "signOutmm",
    "apptizer",
    "note",
    "hours",
    "drink"
  ]);
  let newSignIn;
  let newSignOut;
  let tempWorkday;
  // console.log(editRecordObj);
  // console.log(editRecordObj.signInmm);
  if (editRecordObj.signInmm && editRecordObj.signInHH) {
    //用户改变了签入的时间
    newSignIn = toUnix({
      MM: moment(moment.unix(editRecordObj.signIn)).format("MM"),
      DD: moment(moment.unix(editRecordObj.signIn)).format("DD"),
      YYYY: moment(moment.unix(editRecordObj.signIn)).format("YYYY"),
      HH: editRecordObj.signInHH,
      mm: editRecordObj.signInmm
    });
  }
  if (editRecordObj.signOutmm && editRecordObj.signOutHH) {
    //用户改变了签出的时间
    newSignOut = toUnix({
      MM: moment(moment.unix(editRecordObj.signOut)).format("MM"),
      DD: moment(moment.unix(editRecordObj.signOut)).format("DD"),
      YYYY: moment(moment.unix(editRecordObj.signOut)).format("YYYY"),
      HH: editRecordObj.signOutHH,
      mm: editRecordObj.signOutmm
    });
  }
  //根据用户提供的新的签入时间和签出时间重新计算
  if (newSignIn || newSignOut) {
    if (newSignIn && newSignOut) {
      console.log(`both exist`);
      tempWorkday = {
        manualEdit: true,
        signIn: newSignIn,
        signOut: newSignOut,
        apptizer: editRecordObj.apptizer,
        drink: editRecordObj.drink,
        note: editRecordObj.note,
        hours: moment(newSignOut).diff(moment(newSignIn))
      };
    } else if (!newSignIn) {
      console.log(`newSignIn not exist`);
      tempWorkday = {
        manualEdit: true,
        signIn: editRecordObj.signIn,
        signOut: newSignOut,
        apptizer: editRecordObj.apptizer,
        drink: editRecordObj.drink,
        note: editRecordObj.note,
        hours: moment(newSignOut).diff(moment(editRecordObj.signIn))
      };
    } else if (!newSignOut) {
      console.log(`newSignOut not exist`);
      tempWorkday = {
        manualEdit: true,
        signIn: newSignIn,
        signOut: editRecordObj.signOut,
        apptizer: editRecordObj.apptizer,
        drink: editRecordObj.drink,
        note: editRecordObj.note,
        hours: moment(editRecordObj.signOut).diff(moment(newSignIn))
      };
    }
  } else if (!newSignIn && !newSignOut) {
    console.log("Both not exist");
    tempWorkday = {
      manualEdit: true,
      signIn: editRecordObj.signIn,
      signOut: editRecordObj.signOut,
      apptizer: editRecordObj.apptizer,
      drink: editRecordObj.drink,
      note: editRecordObj.note,
      hours: moment(editRecordObj.signOut).diff(moment(editRecordObj.signIn))
    };
  }
  // console.log(tempWorkday);

  let workdayPromise = new Promise((resolve, reject) => {
    let workday = user.workdays.filter(workday => {
      console.log(moment(moment.unix(workday.signIn)).format("MM-DD-YYYY"));
      console.log(moment(moment.unix(tempWorkday.signIn)).format("MM-DD-YYYY"));
      return (
        //把 deleteRecordObj 的 unix 数值转化为 MM-DD-YYYY 的格式.
        moment(moment.unix(workday.signIn)).format("MM-DD-YYYY") ===
        moment(moment.unix(tempWorkday.signIn)).format("MM-DD-YYYY")
      );
    });

    //获取当前已 signIn 日期位于 workdays 数组当中的位置
    let index = user.workdays.indexOf(workday[0]);
    // 如果没有搜索到包含的序号
    if (index < 0) {
      return reject(
        `index less than 0, Mean didn't find the day you try to edit record`
      );
    } else if (index >= 0) {
      return resolve(index);
    }
  });

  workdayPromise
    .then(index => {
      //删除这一天的数据
      user.deleteAndSaveTheDay(index);
      //查找根据用户的id, 然后在 workdays 数组中的末尾增加一天
      People.update(
        { _id: user._id },
        { $push: { workdays: tempWorkday } },
        { new: true }
      )
        .then(() => {
          res.status(200).send({
            tempWorkday
          });
        })
        .catch(e => {
          res.status(400).send({
            message: `Cannot signIn ${e}`
          });
        });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});
//查询一个时间区间内的所有工作记录
app.post("/period", authentic, (req, res) => {
  let user = req.user;
  let periodObj = _.pick(req.body, [
    "dateStartMM",
    "dateStartDD",
    "dateStartYYYY",
    "dateEndMM",
    "dateEndDD",
    "dateEndYYYY"
  ]);
  let dateStart = toUnix({
    MM: periodObj.dateStartMM,
    DD: periodObj.dateStartDD,
    YYYY: periodObj.dateStartYYYY
  });
  let dateEnd = toUnix({
    MM: periodObj.dateEndMM,
    DD: periodObj.dateEndDD,
    YYYY: periodObj.dateEndYYYY
  });
  let workdayPromise = new Promise((resolve, reject) => {
    let workday = user.workdays.filter(workday => {
      console.log(moment(moment.unix(dateStart)).format("MM-DD-YYYY"));
      console.log(moment(moment.unix(dateEnd)).format("MM-DD-YYYY"));
      console.log(moment(moment.unix(workday.signIn)).format("MM-DD-YYYY"));
      return (
        //把 deleteRecordObj 的 unix 数值转化为 MM-DD-YYYY 的格式.
        moment(
          moment(moment.unix(workday.signIn)).format("YYYY-MM-DD")
        ).isBetween(
          moment(moment.unix(dateStart)).format("YYYY-MM-DD"),
          moment(moment.unix(dateEnd)).format("YYYY-MM-DD"),
          null,
          "[]"
        )
      );
    });

    // 如果没有搜索到包含的序号
    if (workday.length < 0) {
      return reject(
        `workday.length less than 0, Mean not workday between the period`
      );
    } else if (workday.length >= 0) {
      return resolve(workday);
    }
  });

  workdayPromise
    .then(workday => {
      res.send(workday);
    })
    .catch(e => {
      res.status(400).send(e);
    });

  // console.log(moment(moment.unix(dateStart)).format("MM-DD-YYYY"));
  // console.log(moment(moment.unix(dateEnd)).format("MM-DD-YYYY"));
  // let result = moment(
  //   moment(moment.unix(tempDay)).format("YYYY-MM-DD")
  // ).isBetween(
  //   moment(moment.unix(dateStart)).format("YYYY-MM-DD"),
  //   moment(moment.unix(dateEnd)).format("YYYY-MM-DD"),
  //   null,
  //   "[]"
  // );
  // console.log(result);
});

/*
增删改查
  1. 增
    当日增加:签到签出(标准常规签到)
    补签:过去日期的补签 (提供签到时间, 签出时间, 小吃, 饮料, note )直接操作数据库签到.补签需要带有一个记录.
  2. 删除
    删除指定日期的工作记录(提供签到日期),根据签到日找到当天的记录进行删除
  3. 改 /edit
    修改指定日期(提供日期), 查询当日是否有签到记录. 
      如果有记录,根据日期进行修改.
      如果没有告诉没有记录无法修改.
  4. 查询 
    查询某日的工作记录(使用/ editcheck 路由)
    查询某段时间的工作记录(工作这里)
      输入肯定是两个时间点, 计算包含这两个时间点以及在他们之间的时间点的元素.


*/

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
