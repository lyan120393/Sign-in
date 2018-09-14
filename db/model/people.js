const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { ObjectId } = require("mongodb");
const salt =
  "sudiaduisaudsnadmnsajdnjk1hjk2hkhi8dsy89chqeiudfhqwhdoiqwud8owuyehjkq";
const bcrypt = require("bcryptjs");

const PeopleSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid E-mail`
    }
  },
  username: {
    type: String,
    required: true,
    // unique: true,
    minlength: 1,
    maxlength: 64,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 64,
    trim: true
  },
  belongStore: {
    type: String
    // required: true
  },
  permition: {
    type: Boolean,
    default: false
  },
  tokens: [
    {
      access: {
        type: String,
        required: false
      },
      token: {
        type: String,
        required: false
      }
    }
  ],
  workdays: [
    {
      signIn: {
        //The actuall time for sign in
        type: Number
      },
      signOut: {
        //The actuall time for sign in
        type: Number
      },
      hours: {
        //总秒数
        type: Number
      },
      drink: {
        type: Number
      },
      apptizer: {
        type: Number
      },
      note: {
        type: String
      },
      manualEdit: {
        type: Boolean,
        default: false
      }
    }
  ],
  role: {
    manager: {
      type: Boolean,
      default: false
    },
    front: {
      type: Boolean,
      default: false
    },
    kitchen: {
      type: Boolean,
      default: false
    }
  }
});

//需要实例才能使用的实例方法
PeopleSchema.methods = {
  generateToken: function() {
    let user = this;
    if (user.permition === true) {
      let access = "auth";
      let token = jwt.sign({ _id: user._id.toHexString(), access }, salt);

      user.tokens.push({ access, token });
      // return Promise.resolve().then(()=>token);
      return user.save().then(() => token);
    } else {
      let token;
      return user.save().then(() => token);
    }
  },
  //过滤 user 实例中需要的信息内容给用户, 当然也可以添加 role.kitchen 这种字段.
  toJson: function() {
    let user = this;
    let userObj = user.toObject();
    return _.pick(userObj, ["_id", "email", "permition", "username", "role"]);
  },
  removeToken(token) {
    let user = this;
    return user.update({ $pull: { tokens: { token: token } } });
  },
  removeAllToken(token) {
    let user = this;
    //$slice 必须结合 $each 一起使用,否则出错.
    return user.update({ $push: { tokens: { $each: [0], $slice: 0 } } });
  },
  saveTheDay(theday) {
    let user = this;
    //根据 user 和 theday 的 ID 找到那一天在 workdays 数组当中的index,

    let findtheIndex = function(user, theday) {
      let tempArray = user.workdays.filter(
        workday => String(workday._id) === String(theday._id)
      );
      return user.workdays.indexOf(tempArray[0]);
    };
    //通过 spice 方法 移除之前的 index, 并插入新的 theday 在相同位置
    user.workdays.splice(findtheIndex(user, theday), 1, theday);
    //通过 update operator 把修改好的 user 实例进行 update.
    People.update(
      { _id: user._id },
      { $set: { workdays: user.workdays } },
      { new: true }
    ).then(doc => {
      //成功之后的对数据库的操作记录
      // console.log(doc);
    });
  },
  deleteAndSaveTheDay(theDayIndex) {
    let user = this;
    //根据 user 和 theday 的 ID 找到那一天在 workdays 数组当中的index,

    // let findtheIndex = function(user, theday) {
    //   let tempArray = user.workdays.filter(
    //     workday => String(workday._id) === String(theday._id)
    //   );
    //   return user.workdays.indexOf(tempArray[0]);
    // };
    //通过 spice 方法 移除之前的 index, 并插入新的 theday 在相同位置
    user.workdays.splice(theDayIndex, 1);
    //通过 update operator 把修改好的 user 实例进行 update.
    People.update(
      { _id: user._id },
      { $set: { workdays: user.workdays } },
      { new: true }
    ).then(doc => {
      //成功之后的对数据库的操作记录
      console.log(doc);
    });
  }
};

//静态方法
PeopleSchema.statics = {
  //根据 Token 查找用户
  findByToken(token) {
    let decode;
    try {
      decode = jwt.verify(token, salt);
    } catch (e) {
      return Promise.reject("Cannot Varify Token");
    }
    return People.findById(decode._id)
      .then(user => user)
      .catch(e => e);
  },
  //根据用户账号密码确认用户
  findByCredentials(tempUser) {
    let User = this;
    return new Promise((resolve, reject) => {
      User.findOne({ email: tempUser.email })
        .then(user => {
          bcrypt
            .compare(tempUser.password, user.password)
            .then(result => {
              //result包含的是 bcryt.compare 异步的 bollean 值结果.
              if (result) {
                resolve(user);
              } else {
                reject();
              }
            })
            .catch(e => {
              reject(e);
            });
        })
        .catch(err => {
          return reject();
        });
    });
  },
  //自定制功能:根据 userID 和 dayID 去返回对应的 workdays 当中的数据
  findTheDay(userID, dayID) {
    let theday;
    return new Promise((resolve, reject) => {
      People.findById(userID).then(user => {
        theday = user.workdays.filter(
          workday => String(workday._id) === String(dayID)
        );
        // console.log(theday);
        if (theday && theday.length > 0) {
          //返回的theday 是一个 obj
          return resolve(theday[0]);
        } else {
          return reject(`theday is not found`);
        }
      });
    });
  }
};

//在执行某项数据库操作之前, 会执行的操作
//用户密码 bcrypt 加密
//在保存之前, 对密码进行加密,将 plain text 密码替换为加密过的进行存入数据库.
PeopleSchema.pre("save", function(next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, result) => {
        user.password = result;
        next();
      });
    });
  } else {
    next();
  }
});

const People = mongoose.model("People", PeopleSchema);

module.exports = {
  People
};
