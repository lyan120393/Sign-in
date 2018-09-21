console.log(`me.js has connected`);
//hash使用 substring(1)减去前面的#符号.
const token = location.hash.substring(1);
// `${serverAddress}`
const serverAddress = "https://sleepy-citadel-66405.herokuapp.com";
// console.log(token);
//拿到 token 之后, 在页面进行加载的时候, 就会去访问服务器的/user/me 的路由去获得需要的一切信息.

//所有需要点击的按钮的必备内容
document.querySelector("#manager-btn").addEventListener("click", function(e) {
  e.preventDefault();
  //从这里开始写点击按钮之后的业务代码
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
  // console.log(todayRecord);
  //如果今天存在记录, 则进行渲染给 clock In 的 message 区域.
  if (todayRecord[0]) {
    if (todayRecord[0].signIn && !todayRecord[0].signOut) {
      document.querySelector(
        "#todayRecord"
      ).textContent = `SignIn Success. Don't forget to signOut`;
    } else if (todayRecord[0].signOut) {
      document.querySelector("#todayRecord").textContent = `SignOut success`;
    } else {
      document.querySelector("#todayRecord").textContent = "";
    }
  }
};
let setClockInMessagePassedByMoment = function(unixtime) {
  //把传入的时刻和今天进行对比, 如果一致则为真, 代表今天已经被签到了.
  //如果今天存在记录, 则进行渲染给 clock In 的 message 区域.
  if (
    moment(moment.unix(unixtime)).format("MM-DD-YYYY") ===
    moment().format("MM-DD-YYYY")
  ) {
    document.querySelector(
      "#todayRecord"
    ).textContent = `SignIn Success. Don't forget to signOut`;
  } else {
    document.querySelector("#todayRecord").textContent = "";
  }
};

//设置时间段, 一般是一个星期的显示
let showPeriodTime = () => {
  let today = moment();
  let theDayBeforeToday7 = moment().subtract(7, "days");
  document.querySelector(
    "#showPeriodTime"
  ).textContent = `From ${theDayBeforeToday7.format("MMM D")} to ${today.format(
    "MMM D"
  )}`;
};

let renderPeriod = periodData => {
  //首先拿到数组, 然后遍历数组的每一个元素, 可以得知每一个工作日的信息.并进行渲染.
  //对数组进行重新排序. 根据他们的返回日期.
  periodData.sort(function(a, b) {
    return a.signIn - b.signIn;
  });
  console.log(periodData);

  //检查是否存在今天的记录, 如果存在则进行设置 clock in 的 message 区域.
  setClockInMessage(periodData);

  showPeriodTime();

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
    let tabletdEdit = document.createElement("td");
    let tabletdDelete = document.createElement("td");
    //创建日期表格上面的 edit 和 delete 的按钮.
    let tableEditButton = document.createElement("button");
    let tableDeleteButton = document.createElement("button");
    //给按钮设置属性
    tableEditButton.setAttribute("class", "btn");
    tableEditButton.setAttribute("class", "btn-warning");
    tableEditButton.setAttribute("type", "button");
    tableEditButton.textContent = "Edit";
    //点击按钮之后, 弹出的 modal 的连接
    tableEditButton.setAttribute("data-toggle", "modal");
    tableEditButton.setAttribute("data-target", "#editModal");

    tableDeleteButton.setAttribute("class", "btn");
    tableDeleteButton.setAttribute("class", "btn-danger");
    tableDeleteButton.setAttribute("type", "button");
    tableDeleteButton.textContent = "Delete";
    //给按钮设置行为
    tableEditButton.addEventListener("click", function(e) {
      //点击 edit 按钮之后, 把所有的数据内容都赋值给 modal .
      document.querySelector("#editModal-month").value = moment
        .unix(element.signIn)
        .format("MM");
      document.querySelector("#editModal-day").value = moment
        .unix(element.signIn)
        .format("DD");
      document.querySelector("#editModal-year").value = moment
        .unix(element.signIn)
        .format("YYYY");
      document.querySelector("#editModal-InHH").value = moment
        .unix(element.signIn)
        .format("HH");
      document.querySelector("#editModal-Inmm").value = moment
        .unix(element.signIn)
        .format("mm");
      document.querySelector("#editModal-OutHH").value = moment
        .unix(element.signOut)
        .format("HH");
      document.querySelector("#editModal-Outmm").value = moment
        .unix(element.signOut)
        .format("mm");
      document.querySelector("#editModal-apptizer").value = element.apptizer;
      document.querySelector("#editModal-drink").value = element.drink;
      document.querySelector("#editModal-notes").value = element.note;
      // console.log(moment.unix(element.signIn).format("MMM D"));
    });
    tableDeleteButton.addEventListener("click", function(e) {
      let deleteObj = {};
      deleteObj.dateMM = moment.unix(element.signIn).format("MM");
      deleteObj.dateDD = moment.unix(element.signIn).format("DD");
      deleteObj.dateYYYY = moment.unix(element.signIn).format("YYYY");

      const requestForDelete = new XMLHttpRequest();
      requestForDelete.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          console.log(e.target.responseText);
          const theDeleteDate = JSON.parse(e.target.responseText);
          //如果成功的拿到了这一天的数据, 我们可以如下操作.
          //获取今天的日期通过 moment.js, 并且推算出前一周的日期
          let today = moment();
          let theDayBeforeToday7 = moment().subtract(7, "days");
          //进行判断, 如果这一天的数据和今天的日期之间相差在7天以内, 我们需要给 period 路由发送请求, 获取最新的 perioddata
          //如果这一天的数据, 和今天的日期相差超过了7天, 就不需要在获得最新的 perioddata 内容.
          let todayFormat = today.format("YYYY-MM-DD");
          let theDayBeforeToday7Format = theDayBeforeToday7.format(
            "YYYY-MM-DD"
          );
          let theDay = moment
            .unix(theDeleteDate.deleteUnix)
            .format("YYYY-MM-DD");
          console.log(todayFormat, theDayBeforeToday7Format, theDay);
          if (
            moment(theDay).isBetween(
              theDayBeforeToday7Format,
              todayFormat,
              null,
              []
            )
          ) {
            //     //这一天是距离今天七天以内的日期
            console.log(`between 7 days`);
            const requestForPeriod = new XMLHttpRequest();
            requestForPeriod.addEventListener("readystatechange", function(e) {
              if (e.target.readyState === 4) {
                const periodData = JSON.parse(e.target.responseText);
                // console.log(periodData);
                saveToLocal("periodData", periodData);
                //这里需要的是如何根据返回的数据去进行渲染页面
                let timeTable = document.querySelector("#table-body");
                while (timeTable.firstChild) {
                  timeTable.removeChild(timeTable.firstChild);
                }
                renderMe(periodData);
              }
            });
            requestForPeriod.open("post", `${serverAddress}/period`, true);
            //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
            requestForPeriod.setRequestHeader(
              "Content-Type",
              "application/json"
            );
            requestForPeriod.setRequestHeader("x-auth", token);
            let periodObj = {
              dateStartMM: theDayBeforeToday7.get("month") + 1,
              dateStartDD: theDayBeforeToday7.get("date"),
              dateStartYYYY: theDayBeforeToday7.get("year"),
              dateEndMM: today.get("month") + 1,
              dateEndDD: today.get("date"),
              dateEndYYYY: today.get("year")
            };
            // console.log(`periodObj is ${JSON.stringify(periodObj)}`);
            //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
            requestForPeriod.send(JSON.stringify(periodObj));
          }
        }
      });
      requestForDelete.open("delete", `${serverAddress}/deleteRecord`, true);
      requestForDelete.setRequestHeader("Content-Type", "application/json");
      requestForDelete.setRequestHeader("x-auth", token);
      console.log(JSON.stringify(deleteObj));
      requestForDelete.send(JSON.stringify(deleteObj));
    });
    //为 tr 的子元素添加内容和属性
    //需要根据回传的数据进行设置内容. 需要允许内容为空是渲染一行空, 但是 week 需要有内容显示周几或者几号.
    tablethWeek.textContent = moment.unix(element.signIn).format("ddd");
    tabletdDate.innerHTML = moment.unix(element.signIn).format("MMM D");
    tabletdDate.setAttribute("class", "text-nowrap");
    tablethWeek.setAttribute("scope", "row");
    tabletdSignIn.innerHTML = moment.unix(element.signIn).format("HH:mm");
    if (!element.signOut) {
      tabletdSignOut.innerHTML = "N/A";
    } else {
      tabletdSignOut.innerHTML = moment.unix(element.signOut).format("HH:mm");
    }
    if (!element.hours) {
      tabletdHours.innerHTML = "N/A";
      tabletdMins.innerHTML = "N/A";
    } else {
      tabletdHours.innerHTML = Math.floor(element.hours / 3600);
      tabletdMins.innerHTML = (
        (element.hours / 3600 - Math.floor(element.hours / 3600)) *
        60
      ).toFixed();
    }
    if (!element.drink) {
      tabletdDrinks.innerHTML = "N/A";
    } else {
      tabletdDrinks.innerHTML = element.drink;
    }
    if (!element.apptizer) {
      tabletdApptizers.innerHTML = "N/A";
    } else {
      tabletdApptizers.innerHTML = element.apptizer;
    }
    tabletdNotes.setAttribute("class", "text-nowrap");
    if (!element.note) {
      tabletdNotes.innerHTML = "N/A";
    } else {
      tabletdNotes.innerHTML = element.note;
    }
    //给 edit 和 delete button 添加事件
    tabletdEdit.appendChild(tableEditButton);
    tabletdDelete.appendChild(tableDeleteButton);
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
    tabletr.appendChild(tabletdEdit);
    tabletr.appendChild(tabletdDelete);

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

