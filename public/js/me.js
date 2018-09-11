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

let renderPeriod = periodData => {
  //首先拿到数组, 然后遍历数组的每一个元素, 可以得知每一个工作日的信息.并进行渲染.
  //对数组进行重新排序. 根据他们的返回日期.
  periodData.sort(function(a, b) {
    return a.signIn - b.signIn;
  });

  //检查是否存在今天的记录, 如果存在则进行设置 clock in 的 message 区域.
  let setClockInMessage = function(periodData) {
    let todayRecord = periodData.filter(element => {
      //最近七天的记录中, 如果某一天的日期和今天是一样的,代表已经签过到.
      return (
        moment(moment.unix(element.signIn)).format("MM-DD-YYYY") ===
        moment().format("MM-DD-YYYY")
      );
    });
    //如果今天存在记录, 则进行渲染给 clock In 的 message 区域.
    if (todayRecord[0]) {
      document.querySelector(
        "#todayRecord"
      ).textContent = `You have been signIn today.`;
    } else {
      document.querySelector("#todayRecord").textContent = "";
    }
  };
  setClockInMessage(periodData);

  //设置时间段, 一般是一个星期的显示
  let showPeriodTime = () => {
    let today = moment();
    let theDayBeforeToday7 = moment().subtract(7, "days");
    document.querySelector(
      "#showPeriodTime"
    ).textContent = `From ${theDayBeforeToday7.format(
      "MMM D"
    )} to ${today.format("MMM D")}`;
  };
  showPeriodTime(periodData);

  periodData.forEach(element => {
    //创建 table 的 tr 元素以及其子元素
    let tabletr = document.createElement("tr");
    let tablethWeek = document.createElement("th");
    let tabletdDate = document.createElement("td");
    let tabletdSignIn = document.createElement("td");
    let tabletdSignOut = document.createElement("td");
    let tabletdHours = document.createElement("td");
    let tabletdMins = document.createElement("td");
    let tabletdDrinks = document.createElement("td");
    let tabletdApptizers = document.createElement("td");
    let tabletdNotes = document.createElement("td");

    //为 tr 的子元素添加内容和属性
    //需要根据回传的数据进行设置内容. 需要允许内容为空是渲染一行空, 但是 week 需要有内容显示周几或者几号.
    tablethWeek.textContent = moment.unix(element.signIn).format("ddd");
    tabletdDate.innerHTML = moment.unix(element.signIn).format("MMM D");
    tabletdDate.setAttribute("class", "text-nowrap");
    tablethWeek.setAttribute("scope", "row");
    tabletdSignIn.innerHTML = moment.unix(element.signIn).format("HH:mm");
    tabletdSignOut.innerHTML = moment.unix(element.signOut).format("HH:mm");
    tabletdHours.innerHTML = Math.floor(element.hours / 3600);
    tabletdMins.innerHTML =
      (element.hours / 3600 - Math.floor(element.hours / 3600)) * 60;
    tabletdDrinks.innerHTML = element.drink;
    tabletdApptizers.innerHTML = element.apptizer;
    tabletdNotes.innerHTML = element.note;
    tabletdNotes.setAttribute("class", "text-nowrap");

    //添加 tr 的子元素给与 tr
    tabletr.appendChild(tablethWeek);
    tabletr.appendChild(tabletdDate);
    tabletr.appendChild(tabletdSignIn);
    tabletr.appendChild(tabletdSignOut);
    tabletr.appendChild(tabletdHours);
    tabletr.appendChild(tabletdMins);
    tabletr.appendChild(tabletdDrinks);
    tabletr.appendChild(tabletdApptizers);
    tabletr.appendChild(tabletdNotes);

    //将 tr 添加到table 当中进行显示出来
    document.querySelector("#table-body").appendChild(tabletr);
  });
};

let renderMessageBoard = function(messageBoardData) {
  if (messageBoardData.managerMessage) {
    document.querySelector("#managerBoard").textContent = `${
      messageBoardData.managerMessage.message
    }`;
    document.querySelector("#managerBoardInfo").textContent = `Manager ${
      messageBoardData.managerMessage.username
    } said at ${moment
      .unix(messageBoardData.managerMessage.timeStamp)
      .format("MMM D HH:mm")}`;
  } else {
    document.querySelector("#managerBoard").textContent = "";
  }
  if (messageBoardData.frontMessage) {
    document.querySelector("#frontBoard").textContent = `${
      messageBoardData.frontMessage.message
    }`;
    document.querySelector("#frontBoardInfo").textContent = `Front stuff ${
      messageBoardData.frontMessage.username
    } said at ${moment
      .unix(messageBoardData.frontMessage.timeStamp)
      .format("MMM D HH:mm")}`;
  } else {
    document.querySelector("#frontBoard").textContent = "";
  }
  if (messageBoardData.kitchenMessage) {
    document.querySelector("#kitchenBoard").textContent = `${
      messageBoardData.kitchenMessage.message
    }`;
    document.querySelector("#kitchenBoardInfo").textContent = `Kitchen stuff ${
      messageBoardData.kitchenMessage.username
    } said at ${moment
      .unix(messageBoardData.kitchenMessage.timeStamp)
      .format("MMM D HH:mm")}`;
  } else {
    document.querySelector("#kitchenBoard").textContent = "";
  }
};

let renderMe = localData => {
  if (localData.username) {
    document.querySelector("#username").textContent = `Welcome, ${
      localData.username
    }!`;
  }
  //只有员工的工作记录是数组, 存在长度
  if (localData.length > 0) {
    renderPeriod(localData);
  }
  if (
    localData.managerMessage ||
    localData.frontMessage ||
    localData.kitchenMessage
  ) {
    renderMessageBoard(localData);
  }
};

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
      saveToLocal("userInfoData", userInfoData);
      //制作一个叫做渲染页面的 function
      renderMe(userInfoData);
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
      saveToLocal("periodData", periodData);
      renderMe(periodData);
    }
  });
  requestForPeriod.open("post", "http://localhost:3000/period", true);
  //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
  requestForPeriod.setRequestHeader("Content-Type", "application/json");
  requestForPeriod.setRequestHeader("x-auth", token);
  //获取今天的日期通过 moment.js, 并且推算出前一周的日期
  let today = moment();
  let theDayBeforeToday7 = moment().subtract(7, "days");
  let periodObj = {
    dateStartMM: theDayBeforeToday7.get("month") + 1,
    dateStartDD: theDayBeforeToday7.get("date"),
    dateStartYYYY: theDayBeforeToday7.get("year"),
    dateEndMM: today.get("month") + 1,
    dateEndDD: today.get("date"),
    dateEndYYYY: today.get("year")
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
      saveToLocal("messageBoardData", messageBoardData);
      renderMe(messageBoardData);
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
