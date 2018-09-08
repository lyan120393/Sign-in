const moment = require("moment");

function toUnix(
  { MM, DD, YYYY, HH, mm } = {
    //默认的值的月份会比真实的月份少一个月
    //如果传入为空 toUnix(), 则使用参数默认值, 参数默认值就是现在此时此刻.
    MM: moment().get("month") + 1,
    DD: moment().get("date"),
    YYYY: moment().get("year"),
    HH: moment().get("hour"),
    mm: moment().get("minute")
  }
) {
  let theTime;
  if (
    MM === undefined &&
    DD === undefined &&
    YYYY === undefined &&
    HH != undefined &&
    mm != undefined
  ) {
    //1. 如果传入时,仅仅传入 HH:mm 时间, 则自动设定为当天的 HH:mm 时间.(其他均为 undefined)
    theTime = moment()
      .set("year", moment().get("year"))
      .set("month", moment().get("month"))
      .set("date", moment().get("date"))
      .set("hour", HH)
      .set("minute", mm)
      .set("second", 0);
  } else if (
    MM != undefined &&
    DD != undefined &&
    YYYY != undefined &&
    HH != undefined &&
    mm != undefined
  ) {
    //2. 如果传入时带有 MM-DD-YYYY HH:mm 时间则使用传入的时间
    theTime = moment()
      .set("year", YYYY)
      //MM如果传入的数值时7,表示7月,但如果 set 方法中的 MM 为7, 实则是八月, 所以进行调整.
      .set("month", MM - 1)
      .set("date", DD)
      .set("hour", HH)
      .set("minute", mm)
      .set("second", 0);
    // console.log(theTime);
  } else if (
    MM != undefined &&
    DD != undefined &&
    YYYY != undefined &&
    HH === undefined &&
    mm === undefined
  ) {
    //3. 如果传入时仅仅带有 MM-DD-YYYY 没有 HH:mm 则自动返回指定日期的 unix 值.
    theTime = moment()
      .set("year", YYYY)
      .set("month", MM - 1)
      .set("date", DD)
      .set("hour", 0)
      .set("minute", 0)
      .set("second", 0);
    // console.log(theTime);
  }

  if (theTime) {
    // console.log(`theTime is ${theTime}`);
    let unixTime = moment(theTime, "MM-DD-YYYY HH:mm").unix();
    // console.log(`unixTime is ${unixTime}`);
    // console.log(`moment.unix(unixTime) is ${moment.unix(unixTime)}`);
    return unixTime;
  }
}

// toUnix({ YYYY: 2018, MM: 8, DD: 9 });

module.exports = {
  toUnix
};