//检测指定日期是否有签到的记录
let checkSignIn = function(time) {
  return new Promise((resolve, reject) => {
    let checkSignInObj = {
      dateMM: moment(time).format("MM"),
      dateDD: moment(time).format("DD"),
      dateYYYY: moment(time).format("YYYY")
      // dateMM: 9,
      // dateDD: 12,
      // dateYYYY: 2018
    };
    const requestForCheck = new XMLHttpRequest();
    requestForCheck.addEventListener("readystatechange", function(e) {
      if (e.target.readyState === 4) {
        let result = e.target.responseText;
        if (result === "the day not found") {
          //没有找到这一天的签到记录,
          //如果是 signIn, 将执行签到程序,
          //如果是 SignOut, 拒绝SignOut, 并提示 signIn 先.
          // console.log(result);
          reject(result);
        } else {
          // result = JSON.parse(result);
          // 如果是 SignIn 功能, 找到了这一天的工作记录, 把工作记录显示在 modal 上面.
          // 如果是 SignOut 功能,找到这一天的工作记录之后, 查看是否 signOut 字段有信息,如果有则显示信息在 modal 上.如果没有则进行SignOut 程序.
          result = JSON.parse(result);
          resolve(result);
          // console.log(`the day is ${result}`);
        }
      }
    });
    requestForCheck.open("post", `${serverAddress}/editcheck`, true);
    requestForCheck.setRequestHeader("Content-Type", "application/json");
    requestForCheck.setRequestHeader("x-auth", token);
    requestForCheck.send(JSON.stringify(checkSignInObj));
  });
};

//根据接收到的数据类型进行渲染页面的操作.
let renderMe = localData => {
  if (localData.username) {
    document.querySelector("#username").textContent = `Welcome, ${
      localData.username
    }!`;
    //渲染页面上的Message 按钮为 disable 根据用户的权限.
    if (!localData.role.manager) {
      document.querySelector("#manager-btn").setAttribute("disabled", "");
    }
    if (!localData.role.front) {
      document.querySelector("#front-btn").setAttribute("disabled", "");
    }
    if (!localData.role.kitchen) {
      document.querySelector("#kitchen-btn").setAttribute("disabled", "");
    }
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
    // console.log(`remderMe is called`);
    renderMessageBoard(localData);
  }
};

