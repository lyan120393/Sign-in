console.log(`statistic.js has connected`);
//hash使用 substring(1)减去前面的#符号.
const token = location.hash.substring(1);
// `${serverAddress}`
// console.log(token);
//这个 periodObj 要在一开始就声明.要供全局访问
let periodObj = {};
let hoursCounter = 0;
let renderHoursCounter = hoursCounter => {
  if (hoursCounter <= 0) {
    document.querySelector(
      "#showTotal-hours"
    ).textContent = `Period time is not avaliable`;
  } else {
    let hours = Math.floor(hoursCounter / 3600);
    let mins = (
      (hoursCounter / 3600 - Math.floor(hoursCounter / 3600)) *
      60
    ).toFixed();
    document.querySelector(
      "#showTotal-hours"
    ).textContent = `Period Total: ${hours} hours ${mins} mins`;
  }
};
renderHoursCounter(hoursCounter);
let drinkAndApptizerCounter = 0;
let renderDrinkAndApptizer = drinkAndApptizerCounter => {
  if (drinkAndApptizerCounter != 0) {
    document.querySelector(
      "#showTotal-drinkAndApptizer"
    ).textContent = `Total Drinks and Apptizder: ${drinkAndApptizerCounter}`;
  } else {
    document.querySelector(
      "#showTotal-drinkAndApptizer"
    ).textContent = `Total Drinks and Apptizder is not avaliable`;
  }
};
renderDrinkAndApptizer(drinkAndApptizerCounter);
let renderPeriodforStatistic = (periodData, periodObj) => {
  //首先拿到数组, 然后遍历数组的每一个元素, 可以得知每一个工作日的信息.并进行渲染.
  //对数组进行重新排序. 根据他们的返回日期.
  periodData.sort(function(a, b) {
    return a.signIn - b.signIn;
  });
  // console.log(periodData);

  periodData.forEach(element => {
    //hours 的计数器
    hoursCounter = element.hours + hoursCounter;
    console.log(`hoursCounter is ${hoursCounter}`);
    drinkAndApptizerCounter =
      element.apptizer + element.drink + drinkAndApptizerCounter;
    console.log(`drinkAndApptizerCounter is ${drinkAndApptizerCounter}`);
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
              renderPeriodforStatistic(periodData, periodObj);
              renderHoursCounter(hoursCounter);
              renderDrinkAndApptizer(drinkAndApptizerCounter);
            }
          });
          requestForPeriod.open("post", `${serverAddress}/period`, true);
          //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
          requestForPeriod.setRequestHeader("Content-Type", "application/json");
          requestForPeriod.setRequestHeader("x-auth", token);
          // console.log(`periodObj is ${JSON.stringify(periodObj)}`);
          //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
          requestForPeriod.send(JSON.stringify(periodObj));
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

