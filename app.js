const express = require('express');

const app = express();

app.set('view engine', 'pug');

app.get('/', (req,res) => {
  res.send(`<h1>This is Sign in Project home page. </h1>`)
})

app.get('/pug', (req,res) => {
  res.render('index', {title: 'Sign in Home Pgae', message : 'This is from pug template'})
})

app.listen(3000, () => {
  console.log(`Server is On`)
})