let calculateTimeAfter = function(time) {
  //接受一个 moment() 对象, 返回一个 moment()对象.
  let timeAfter;
  // console.log(`Start calculate timeAfter`);
  let counter = 0;
  do {
    counter++;
    timeAfter = moment(time).add(counter, "minutes");
  } while (!Number.isInteger(Number(timeAfter.format("mm")) / 5));
  // console.log(
  //   `Number.isInteger(Number(timeAfter.format("mm")) / 5) is ${!Number.isInteger(
  //     Number(timeAfter.format("mm")) / 5
  //   )}`
  // );
  // console.log(`the new result of timeAfter is ${timeAfter.format("HH:mm")}`);
  return timeAfter;
};

let calculateTimeBefore = function(time) {
  //接受一个 moment() 对象, 返回一个 moment()对象.
  let timeBefore;
  // console.log(`Start calculate timeBefore`);
  counter = 0;
  do {
    counter++;
    timeBefore = moment(time).subtract(counter, "minutes");
  } while (!Number.isInteger(Number(timeBefore.format("mm")) / 5));
  // console.log(
  //   `Number.isInteger(Number(timeBefore.format("mm")) / 5) is ${!Number.isInteger(
  //     Number(timeBefore.format("mm")) / 5
  //   )}`
  // );
  // console.log(`the new result of timeBefore is ${timeBefore.format("HH:mm")}`);
  return timeBefore;
};

let nearTime = function(time) {
  //假设 time 12:01
  // let time = moment.unix(1536710400);
  let timeBefore;
  let timeAfter;
  let timeNearst;
  let result;
  //得到一个分钟的时间, 这个是原始的时间. 01,29 32这样的时间.
  // console.log(`Origional time is ${moment(time).format("HH:mm")}`);
  //判断如果 result 为整数, 那么则确定是五的倍数, 否则就不是, 但是0不能除以任何数.
  //需要提前判断如果分钟数等于00, 则直接设定为显示的结果.不可以进行除法运算.
  if (moment(time).format("mm") != "00") {
    //使用除法将分钟数除以5,
    result = Number(moment(time).format("mm")) / 5;
    // console.log(`Number(moment(time).format("mm")) / 5 is ${result}`);
    if (Number.isInteger(result)) {
      console.log(`result is integer`);
      timeAfter = calculateTimeAfter(time);
      timeBefore = calculateTimeBefore(time);
      timeNearst = moment(time);
      // console.log(`timeNearst is ${timeNearst.format("mm")}`);
    } else {
      console.log(`result is Not integer`);
      //现在进行计算 timeAfter
      timeAfter = calculateTimeAfter(time);
      //现在进行计算 timeBefore
      timeBefore = calculateTimeBefore(time);
      //现在进行计算 timeNearst
      timeNearst = moment(time);
      // console.log(`timeNearst is ${timeNearst.format("mm")}`);
    }
  } else {
    console.log(`Time end with 00`);
    //这个时间就是5的倍数,但是是00, 不可除法运算.
    timeAfter = calculateTimeAfter(time);
    timeBefore = calculateTimeBefore(time);
    timeNearst = moment(time);
    // console.log(`timeNearst is ${timeNearst.format("mm")}`);
  }
  //总和检查一下各种数据.
  console.log(`timeAfter is ${timeAfter.format("HH:mm")}`);
  console.log(`timeBefore is ${timeBefore.format("HH:mm")}`);
  console.log(`timeNearst is ${timeNearst.format("HH:mm")}`);
  return {
    timeAfter: timeAfter,
    timeNearst: timeNearst,
    timeBefore: timeBefore
  };
};

// statistic 页面的按钮
document.querySelector("#statistic-btn").addEventListener("click", function(e) {
  location.assign(`/statistic#${token}`);
});