document
  .querySelector("#periodSearch-search")
  .addEventListener("click", function(e) {
    periodObj.dateStartMM = document.querySelector("#startDate-month").value;
    periodObj.dateStartDD = document.querySelector("#startDate-day").value;
    periodObj.dateStartYYYY = document.querySelector("#startDate-year").value;
    periodObj.dateEndMM = document.querySelector("#endDate-month").value;
    periodObj.dateEndDD = document.querySelector("#endDate-day").value;
    periodObj.dateEndYYYY = document.querySelector("#endDate-year").value;
    //使用 function 文件当中的 日期 validator
    let resultValidator1 = dateValidator(
      Number(periodObj.dateStartMM),
      Number(periodObj.dateStartDD),
      Number(periodObj.dateStartYYYY)
    );
    let resultValidator2 = dateValidator(
      Number(periodObj.dateEndMM),
      Number(periodObj.dateEndDD),
      Number(periodObj.dateEndYYYY)
    );
    //当两个日期的结果 result 都为真, 判定数据合法, 然后进行提交数据给服务器.
    if (resultValidator1 === true && resultValidator2 === true) {
      console.log(periodObj);

      const requestForPeriod = new XMLHttpRequest();
      requestForPeriod.addEventListener("readystatechange", function(e) {
        if (e.target.readyState === 4) {
          const periodData = JSON.parse(e.target.responseText);
          console.log(periodData);
          //重置页面上的统计数据
          document
            .querySelector("#periodInput-validInfo")
            .setAttribute("class", "d-none");
          let timeTable = document.querySelector("#table-body");
          while (timeTable.firstChild) {
            timeTable.removeChild(timeTable.firstChild);
          }
          hoursCounter = 0;
          drinkAndApptizerCounter = 0;

          //这里需要的是如何根据返回的数据去进行渲染页面
          saveToLocal("periodData", periodData);
          //渲染数据: periodData 是从服务器拿到的数据, periodobj 是用户填写的数据.
          renderPeriodforStatistic(periodData, periodObj);
          renderHoursCounter(hoursCounter);
          renderDrinkAndApptizer(drinkAndApptizerCounter);
        }
      });
      requestForPeriod.open("post", `${serverAddress}/period`, true);
      //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
      requestForPeriod.setRequestHeader("Content-Type", "application/json");
      requestForPeriod.setRequestHeader("x-auth", token);
      //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.

      requestForPeriod.send(JSON.stringify(periodObj));
    } else {
      console.log(`cannot blank`);
      //提示用户输入的内容不合法.
      document
        .querySelector("#periodInput-validInfo")
        .setAttribute("class", "p");
      document
        .querySelector("#periodInput-validInfo")
        .setAttribute("class", "text-danger");
      document.querySelector(
        "#periodInput-validInfo"
      ).textContent = `data input is invalid`;
    }
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

    console.log(editObj);

    //隐藏 modal 模块
    $("#editModal").modal("hide");

    const requestForEdit = new XMLHttpRequest();
    requestForEdit.addEventListener("readystatechange", function(e) {
      if (e.target.readyState === 4) {
        const theEditDate = JSON.parse(e.target.responseText);
        //如果成功的拿到了这一天的数据, 我们可以如下操作.
        //获取今天的日期通过 moment.js, 并且推算出前一周的日期
        const requestForPeriod = new XMLHttpRequest();
        requestForPeriod.addEventListener("readystatechange", function(e) {
          if (e.target.readyState === 4) {
            const periodData = JSON.parse(e.target.responseText);
            // console.log(periodData);
            saveToLocal("periodData", periodData);
            //这里需要的是如何根据返回的数据去进行渲染页面
            renderPeriodforStatistic(periodData, periodObj);
            renderHoursCounter(hoursCounter);
            renderDrinkAndApptizer(drinkAndApptizerCounter);
          }
        });
        requestForPeriod.open("post", `${serverAddress}/period`, true);
        //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
        requestForPeriod.setRequestHeader("Content-Type", "application/json");
        requestForPeriod.setRequestHeader("x-auth", token);
        // console.log(`periodObj is ${JSON.stringify(periodObj)}`);
        //发送内容, 把我们的 login 这个 Object 转为 JSON 并进行发送.
        requestForPeriod.send(JSON.stringify(periodObj));
      }
    });
    requestForEdit.open("post", `${serverAddress}/edit`, true);
    //发送的req.body 当中的格式是 JSON 格式. 服务器会有中间件把他们转为 Javascript Object
    requestForEdit.setRequestHeader("Content-Type", "application/json");
    requestForEdit.setRequestHeader("x-auth", token);
    requestForEdit.send(JSON.stringify(editObj));
  });

document
  .querySelector("#gotoPersonalPage")
  .addEventListener("click", function(e) {
    e.preventDefault();
    location.assign(`/me#${token}`);
  });
//当页面加载的时候,我们可以执行的脚本.
window.onload = function() {
  const requestForUserInfo = new XMLHttpRequest();
  requestForUserInfo.addEventListener("readystatechange", function(e) {
    if (e.target.readyState === 4) {
      const userInfoData = JSON.parse(e.target.responseText);
      //第二种方式, 从服务器拿到数据之后到本地. 并且也从服务器拿到了静态的模板页面.
      saveToLocal("userInfoData", userInfoData);
      document.querySelector("#username").textContent = `Welcome, ${
        userInfoData.username
      }!`;
    }
  });
  //页面渲染路由, 和服务器的功能路由, 不是一种路由. /user/me 和 /me 完全意思不同.
  requestForUserInfo.open("get", `${serverAddress}/user/me`, true);
  requestForUserInfo.setRequestHeader("Content-Type", "application/json");
  //这样,服务器就能通过 authentic 去检查 header 当中的 x-auth 当中的 token 字段了
  requestForUserInfo.setRequestHeader("x-auth", token);
  //纯 get 请求不需要任何内容
  requestForUserInfo.send();
};
