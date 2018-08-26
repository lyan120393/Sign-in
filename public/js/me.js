console.log(`me.js has connected`);
//hash使用 substring(1)减去前面的#符号.
const token = location.hash.substring(1);
// console.log(token);
//拿到 token 之后, 在页面进行加载的时候, 就回去访问服务器的/ me 的路由去获得需要的一切信息.

//当页面加载的时候,我们可以执行的脚本.
window.onload = function() {
  let request = new XMLHttpRequest();
  request.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const data = JSON.parse(e.target.responseText);
    }
  });

  request.open("get", "http://localhost:3000/user/me", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("x-auth", token);
  //纯 get 请求不需要任何内容
  request.send();
};
