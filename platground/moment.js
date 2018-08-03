const moment = require("moment");

function formatSeconds(value) {
  var secondTime = parseInt(value); // 秒
  var minuteTime = 0; // 分
  var hourTime = 0; // 小时
  if (secondTime > 60) {
    //如果秒数大于60，将秒数转换成整数
    //获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60);
    //获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60);
    //如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      //获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60);
      //获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60);
    }
  }
  // return obj = {
  //   // second = parseInt(secondTime),
  //   // minute = parseInt(minuteTime),
  //   // hour = parseInt(hourTime),
  //   allSecond = value,
  // }
}

const people = {};
people.signIn = moment().unix();
people.signOut = moment()
  .add(7, "h")
  .unix();
//判断2个时间点中间的秒数
let between = moment(people.signOut).diff(moment(people.signIn));
let timeUnit = formatSeconds(between);

console.log(people);

//思考关于未来搜索指定时间区间内的所有工作记录
//通过对 signIn 日期进行判断,是否符合某个区间进行遍历.
let isBetween = moment().isBetween("2018-08-01", "2018-08-31");
console.log(`isBetween is ${isBetween}`);
//判断是否是同一天的签到. 返回一个 Boolean 值.
let isSame = moment().isSame("2018-08-03", "day");
console.log(`isSame is ${isSame}`);
//获取指定日期的字符串
let dateString = `${moment().get("year")}-${moment().get("month") +
  1}-${moment().get("date")}`;
console.log(dateString);
