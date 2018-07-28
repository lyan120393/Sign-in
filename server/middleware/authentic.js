const {People} = require('../../db/model/people.js');

const authentic = function (req, res, next){
  let token = req.header('x-auth');
  //把 token decode 之后找到用户
  People.findByToken(token).then((user) => {
    if(!user){
      return Promise.reject('User Not Exist');
    }else {
      //判断用户所使用的 token 是否位于用户的 tokens 数组中.
      if(user.tokens.filter((elements) => elements.token === token).length > 0){
        req.user = user;
        req.token = token;
        next();
      }else{
        return Promise.reject('token is invalid');
      }
    }
  }).catch((e) => {
    res.status(404).send(e);
  })
}

module.exports = {
  authentic,
}