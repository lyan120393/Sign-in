const express = require('express');
const {People} = require('./db/model/people.js').People;
const db = require('./db/dbConfig.js').db;
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const {authentic} = require('./server/middleware/authentic.js');
const _ = require('lodash');


const app = express();

app.set('view engine', 'pug');
app.use(bodyParser.json());

//渲染页面
app.get('/', (req,res) => {
  res.render('index', {title: 'Sign in Home Pgae', message : 'This is from pug template'})
})

//用户注册
app.post('/reg', (req, res) => {
  let newUser = new People({
    email : req.body.email,
    password: req.body.password
  })

  newUser.save().then((user) => {
    user.generateToken().then((token) => {
      res.header('x-auth', token).status(200).send({
        user:user.toJson()
      })
    })
    }).catch((err) => {
    if (err){
    res.status(404).send(`${err}`);
    }
    });
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
  if(!ObjectID.isValid(id)){
    res.status(404).send('inValid ID');
  }
  People.findById(id).then((user)=>{
    res.status(200).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  })
})



app.listen(3000, () => {
  console.log(`Server is running`)
})