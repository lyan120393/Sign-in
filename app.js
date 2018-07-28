const express = require('express');
const { People } = require('./db/model/people.js');
const db = require('./db/dbConfig.js').db;
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const { authentic } = require('./server/middleware/authentic.js');
const _ = require('lodash');


const app = express();

app.set('view engine', 'pug');
app.use(bodyParser.json());

//渲染页面
app.get('/', (req, res) => {
  res.render('index', { title: 'Sign in Home Pgae', message: 'This is from pug template' })
})

//用户注册  用户注册成功之后真的有必要给 token 吗?
app.post('/reg', (req, res) => {
  let newUser = new People({
    email: req.body.email,
    password: req.body.password
  })
  //防止E-mail 重复
  People.findOne({ 'email': newUser.email }).then((existUser) => {
    if (existUser) {
      res.status(404).send({
        'message': 'User name duplicated, please make change!'
      })
    } else {
      newUser.save().then((user) => {
        user.generateToken().then((token) => {
          res.header('x-auth', token).status(200).send({
            user: user.toJson()
          })
        })
      }).catch((err) => {
        if (err) {
          res.status(404).send(`${err}`);
        }
      });
    }
  })
})
//用户登录与生成 Token
app.post('/user/login', (req, res) => {
  let tempUser = _.pick(req.body, ['email', 'password']);
  People.findByCredentials(tempUser).then((user) => {
    user.generateToken().then((token) => {
      res.status(200).header('x-auth', token).send(user.toJson());
    }).catch((err) => {
      res.status(404).send(err);
    })
  }).catch((err) => {
    res.status(404).send({
      'message': 'Password or Username is incorrect'
    });
  })
})

//用户登出与删除当前 token
app.delete('/user/logout', authentic, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send(`User successfuly logout`)
  }).catch((err) => {
    res.status(404).send(`Cannot logout user`)
  })
})

//用户从所有设备上登出与并删除所有 token
app.delete('/user/logoutAll', authentic, (req, res) => {
  req.user.removeAllToken(req.token).then(() => {
    res.status(200).send(`All token has been clean`)
  }).catch((err) => {
    res.status(404).send(`Cannot clean all token`)
  })
})

//验证 token 进入用户的私人路由.
app.get('/user/me', authentic, (req, res) => {
  res.status(200).send(req.user.toJson());
})

//获取全部用户
app.get('/allUser', (req, res) => {
  People.find({}).then((allUsers) => {
    res.send(allUsers)
  }).catch((err) => {
    res.status(400).send(err);
  })
})

//查找指定内容根据 id
app.get('/user/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send('inValid ID');
  }
  People.findById(id).then((user) => {
    res.status(200).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  })
})



app.listen(3000, () => {
  console.log(`Server is running`)
})