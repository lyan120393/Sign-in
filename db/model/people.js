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
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 64,
    trim: true
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
      type: Boolean
    },
    front: {
      type: Boolean
    },
    kitchen: {
      type: Boolean
    }
  }
});

PeopleSchema.methods = {
  generateToken: function() {
    let user = this;
    let access = "auth";
    let token = jwt.sign({ _id: user._id.toHexString(), access }, salt);

    user.tokens.push({ access, token });
    // return Promise.resolve().then(()=>token);
    return user.save().then(() => token);
  },
  //过滤 user 实例中需要的信息内容给用户, 当然也可以添加 role.kitchen 这种字段.
  toJson: function() {
    let user = this;
    let userObj = user.toObject();
    return _.pick(userObj, ["_id", "email"]);
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
      console.log(doc);
    });
  }
};

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
          return resolve(theday[0]);
        } else {
          return reject(`theday is not found`);
        }
      });
    });
  },

  //自定制功能:根据提供的时间去把时间转换为MM-DD-YYYY HH:mm格式的 unix 时间.
  //1. 如果传入时,仅仅传入 HH:mm 时间, 则自动设定为当天的 HH:mm 时间.
  //2. 如果传入时带有 MM-DD-YYYY HH:mm 时间则使用传入额的时间
  //3. 如果传入时仅仅带有 MM-DD-YYYY 没有 HH:mm 则自动返回指定日期的 unix 值.
  //4. 如果传入时没有任何的数据, 则自定返回当天日期的 unix 值.
  toUnix({ x = 0, y = 2 } = { x: 3, y: 5 }) {
    console.log(x + y);
  }
};

//用户密码 bcrypt 加密
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
