console.log(`reg.js has connected`);
let registerObj = {};
document
  .querySelector("#register-form")
  .addEventListener("change", function(e) {
    if (e.target.id === "exampleInputEmail") {
      e.preventDefault();
      registerObj.email = e.target.value;
    }
    if (e.target.id === "exampleInputUserName") {
      e.preventDefault();
      registerObj.username = e.target.value;
    }
    if (e.target.id === "exampleInputPassword") {
      e.preventDefault();
      registerObj.passwordFirst = e.target.value;
    }
    if (e.target.id === "ConfirmPassword") {
      e.preventDefault();
      registerObj.passwordSecond = e.target.value;
    }
  });

document.querySelector("#abandon-btn").addEventListener("click", function(e) {
  location.assign("/login");
});

document
  .querySelector("#register-form")
  .addEventListener("submit", function(e) {
    e.preventDefault();
    if (
      registerObj.passwordFirst === registerObj.passwordSecond &&
      registerObj.passwordSecond != undefined &&
      registerObj.email != undefined &&
      registerObj.username != undefined
    ) {
      // console.log(registerObj);
      registerObj.password = registerObj.passwordFirst;
      //创建 request 实例
      const request = new XMLHttpRequest();
      //回调函数, 当数据正确传回(正确传回的数字就是4),执行把返回的数据打印.
      request.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          // const data = e.target.responseText;
          // console.log(e.target.responseText);
          const data = JSON.parse(e.target.responseText);
          // console.log(data);
          try {
            if (data.user.email) {
              console.log(`Register Successful, please wait`);
              location.assign("/regWait");
            }
          } catch {
            if (data.message) {
              console.log(`${data.message}`);
            } else {
              console.log(`register error`);
            }
          }
        }
      });
      //发送 async 的 post 请求,并指定路由.
      request.open("post", "http://localhost:3000/reg", true);
      //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
      request.setRequestHeader("Content-Type", "application/json");
      //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
      // console.log(registerObj);
      request.send(JSON.stringify(registerObj));
    } else {
      console.log(`password is not same`);
    }
    e.target.elements[0].value = "";
    e.target.elements[1].value = "";
    e.target.elements[2].value = "";
    e.target.elements[3].value = "";
  });
