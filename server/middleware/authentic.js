const {People} = require('../../db/model/people.js');

const authentic = function (req, res, next){
  let token = req.header('x-auth');
  People.findByToken(token).then((user) => {
    if(!user){
      return Promise.reject();
    }else {
      req.user = user;
      req.token = token;
      next();
    }
  }).catch((e) => {
    res.status(404).send(e);
  })
}

module.exports = {
  authentic,
}