//clock In 的五个按钮
//sign In 按钮
document.querySelector("#signIn-btn").addEventListener("click", function(e) {
  e.preventDefault();
  //获取时间点
  ///signIn路由只支持输入 HH mm, 所以必须当天签入, 当天签出.
  let time = moment();
  // console.log(`HH is ${moment(time).format("HH")}`);
  // console.log(`mm is ${moment(time).format("mm")}`);

  //向服务器发送请求查看当天是否已经存在过签到记录, 如果有则在 modal 中提示, 今天已经签到了.
  checkSignIn(time)
    .then(result => {
      //找到这一天的签到记录, 把信息显示在 modal 上面.
      //隐藏签到时间的按钮
      document
        .querySelector("#signInModal-SignInAvaTime")
        .setAttribute("class", "d-none");
      document.querySelector(
        "#signInModal-SignedInInfo-signIn"
      ).textContent = `signIn: ${moment.unix(result.signIn).format("HH:mm")}`;
      if (result.signOut) {
        document.querySelector(
          "#signInModal-SignedInInfo-signOut"
        ).textContent = `signOut: ${moment
          .unix(result.signOut)
          .format("HH:mm")}`;
        document.querySelector(
          "#signInModal-SignedInInfo-hours"
        ).textContent = `Hours: ${Math.floor(result.hours / 3600)} hours ${(
          (result.hours / 3600 - Math.floor(result.hours / 3600)) *
          60
        ).toFixed()} mins`;
        document.querySelector(
          "#signInModal-SignedInInfo-apptizer"
        ).textContent = `apptizer: ${result.apptizer}`;
        document.querySelector(
          "#signInModal-SignedInInfo-drink"
        ).textContent = `drink: ${result.drink}`;
        document.querySelector(
          "#signInModal-SignedInInfo-note"
        ).textContent = `note: ${result.note}`;
        document
          .querySelector("#signInModal-SignedInInfo")
          .setAttribute("class", "row");
      }
    })
    .catch(e => {
      //没有找到这一天的签到记录, 将执行签到程序.
      //如果没有签到记录, 弹出一个 modal 窗口,根据点击的时间段进行判断相关的时间点,  弹出三个带有时间的按钮,前后误差不超过5-10分钟的那种.
      //选择某个按钮之后, 执行真正的签到程序, 开始向服务器发送签到请求.
      //如果成功, 那么带着返回的信息区域的内容, 渲染页面即可.
      if (e === "the day not found") {
        //把显示已经签到过的内容设置为隐藏.
        document
          .querySelector("#signInModal-SignedInInfo")
          .setAttribute("class", "d-none");
        //根据当前的时间去计算最近的三个时间点.
        let threeTimes = nearTime(time);
        //现在根据上面获得的三个时间数据(threeTimes 对象), 去渲染 modal 中对应按钮显示的时间点.
        document.querySelector(
          "#signInModal-timeBtn-before"
        ).textContent = threeTimes.timeBefore.format("HH:mm");
        document.querySelector(
          "#signInModal-timeBtn-nearest"
        ).textContent = threeTimes.timeNearst.format("HH:mm");
        document.querySelector(
          "#signInModal-timeBtn-after"
        ).textContent = threeTimes.timeAfter.format("HH:mm");
      } else {
        console.log(`Other Error when use checkSignIn() ${e}`);
      }
    });
});
//根据传入的textContent 中的内容进行拆分时间, 并得到 HH 和 mm.
let timeDivider = function(textContent) {
  let HH = moment(textContent, "HH:mm").format("HH");
  let mm = moment(textContent, "HH:mm").format("mm");
  return { HH, mm };
};
//判断传入的日期是否是在今天和七天前范围之中的日期, 如果是则重新渲染页面,
let updateIfBetweenSevenDay = function(unixTime) {
  let today = moment();
  let theDayBeforeToday7 = moment().subtract(7, "days");
  //进行判断, 如果这一天的数据和今天的日期之间相差在7天以内, 我们需要给 period 路由发送请求, 获取最新的 perioddata
  //如果这一天的数据, 和今天的日期相差超过了7天, 就不需要在获得最新的 perioddata 内容.
  let todayFormat = today.format("YYYY-MM-DD");
  let theDayBeforeToday7Format = theDayBeforeToday7.format("YYYY-MM-DD");
  let theDay = moment.unix(unixTime).format("YYYY-MM-DD");
  console.log(todayFormat, theDayBeforeToday7Format, theDay);
  if (
    moment(theDay).isBetween(theDayBeforeToday7Format, todayFormat, null, [])
  ) {
    //这一天是距离今天七天以内的日期
    console.log(`between 7 days`);
    const requestForPeriod = new XMLHttpRequest();
    requestForPeriod.addEventListener("readystatechange", function(e) {
      if (e.target.readyState === 4) {
        const periodData = JSON.parse(e.target.responseText);
        // console.log(periodData);
        saveToLocal("periodData", periodData);
        //这里需要的是如何根据返回的数据去进行渲染页面
        let timeTable = document.querySelector("#table-body");
        while (timeTable.firstChild) {
          timeTable.removeChild(timeTable.firstChild);
        }
        renderMe(periodData);
      }
    });
    requestForPeriod.open("post", `${serverAddress}/period`, true);
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
  }
};
//给 SignIn 的三个小按钮, 添加向服务器发送请求.
document
  .querySelector("#signInModal-timeBtn-before")
  .addEventListener("click", function(e) {
    let signInObj = timeDivider(e.target.textContent);
    console.log(signInObj);

    const requestForSignIn = new XMLHttpRequest();
    requestForSignIn.addEventListener("readystatechange", function(e) {
      if (e.target.readyState === 4) {
        $("#signInModal").modal("hide");
        console.log(e.target.responseText);
        let signInRecord = JSON.parse(e.target.responseText);
        setClockInMessagePassedByMoment(signInRecord.signInTime);
        ///
        updateIfBetweenSevenDay(signInRecord.signInTime);
        ///
      }
    });
    requestForSignIn.open("post", `${serverAddress}/signIn`, true);
    requestForSignIn.setRequestHeader("Content-Type", "application/json");
    requestForSignIn.setRequestHeader("x-auth", token);
    requestForSignIn.send(JSON.stringify(signInObj));
  });
document
  .querySelector("#signInModal-timeBtn-nearest")
  .addEventListener("click", function(e) {
    let signInObj = timeDivider(e.target.textContent);
    console.log(signInObj);

    const requestForSignIn = new XMLHttpRequest();
    requestForSignIn.addEventListener("readystatechange", function(e) {
      if (e.target.readyState === 4) {
        $("#signInModal").modal("hide");
        console.log(e.target.responseText);
        let signInRecord = JSON.parse(e.target.responseText);
        setClockInMessagePassedByMoment(signInRecord.signInTime);
        updateIfBetweenSevenDay(signInRecord.signInTime);
      }
    });
    requestForSignIn.open("post", `${serverAddress}/signIn`, true);
    requestForSignIn.setRequestHeader("Content-Type", "application/json");
    requestForSignIn.setRequestHeader("x-auth", token);
    requestForSignIn.send(JSON.stringify(signInObj));
  });
document
  .querySelector("#signInModal-timeBtn-after")
  .addEventListener("click", function(e) {
    let signInObj = timeDivider(e.target.textContent);
    console.log(signInObj);

    const requestForSignIn = new XMLHttpRequest();
    requestForSignIn.addEventListener("readystatechange", function(e) {
      if (e.target.readyState === 4) {
        $("#signInModal").modal("hide");
        console.log(e.target.responseText);
        let signInRecord = JSON.parse(e.target.responseText);
        setClockInMessagePassedByMoment(signInRecord.signInTime);
        updateIfBetweenSevenDay(signInRecord.signInTime);
      }
    });
    requestForSignIn.open("post", `${serverAddress}/signIn`, true);
    requestForSignIn.setRequestHeader("Content-Type", "application/json");
    requestForSignIn.setRequestHeader("x-auth", token);
    requestForSignIn.send(JSON.stringify(signInObj));
  });

