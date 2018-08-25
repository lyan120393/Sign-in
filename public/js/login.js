console.log("login.js has connected");
let loginObj = {};
document.querySelector("#login-form").addEventListener("change", function(e) {
  if (e.target.id === "exampleInputEmail") {
    e.preventDefault();
    loginObj.email = e.target.value;
  }
  if (e.target.id === "exampleInputPassword") {
    e.preventDefault();
    loginObj.password = e.target.value;
  }
});

document.querySelector("#register-btn").addEventListener("click", function(e) {
  location.assign("/reg");
});

//使用 XMLHttpRequest 请求的案例:
//点击登录按钮之后的操作
document.querySelector("#login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  //创建 request 实例
  const request = new XMLHttpRequest();
  //回调函数, 当数据正确传回(正确传回的数字就是4),执行把返回的数据打印.
  request.addEventListener("readystatechange", function(e) {
    const data = JSON.parse(e.target.responseText);
    console.log(data);
    if (e.target.readyState === 4 && data.permition === true) {
      console.log("Login success");
      location.assign("/me");
    } else if (e.target.readyState === 4 && data.permition === false) {
      console.log("you need to wait until approved");
      location.assign("/regWait");
    }
  });
  if (loginObj.email && loginObj.password) {
    //发送 async 的 post 请求,并指定路由.
    request.open("post", "http://localhost:3000/user/login", true);
    //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
    request.setRequestHeader("Content-Type", "application/json");
    //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
    request.send(JSON.stringify(loginObj));
  }
  e.target.elements[0].value = "";
  e.target.elements[1].value = "";
});
