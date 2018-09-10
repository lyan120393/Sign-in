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
  const requestForUserInfo = new XMLHttpRequest();
  requestForUserInfo.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const userInfoData = JSON.parse(e.target.responseText);
      console.log(JSON.stringify(userInfoData));
      //本地需要安装 moment.js, 在进行加载的时候, 把需要的时间字段上传给服务器.
      //拿到数据之后, 把数据存储在本地的 localStorage 当中, 键名就是这个数据的变量名称.
      //查看是否可以在拿到数据之后, 立刻把数据发送给/ me, 这样/me 就会拿到这些数据去渲染模板页面,然后返回给本地.
      //然后就是使用 pug 的一系列的 api 去根据数据渲染模板页面, 这里需要大范围的重新编程模板页面.

      //第二种方式, 从服务器拿到数据之后到本地. 并且也从服务器拿到了静态的模板页面.

      //制作一个叫做渲染页面的 function
      //这个 function 首先判断我们本地的数据, 有些数据可能没有, 有些数据可能超出很多.
      //根据页面上提供的元素的 ID 去进行抓取, 通过 document.querySelector 这样的方式选择对应的元素.
      //通过如下方式document.querySelector('#count-todos').textContent去把本地存储中对应的数值写入到 dom 元素中.
      //messageBoard这样的还算是简单, 对于 table 当中的数值, 可能会需要使用 for 循环去生成数组当中的元素,并赋予给 table 当中的对应位置.
    }
  });
  //页面渲染路由, 和服务器的功能路由, 不是一种路由. /user/me 和 /me 完全意思不同.
  requestForUserInfo.open("get", "http://localhost:3000/user/me", true);
  requestForUserInfo.setRequestHeader("Content-Type", "application/json");
  //这样,服务器就能通过 authentic 去检查 header 当中的 x-auth 当中的 token 字段了
  requestForUserInfo.setRequestHeader("x-auth", token);
  //纯 get 请求不需要任何内容
  requestForUserInfo.send();

  //可以同时给服务器的其他路由发送请求
  //查询区域时间签到的信息.
  const requestForPeriod = new XMLHttpRequest();
  requestForPeriod.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const periodData = JSON.parse(e.target.responseText);
      console.log(periodData);
      //这里需要的是如何根据返回的数据去进行渲染页面
    }
  });
  requestForPeriod.open("post", "http://localhost:3000/period", true);
  //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
  requestForPeriod.setRequestHeader("Content-Type", "application/json");
  requestForPeriod.setRequestHeader("x-auth", token);
  let periodObj = {
    dateStartMM: "1",
    dateStartDD: "1",
    dateStartYYYY: "2017",
    dateEndMM: "2",
    dateEndDD: "2",
    dateEndYYYY: "2017"
  };
  //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
  requestForPeriod.send(JSON.stringify(periodObj));

  //查询该员工所对应的留言板内容.
  const requestForMessageBoard = new XMLHttpRequest();
  requestForMessageBoard.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const messageBoardData = JSON.parse(e.target.responseText);
      console.log(messageBoardData);
      //这里需要的是如何根据返回的数据去进行渲染页面
    }
  });
  requestForMessageBoard.open(
    "get",
    "http://localhost:3000/user/messageBoard",
    true
  );
  //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
  requestForMessageBoard.setRequestHeader("Content-Type", "application/json");
  requestForMessageBoard.setRequestHeader("x-auth", token);
  requestForMessageBoard.send();
};
