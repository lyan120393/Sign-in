const moment = require("moment");

function toUnix(
  { MM, DD, YYYY, HH, mm } = {
    MM: moment().get("month") + 1,
    DD: moment().get("date"),
    YYYY: moment().get("year")
  }
) {
  let theTime;
  // console.log(`${MM} ${DD} ${YYYY}, ${HH} ${mm}`);
  if (
    MM === undefined &&
    DD === undefined &&
    YYYY === undefined &&
    HH != undefined &&
    mm != undefined
  ) {
    //1. 如果传入时,仅仅传入 HH:mm 时间, 则自动设定为当天的 HH:mm 时间.(其他均为 undefined)
    theTime = `${moment().get("month") + 1}-${moment().get(
      "date"
    )}-${moment().get("year")} ${HH}:${mm}`;
    console.log(theTime);
  } else if (
    MM != undefined &&
    DD != undefined &&
    YYYY != undefined &&
    HH != undefined &&
    mm != undefined
  ) {
    //2. 如果传入时带有 MM-DD-YYYY HH:mm 时间则使用传入的时间
    theTime = `${MM}-${DD}-${YYYY} ${HH}:${mm}`;
    console.log(theTime);
  } else if (
    MM != undefined &&
    DD != undefined &&
    YYYY != undefined &&
    HH === undefined &&
    mm === undefined
  ) {
    //3. 如果传入时仅仅带有 MM-DD-YYYY 没有 HH:mm 则自动返回指定日期的 unix 值.
    theTime = `${MM}-${DD}-${YYYY}`;
    console.log(theTime);
  }
  // console.log(`${MM}-${DD}-${YYYY}`);

  // if (signInObj.specificTime) {
  //   let theTime = `${moment().get("month") + 1}-${moment().get(
  //     "date"
  //   )}-${moment().get("year")} ${signInObj.specificTime}`;
  //   signInTime = moment(theTime, "MM-DD-YYYY HH:mm").unix();
  // }
  if (theTime) {
    let unixTime = moment(theTime, "MM-DD-YYYY HH:mm").unix();
    console.log(unixTime);
  }
}

toUnix({ HH: 10, mm: 22 }); //4. 如果传入时没有任何的数据, 则自定返回当天日期的 unix 值.
toUnix({ MM: 1, DD: 5, YYYY: 2011 });
toUnix({ MM: 1, DD: 5, YYYY: 2011, HH: 0, mm: 02 });

//自定制功能:根据提供的时间去把时间转换为MM-DD-YYYY HH:mm格式的 unix 时间.
//1. 如果传入时,仅仅传入 HH:mm 时间, 则自动设定为当天的 HH:mm 时间.
//2. 如果传入时带有 MM-DD-YYYY HH:mm 时间则使用传入额的时间
//3. 如果传入时仅仅带有 MM-DD-YYYY 没有 HH:mm 则自动返回指定日期的 unix 值.
//4. 如果传入时没有任何的数据, 则自定返回当天日期的 unix 值.