//sign Out 按钮
document.querySelector("#signOut-btn").addEventListener("click", function(e) {
  e.preventDefault();
  //获取时间点
  let time = moment();
  checkSignIn(time)
    .then(result => {
      //找到签到记录, 检查 signOut 记录是否有值, 如果有则显示无法 SignOut.
      if (result.signOut) {
        //如果 signOut 记录存在.
        document
          .querySelector("#signOutModal-SignedInInfo")
          .setAttribute("class", "row");
        document
          .querySelector("#signOutModal-signInFirst")
          .setAttribute("class", "d-none");
        document
          .querySelector("#signOutModal-SignOutAvaTime")
          .setAttribute("class", "d-none");
        document
          .querySelector("#signOutModal-SignOutOthers")
          .setAttribute("class", "d-none");
        document.querySelector(
          "#signOutModal-SignedInInfo-signIn"
        ).textContent = `signIn: ${moment.unix(result.signIn).format("HH:mm")}`;
        document.querySelector(
          "#signOutModal-SignedInInfo-signOut"
        ).textContent = `signOut: ${moment
          .unix(result.signOut)
          .format("HH:mm")}`;
        document.querySelector(
          "#signOutModal-SignedInInfo-hours"
        ).textContent = `Hours: ${Math.floor(result.hours / 3600)} hours ${(
          (result.hours / 3600 - Math.floor(result.hours / 3600)) *
          60
        ).toFixed()} mins`;
        if (result.apptizer) {
          document.querySelector(
            "#signOutModal-SignedInInfo-apptizer"
          ).textContent = `apptizer: ${result.apptizer}`;
        }
        if (result.drink) {
          document.querySelector(
            "#signOutModal-SignedInInfo-drink"
          ).textContent = `drink: ${result.drink}`;
        }
        if (result.note) {
          document.querySelector(
            "#signOutModal-SignedInInfo-note"
          ).textContent = `note: ${result.note}`;
        }
      } else {
        //如果有记录, 也就是说有 signIn 的记录,但是没有 signOut 的记录, 则进行 signOut 程序.
        //如果 signOut 记录不存在.
        //如果 signOut 没有值, 则进行 signOut 程序.
        console.log(`select your signOut time`);
        document
          .querySelector("#signOutModal-signInFirst")
          .setAttribute("class", "d-none");
        document
          .querySelector("#signOutModal-SignedInInfo")
          .setAttribute("class", "d-none");
        document
          .querySelector("#signOutModal-SignOutOthers")
          .setAttribute("class", "row");
        // 设置样式的时候, d-block 起到显示作用, 但是会重置所有 class 属性为 d-block
        document
          .querySelector("#signOutModal-SignOutAvaTime")
          .setAttribute("class", "row");
        //根据当前的时间 time 去计算下班时间. 也是大概前后5分钟的, 跟 signIn 是一样的逻辑.
        let threeTimes = nearTime(time);
        //现在根据上面获得的三个时间数据(threeTimes 对象), 去渲染 modal 中对应按钮显示的时间点.
        document.querySelector(
          "#signOutModal-timeBtn-before"
        ).textContent = threeTimes.timeBefore.format("HH:mm");
        document.querySelector(
          "#signOutModal-timeBtn-nearest"
        ).textContent = threeTimes.timeNearst.format("HH:mm");
        document.querySelector(
          "#signOutModal-timeBtn-after"
        ).textContent = threeTimes.timeAfter.format("HH:mm");
      }
    })
    .catch(e => {
      //如果发生错误, 检查是否是 the day not found, 如果是的话, 提示先SignIn, 才能 SignOut.
      if (e === "the day not found") {
        console.log(`You need signIn first before signOut`);
        document
          .querySelector("#signOutModal-SignOutAvaTime")
          .setAttribute("class", "d-none");
        document
          .querySelector("#signOutModal-SignedInInfo")
          .setAttribute("class", "d-none");
        document
          .querySelector("#signOutModal-SignOutOthers")
          .setAttribute("class", "d-none");
      } else {
        console.log(`Other Error when use checkSignIn() ${e}`);
      }
    });
  //向服务器发送请求, 查看今天的工作记录中是否存在 signOut 的记录, 如果有则显示工作日的信息 在 modal 中.(根据请求结果渲染 modal 在页面上)
  //如果没有signOut 记录, 弹出一个 modal 窗口,根据点击的时间段进行判断相关的时间点,  弹出三个带有时间的按钮(以及一个可以自由设置 sign out 的时间功能), signOut 不存在误差的问题.
  //选择某个按钮之后, 或者选择好了一个时间点击 submit 之后, 执行真正的signOut程序, 开始向服务器发送signOut请求.
  //如果成功, 那么带着返回的信息区域的内容, 渲染页面即可.
});
//signOut Modal 当中的三个小按钮.
document
  .querySelector("#signOutModal-timeBtn-before")
  .addEventListener("click", function(e) {
    let signOutObj = timeDivider(e.target.textContent);
    //signOut 不仅仅需要的是 sign Out 的时间, 还需要小吃, 饮料和 note
    signOutObj.apptizer = document.querySelector(
      "#SignOutModal-apptizer"
    ).value;
    signOutObj.drink = document.querySelector("#SignOutModal-drink").value;
    signOutObj.note = document.querySelector("#SignOutModal-notes").value;
    //进行数据验证
    let resultValidator = foodValidator(
      Number(signOutObj.apptizer),
      Number(signOutObj.drink)
    );
    if (resultValidator === true) {
      //清空不合法的数据提示
      document.querySelector("#signOutModal-noticedInfo").textContent = ``;
      // console.log(signOutObj);
      const requestForSignOut = new XMLHttpRequest();
      requestForSignOut.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          $("#signOutModal").modal("hide");
          // console.log(e.target.responseText);
          let signInRecord = JSON.parse(e.target.responseText);
          setClockInMessagePassedByMoment(signInRecord.signIn);
          updateIfBetweenSevenDay(signInRecord.signIn);
        }
      });
      requestForSignOut.open("post", `${serverAddress}/signOut`, true);
      requestForSignOut.setRequestHeader("Content-Type", "application/json");
      requestForSignOut.setRequestHeader("x-auth", token);
      requestForSignOut.send(JSON.stringify(signOutObj));
    } else {
      console.log(`data invalid`);
      document.querySelector(
        "#signOutModal-noticedInfo"
      ).textContent = `Data Invalid`;
    }
  });
