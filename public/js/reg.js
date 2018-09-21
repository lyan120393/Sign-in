console.log(`reg.js has connected`);
const serverAddress = "https://sleepy-citadel-66405.herokuapp.com";
let registerObj = {};
document.querySelector("#nav-logo").addEventListener("click", function(e) {
  location.assign(`${serverAddress}/login`);
});
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

let registerValidator = function(
  email,
  username,
  passwordFirst,
  passwordSecond
) {
  let passwordBoolean = false;
  let emailBoolean = false;
  let userBoolean = false;
  if (email && email != "") {
    emailBoolean = true;
  } else {
    return "email is not a valid email";
  }

  if (username && username != "") {
    userBoolean = true;
  } else {
    return "username is not work";
  }

  if (
    `${passwordFirst}`.length >= 6 &&
    `${passwordFirst}`.length <= 64 &&
    `${passwordFirst}`
  ) {
    if (passwordFirst === passwordSecond) {
      passwordBoolean = true;
    } else {
      return "Password and Confirm Password are not same";
    }
  } else {
    return "password's length has to be between 6 to 64.";
  }
  if (passwordBoolean && emailBoolean && userBoolean) {
    return true;
  }
};

document
  .querySelector("#register-form")
  .addEventListener("submit", function(e) {
    e.preventDefault();
    let result = registerValidator(
      registerObj.email,
      registerObj.username,
      registerObj.passwordFirst,
      registerObj.passwordSecond
    );
    if (
      //需要一个判定的功能,
      result === true
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
      request.open("post", `${serverAddress}/reg`, true);
      //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
      request.setRequestHeader("Content-Type", "application/json");
      //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
      // console.log(registerObj);
      request.send(JSON.stringify(registerObj));
    } else {
      let showCorW = document.querySelector("#showCorW");
      while (showCorW.firstChild) {
        showCorW.removeChild(showCorW.firstChild);
      }
      let InvalidNotice = document.createElement("lable");
      InvalidNotice.textContent = `Cannot complete register, because ${result}`;
      InvalidNotice.setAttribute("class", "text-danger");
      showCorW.appendChild(InvalidNotice);
    }
    e.target.elements[0].value = "";
    e.target.elements[1].value = "";
    e.target.elements[2].value = "";
    e.target.elements[3].value = "";
  });
