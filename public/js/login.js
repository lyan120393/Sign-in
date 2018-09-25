console.log("login.js has connected");
let loginObj = {};
// `${serverAddress}/xxx`
const serverAddress = "https://sleepy-citadel-66405.herokuapp.com";
document.querySelector("#nav-logo").addEventListener("click", function(e) {
  location.assign(`${serverAddress}/login`);
});
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
  //回调函数, 当数据正确传回(正确传回的数字就是4, 即e.target.readyState === 4),执行把返回的数据打印.
  request.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      // console.log(`receive counter`);
      // console.log(`e.target.responseText is ${e.target.responseText}`);
      if (e.target.responseText != "") {
        const data = JSON.parse(e.target.responseText);
        if (data._id) {
          // console.log(data);
          if (data.permition === true) {
            console.log("Login success");
            //获取服务返回的 Header, 然后在服务器上获取 x-auth
            let header = e.target.getAllResponseHeaders();
            //死代码, 获取 x-auth
            //localhost 本地 token 获取
            // let token = header.slice(87, 258);
            //heroku 服务器 token 获取
            let token = header.slice(189, 360);

            // 从这里开始, 这里不可以使用死的数据去获取 token , 要再想想办法. 死数据在 heroku 上面获取到的内容不是 token 的内容, 导致服务器无法根据 token 去识别用户,  会导致 me.page 的运行错误,无法正常的获取数据.

            //把 token 放入到 hash 里面,方便跨页面使用同一个 token
            location.assign(`/me#${token}`);
            // visitme(token);
          } else if (data.permition === false) {
            console.log("you need to wait until approved");
            location.assign("/regWait");
          }
        } else if (data.message) {
          //账号或者密码错误
          //清除原有页面数据, 并进行重新渲染
          let showCorW = document.querySelector("#showCorW");
          while (showCorW.firstChild) {
            showCorW.removeChild(showCorW.firstChild);
          }
          let InvalidNotice = document.createElement("lable");
          InvalidNotice.textContent = `Cannot login, because ${data.message}`;
          InvalidNotice.setAttribute("class", "text-danger");
          showCorW.appendChild(InvalidNotice);
          // console.log(`data.message is ${data.message}`);
        }
      } else {
        //返回的数据为空时
        console.log(`e.target.responseText is null`);
      }
    }
  });
  if (loginObj.email && loginObj.password) {
    //发送 async 的 post 请求,并指定路由.
    // console.log(`request sent`);
    request.open("post", `${serverAddress}/user/login`, true);
    //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
    request.setRequestHeader("Content-Type", "application/json");
    //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
    request.send(JSON.stringify(loginObj));
  } else {
    // console.log(`please input email & password`);
    let showCorW = document.querySelector("#showCorW");
    while (showCorW.firstChild) {
      showCorW.removeChild(showCorW.firstChild);
    }
    let InvalidNotice = document.createElement("lable");
    InvalidNotice.textContent = `please input email & password`;
    InvalidNotice.setAttribute("class", "text-danger");
    showCorW.appendChild(InvalidNotice);
  }
  e.target.elements[0].value = "";
  e.target.elements[1].value = "";
});
