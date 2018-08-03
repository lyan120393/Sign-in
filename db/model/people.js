const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
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
      hours: [
        {
          type: Number
        }
      ],
      drink: {
        Type: Number
      },
      snack: {
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
