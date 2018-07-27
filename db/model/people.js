const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const salt = 'sudiaduisaudsnadmnsajdnjk1hjk2hkhi8dsy89chqeiudfhqwhdoiqwud8owuyehjkq';

const PeopleSchema = new mongoose.Schema({
  email : {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate : {
    validator : validator.isEmail,
    message: `{VALUE} is not a valid E-mail`
    }
  },
  password:{
    type:String,
    required:true,
    minlength:6,
    maxlength:64,
    trim:true
  },
  permition:{
    type:Boolean,
    default:false,
  },
  tokens : [{
    access : {
    type : String,
    required : false
    },
    token : {
    type : String,
    required : false
    }
    }],
    workdays:[
      {
        signIn:{
          //The actuall time for sign in
          type:Number,
        },
        signOut:{
          //The actuall time for sign in
          type:Number,
        },
        hours:[
          {
            type:Number,
          }
        ],
        drink:{
          Type:Number,
        },
        snack:{
          type:Number,
        },
        note:{
          type: String,
        },
        manualEdit:{
          type:Boolean,
          default:false
        }
      }
    ],
    role:{
      manager:{
        type:Boolean,
      },
      front:{
        type:Boolean,
      },
      kitchen:{
        type:Boolean,
      }
    }
});

PeopleSchema.methods = {
  generateToken: function(){
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id:user._id.toHexString(), access}, salt);

    user.tokens.push({access, token});
    return user.save().then(()=>token)
  },
  //过滤 user 实例中需要的信息内容给用户, 当然也可以添加 role.kitchen 这种字段.
  toJson: function(){
    let user = this;
    let userObj = user.toObject();
    return _.pick(userObj, ['_id', 'email']);
  }
}

PeopleSchema.statics = {
  findByToken(token){
    let decode;
    try{
      decode = jwt.verify(token, salt);
    }catch(e){
      return Promise.reject('Cannot Varify Token');
    }
    return People.findById(decode._id).then((user) => user).catch((e) => e);
  }
}

const People = mongoose.model('People', PeopleSchema);

module.exports = {
  People,
}