document
  .querySelector("#signOutModal-timeBtn-nearest")
  .addEventListener("click", function(e) {
    let signOutObj = timeDivider(e.target.textContent);
    //signOut 不仅仅需要的是 sign Out 的时间, 还需要小吃, 饮料和 note
    signOutObj.apptizer = document.querySelector(
      "#SignOutModal-apptizer"
    ).value;
    signOutObj.drink = document.querySelector("#SignOutModal-drink").value;
    signOutObj.note = document.querySelector("#SignOutModal-notes").value;
    // console.log(signOutObj);
    //进行数据验证
    let resultValidator = foodValidator(
      Number(signOutObj.apptizer),
      Number(signOutObj.drink)
    );
    if (resultValidator === true) {
      //清空不合法的数据提示
      document.querySelector("#signOutModal-noticedInfo").textContent = ``;
      // console.log(signOutObj);
      const requestForSignOut = new XMLHttpRequest();
      requestForSignOut.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          $("#signOutModal").modal("hide");
          // console.log(e.target.responseText);
          let signInRecord = JSON.parse(e.target.responseText);
          setClockInMessagePassedByMoment(signInRecord.signIn);
          updateIfBetweenSevenDay(signInRecord.signIn);
        }
      });
      requestForSignOut.open("post", `${serverAddress}/signOut`, true);
      requestForSignOut.setRequestHeader("Content-Type", "application/json");
      requestForSignOut.setRequestHeader("x-auth", token);
      requestForSignOut.send(JSON.stringify(signOutObj));
    } else {
      console.log(`data invalid`);
      document.querySelector(
        "#signOutModal-noticedInfo"
      ).textContent = `Data Invalid`;
    }
  });
document
  .querySelector("#signOutModal-timeBtn-after")
  .addEventListener("click", function(e) {
    let signOutObj = timeDivider(e.target.textContent);
    //signOut 不仅仅需要的是 sign Out 的时间, 还需要小吃, 饮料和 note
    signOutObj.apptizer = document.querySelector(
      "#SignOutModal-apptizer"
    ).value;
    signOutObj.drink = document.querySelector("#SignOutModal-drink").value;
    signOutObj.note = document.querySelector("#SignOutModal-notes").value;
    //进行数据验证
    let resultValidator = foodValidator(
      Number(signOutObj.apptizer),
      Number(signOutObj.drink)
    );
    if (resultValidator === true) {
      //清空不合法的数据提示
      document.querySelector("#signOutModal-noticedInfo").textContent = ``;
      // console.log(signOutObj);
      const requestForSignOut = new XMLHttpRequest();
      requestForSignOut.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          $("#signOutModal").modal("hide");
          // console.log(e.target.responseText);
          let signInRecord = JSON.parse(e.target.responseText);
          setClockInMessagePassedByMoment(signInRecord.signIn);
          updateIfBetweenSevenDay(signInRecord.signIn);
        }
      });
      requestForSignOut.open("post", `${serverAddress}/signOut`, true);
      requestForSignOut.setRequestHeader("Content-Type", "application/json");
      requestForSignOut.setRequestHeader("x-auth", token);
      requestForSignOut.send(JSON.stringify(signOutObj));
    } else {
      console.log(`data invalid`);
      document.querySelector(
        "#signOutModal-noticedInfo"
      ).textContent = `Data Invalid`;
    }
  });

//当页面加载的时候,我们可以执行的脚本.
window.onload = function() {
  const requestForUserInfo = new XMLHttpRequest();
  requestForUserInfo.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const userInfoData = JSON.parse(e.target.responseText);
      // console.log(JSON.stringify(userInfoData));
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
  requestForUserInfo.open("get", `${serverAddress}/user/me`, true);
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
      // console.log(periodData);
      //这里需要的是如何根据返回的数据去进行渲染页面
      saveToLocal("periodData", periodData);
      renderMe(periodData);
    }
  });
  requestForPeriod.open("post", `${serverAddress}/period`, true);
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
      // console.log(messageBoardData);
      //这里需要的是如何根据返回的数据去进行渲染页面
      saveToLocal("messageBoardData", messageBoardData);
      renderMe(messageBoardData);
    }
  });
  requestForMessageBoard.open(
    "get",
    `${serverAddress}/user/messageBoard`,
    true
  );
  //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
  requestForMessageBoard.setRequestHeader("Content-Type", "application/json");
  requestForMessageBoard.setRequestHeader("x-auth", token);
  requestForMessageBoard.send();
};

//给 Message Board 的三个按钮添加事件操作
document.querySelector("#manager-btn").addEventListener("click", function(e) {
  e.preventDefault();
  document.querySelector("#exampleModalLabel").textContent =
    "Edit Manager Message Board:";
});
document.querySelector("#front-btn").addEventListener("click", function(e) {
  e.preventDefault();
  document.querySelector("#exampleModalLabel").textContent =
    "Edit Front Message Board:";
});
document.querySelector("#kitchen-btn").addEventListener("click", function(e) {
  e.preventDefault();
  document.querySelector("#exampleModalLabel").textContent =
    "Edit Kitchen Message Board:";
});

