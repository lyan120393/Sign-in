console.log(`me.js has connected`);
//hash使用 substring(1)减去前面的#符号.
const token = location.hash.substring(1);
// console.log(token);
//拿到 token 之后, 在页面进行加载的时候, 就会去访问服务器的/user/me 的路由去获得需要的一切信息.

//所有需要点击的按钮的必备内容
document.querySelector("#manager-btn").addEventListener("click", function(e) {
  e.preventDefault();
  //从这里开始写点击按钮之后的业务代码
});

//当页面加载的时候,我们可以执行的脚本.
window.onload = function() {
  const request = new XMLHttpRequest();
  request.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const data = JSON.parse(e.target.responseText);
      console.log(data);
      //这里需要的是如何根据返回的数据去进行渲染页面
    }
  });
  //页面渲染路由, 和服务器的功能路由, 不是一种路由. /user/me 和 /me 完全意思不同.
  request.open("get", "http://localhost:3000/user/me", true);
  request.setRequestHeader("Content-Type", "application/json");
  //这样,服务器就能通过 authentic 去检查 header 当中的 x-auth 当中的 token 字段了
  request.setRequestHeader("x-auth", token);
  //纯 get 请求不需要任何内容
  request.send();

  //查询区域时间段的信息.
  const request2 = new XMLHttpRequest();
  request2.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const data2 = JSON.parse(e.target.responseText);
      console.log(data2);
      //这里需要的是如何根据返回的数据去进行渲染页面
    }
  });
  request2.open("post", "http://localhost:3000/period", true);
  //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
  request2.setRequestHeader("Content-Type", "application/json");
  request2.setRequestHeader("x-auth", token);
  let periodObj = {
    dateStartMM: "1",
    dateStartDD: "1",
    dateStartYYYY: "2018",
    dateEndMM: "12",
    dateEndDD: "31",
    dateEndYYYY: "2018"
  };
  //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
  request2.send(JSON.stringify(periodObj));
};