//resign modal 当中的 submit 按钮, 点击之后会自动的隐藏 modal, 并获取 modal 中所有 input 当中的数据.
document
  .querySelector("#reSignInModal-submit")
  .addEventListener("click", function(e) {
    e.preventDefault();

    //获取该modal上面全部相关的数据
    let resignObj = {};
    //the data
    resignObj.signInDD = document.querySelector("#reSignInModal-day").value;
    resignObj.signInMM = document.querySelector("#reSignInModal-month").value;
    resignObj.signInYYYY = document.querySelector("#reSignInModal-year").value;
    resignObj.signOutDD = document.querySelector("#reSignInModal-day").value;
    resignObj.signOutMM = document.querySelector("#reSignInModal-month").value;
    resignObj.signOutYYYY = document.querySelector("#reSignInModal-year").value;
    //In time
    resignObj.signInHH = document.querySelector("#reSignInModal-InHH").value;
    resignObj.signInmm = document.querySelector("#reSignInModal-Inmm").value;
    //Out time
    resignObj.signOutHH = document.querySelector("#reSignInModal-OutHH").value;
    resignObj.signOutmm = document.querySelector("#reSignInModal-Outmm").value;
    //others
    resignObj.apptizer = document.querySelector(
      "#reSignInModal-apptizer"
    ).value;
    resignObj.drink = document.querySelector("#reSignInModal-drink").value;
    resignObj.note = document.querySelector("#reSignInModal-notes").value;

    //并把数据 set 为一个 obj, 这个是一个应对 resign 路由.
    // console.log(resignObj);

    //验证数据是否合法, 如果合法
    //检查确保数据的类型都是对的.
    let resultValidator1 = dateValidator(
      Number(resignObj.signInMM),
      Number(resignObj.signInDD),
      Number(resignObj.signInYYYY)
    );
    let resultValidator2 = dateValidator(
      Number(resignObj.signOutMM),
      Number(resignObj.signOutDD),
      Number(resignObj.signOutYYYY)
    );
    let resultValidator3 = hoursValidator(
      Number(resignObj.signInHH),
      Number(resignObj.signInmm)
    );
    let resultValidator4 = hoursValidator(
      Number(resignObj.signOutHH),
      Number(resignObj.signOutmm)
    );
    let resultValidator5 = foodValidator(
      Number(resignObj.apptizer),
      Number(resignObj.drink)
    );
    if (
      resultValidator1 === true &&
      resultValidator2 === true &&
      resultValidator3 === true &&
      resultValidator4 === true &&
      resultValidator5 === true
    ) {
      //重置错误提示
      document.querySelector("#resign-validatorInfo").textContent = ``;
      //隐藏 modal 模块
      $("#reSignInModal").modal("hide");
      //发送数据给服务器的 resign 路由.
      const requestForResign = new XMLHttpRequest();
      requestForResign.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          const theResignDate = JSON.parse(e.target.responseText);
          //如果成功的拿到了这一天的数据, 我们可以如下操作.
          //获取今天的日期通过 moment.js, 并且推算出前一周的日期
          let today = moment();
          let theDayBeforeToday7 = moment().subtract(7, "days");
          //进行判断, 如果这一天的数据和今天的日期之间相差在7天以内, 我们需要给 period 路由发送请求, 获取最新的 perioddata
          //如果这一天的数据, 和今天的日期相差超过了7天, 就不需要在获得最新的 perioddata 内容.
          let todayFormat = today.format("YYYY-MM-DD");
          let theDayBeforeToday7Format = theDayBeforeToday7.format(
            "YYYY-MM-DD"
          );
          let theDay = moment.unix(theResignDate.signIn).format("YYYY-MM-DD");
          console.log(todayFormat, theDayBeforeToday7Format, theDay);
          if (
            moment(theDay).isBetween(
              theDayBeforeToday7Format,
              todayFormat,
              null,
              []
            )
          ) {
            //这一天是距离今天七天以内的日期
            console.log(`between 7 days`);
            const requestForPeriod = new XMLHttpRequest();
            requestForPeriod.addEventListener("readystatechange", function(e) {
              if (e.target.readyState === 4) {
                const periodData = JSON.parse(e.target.responseText);
                // console.log(periodData);
                saveToLocal("periodData", periodData);
                //这里需要的是如何根据返回的数据去进行渲染页面
                let timeTable = document.querySelector("#table-body");
                while (timeTable.firstChild) {
                  timeTable.removeChild(timeTable.firstChild);
                }
                renderMe(periodData);
              }
            });
            requestForPeriod.open("post", `${serverAddress}/period`, true);
            //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
            requestForPeriod.setRequestHeader(
              "Content-Type",
              "application/json"
            );
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
          }
          //获得服务器返回的最新的 messageBoard 的信息

          // console.log(theResignDate);
          // saveToLocal("messageBoardData", messageBoardData);
          //使用 renderMe 功能重新渲染页面.
          // renderMe(messageBoardData);
        }
      });
      requestForResign.open("post", `${serverAddress}/reSign`, true);
      //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
      requestForResign.setRequestHeader("Content-Type", "application/json");
      requestForResign.setRequestHeader("x-auth", token);
      requestForResign.send(JSON.stringify(resignObj));
    } else {
      console.log(`Data Invalid`);
      document.querySelector(
        "#resign-validatorInfo"
      ).textContent = `Data Invalid`;
    }

    //根据服务器路由返回的结果, 把结果通过 renderMe() 渲染在页面.
  });

document
  .querySelector("#editModal-submit")
  .addEventListener("click", function(e) {
    e.preventDefault();

    //获取该modal上面全部相关的数据
    let editObj = {};
    //the data
    editObj.signInDD = document.querySelector("#editModal-day").value;
    editObj.signInMM = document.querySelector("#editModal-month").value;
    editObj.signInYYYY = document.querySelector("#editModal-year").value;
    editObj.signOutDD = document.querySelector("#editModal-day").value;
    editObj.signOutMM = document.querySelector("#editModal-month").value;
    editObj.signOutYYYY = document.querySelector("#editModal-year").value;
    //In time
    editObj.signInHH = document.querySelector("#editModal-InHH").value;
    editObj.signInmm = document.querySelector("#editModal-Inmm").value;
    //Out time
    editObj.signOutHH = document.querySelector("#editModal-OutHH").value;
    editObj.signOutmm = document.querySelector("#editModal-Outmm").value;
    //others
    editObj.apptizer = document.querySelector("#editModal-apptizer").value;
    editObj.drink = document.querySelector("#editModal-drink").value;
    editObj.note = document.querySelector("#editModal-notes").value;

    // console.log(editObj);

    //验证数据是否合法, 如果合法
    //检查确保数据的类型都是对的.
    let resultValidator1 = dateValidator(
      Number(editObj.signInMM),
      Number(editObj.signInDD),
      Number(editObj.signInYYYY)
    );
    let resultValidator2 = dateValidator(
      Number(editObj.signOutMM),
      Number(editObj.signOutDD),
      Number(editObj.signOutYYYY)
    );
    let resultValidator3 = hoursValidator(
      Number(editObj.signInHH),
      Number(editObj.signInmm)
    );
    let resultValidator4 = hoursValidator(
      Number(editObj.signOutHH),
      Number(editObj.signOutmm)
    );
    let resultValidator5 = foodValidator(
      Number(editObj.apptizer),
      Number(editObj.drink)
    );
    if (
      resultValidator1 === true &&
      resultValidator2 === true &&
      resultValidator3 === true &&
      resultValidator4 === true &&
      resultValidator5 === true
    ) {
      //重置数据不合法的提示信息
      document.querySelector("#editModal-validatorInfo").textContent = "";
      //隐藏 modal 模块
      $("#editModal").modal("hide");

      const requestForEdit = new XMLHttpRequest();
      requestForEdit.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          const theEditDate = JSON.parse(e.target.responseText);
          //如果成功的拿到了这一天的数据, 我们可以如下操作.
          //获取今天的日期通过 moment.js, 并且推算出前一周的日期
          let today = moment();
          let theDayBeforeToday7 = moment().subtract(7, "days");
          //进行判断, 如果这一天的数据和今天的日期之间相差在7天以内, 我们需要给 period 路由发送请求, 获取最新的 perioddata
          //如果这一天的数据, 和今天的日期相差超过了7天, 就不需要在获得最新的 perioddata 内容.
          let todayFormat = today.format("YYYY-MM-DD");
          let theDayBeforeToday7Format = theDayBeforeToday7.format(
            "YYYY-MM-DD"
          );
          let theDay = moment.unix(theEditDate.signIn).format("YYYY-MM-DD");
          console.log(todayFormat, theDayBeforeToday7Format, theDay);
          if (
            moment(theDay).isBetween(
              theDayBeforeToday7Format,
              todayFormat,
              null,
              []
            )
          ) {
            //     //这一天是距离今天七天以内的日期
            console.log(`between 7 days`);
            const requestForPeriod = new XMLHttpRequest();
            requestForPeriod.addEventListener("readystatechange", function(e) {
              if (e.target.readyState === 4) {
                const periodData = JSON.parse(e.target.responseText);
                // console.log(periodData);
                saveToLocal("periodData", periodData);
                //这里需要的是如何根据返回的数据去进行渲染页面
                let timeTable = document.querySelector("#table-body");
                while (timeTable.firstChild) {
                  timeTable.removeChild(timeTable.firstChild);
                }
                renderMe(periodData);
              }
            });
            requestForPeriod.open("post", `${serverAddress}/period`, true);
            //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
            requestForPeriod.setRequestHeader(
              "Content-Type",
              "application/json"
            );
            requestForPeriod.setRequestHeader("x-auth", token);
            let periodObj = {
              dateStartMM: theDayBeforeToday7.get("month") + 1,
              dateStartDD: theDayBeforeToday7.get("date"),
              dateStartYYYY: theDayBeforeToday7.get("year"),
              dateEndMM: today.get("month") + 1,
              dateEndDD: today.get("date"),
              dateEndYYYY: today.get("year")
            };
            // console.log(`periodObj is ${JSON.stringify(periodObj)}`);
            //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
            requestForPeriod.send(JSON.stringify(periodObj));
          }
        }
      });
      requestForEdit.open("post", `${serverAddress}/edit`, true);
      //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
      requestForEdit.setRequestHeader("Content-Type", "application/json");
      requestForEdit.setRequestHeader("x-auth", token);
      requestForEdit.send(JSON.stringify(editObj));
    } else {
      console.log(`data invalid`);
      document.querySelector("#editModal-validatorInfo").textContent =
        "Data Invalid";
    }
  });

//Modal 中的 submit 按钮按下去的时候, 执行的操作.
document.querySelector("#modal-submit").addEventListener("click", function(e) {
  //首先进行权限判断, 如果不符合权限则无法修改.
  let user = JSON.parse(getFromLocal("userInfoData"));
  let messageField;
  //判断当前修改的 messageField 当中的内容.
  if (
    document.querySelector("#exampleModalLabel").textContent ===
    "Edit Manager Message Board:"
  ) {
    messageField = "managerMessage";
  } else if (
    document.querySelector("#exampleModalLabel").textContent ===
    "Edit Front Message Board:"
  ) {
    messageField = "frontMessage";
  } else if (
    document.querySelector("#exampleModalLabel").textContent ===
    "Edit Kitchen Message Board:"
  ) {
    messageField = "kitchenMessage";
  }
  //判断用户的角色权限 和 尝试修改的内容是否一致. 如果一致则赋予信息内容.
  let message;
  if (user.role.manager) {
    message = document.querySelector("#message-text").value;
  } else if (user.role.front && messageField === "frontMessage") {
    message = document.querySelector("#message-text").value;
  } else if (user.role.kitchen && messageField === "kitchenMessage") {
    message = document.querySelector("#message-text").value;
  }
  //如果 message 为 undefiend, 那么就是权限不够无法赋予信息, 如果权限足够则会显示为空.
  // console.log(`message is ${message}, messageField is ${messageField}`);

  //通过 JQ 去隐藏 modal
  $("#exampleModal").modal("hide");
  if (message != undefined) {
    // 向服务器发出更新 messageBoard 的请求.
    let messageEditObj = {
      message,
      messageField
    };
    const requestForEditMessageBoard = new XMLHttpRequest();
    requestForEditMessageBoard.addEventListener("readystatechange", function(
      e
    ) {
      if (e.target.readyState === 4) {
        //获得服务器返回的最新的 messageBoard 的信息
        const messageBoardData = JSON.parse(e.target.responseText);
        // console.log(messageBoardData);
        saveToLocal("messageBoardData", messageBoardData);
        //使用 renderMe 功能重新渲染页面.
        renderMe(messageBoardData);
      }
    });
    requestForEditMessageBoard.open(
      "post",
      `${serverAddress}/user/editMessageBoard`,
      true
    );
    //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
    requestForEditMessageBoard.setRequestHeader(
      "Content-Type",
      "application/json"
    );
    requestForEditMessageBoard.setRequestHeader("x-auth", token);
    requestForEditMessageBoard.send(JSON.stringify(messageEditObj));
  }
});
