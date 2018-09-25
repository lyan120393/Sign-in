const serverAddress = "https://signin-pullman.herokuapp.com";
// Local Storage
const saveToLocal = (localKey, content) => {
  localStorage.setItem(localKey, JSON.stringify(content));
};

const getFromLocal = localKey => {
  return localStorage.getItem(localKey);
};

const removeFromLocal = localKey => {
  localStorage.removeItem(localKey);
};

const clearLocal = localKey => {
  localStorage.clear(localKey);
};

//date Validator
// 3. 创建一个专门判断日期月份, 年份, 日期的 validator. 都是整数, 且月份为 1-12, 年份为今年, 日期为 1-31 之间.
let dateValidator = function(month, day, year) {
  let monthB = false;
  let dayB = false;
  let yearB = false;
  //判断月份
  if (Number.isInteger(month)) {
    if (month > 0 && month < 13) {
      monthB = true;
    } else {
      return `month must between 1 to 12`;
    }
  } else {
    return `month must be integer`;
  }
  //判断日期
  if (Number.isInteger(day)) {
    if (day > 0 && day < 32) {
      dayB = true;
    } else {
      return `day must between 1 to 31`;
    }
  } else {
    return `day must be integer`;
  }
  //判断年份
  if (Number.isInteger(year)) {
    if (year > 2017 && year < 2022) {
      yearB = true;
    } else {
      return `year must between 2018 to 2021`;
    }
  } else {
    return `year must be integer`;
  }
  //总体验证
  if (monthB && dayB && yearB) {
    return true;
  }
};
// 4. 创建一个专门判断小时 和 分钟数 的 validator. 都是整数, 最早上午 10 点, 最晚是晚上 23 点. 分钟数为 0 - 59 之间的整数,不写就是 0. **而且 signOut 必须晚于 signIn**
let hoursValidator = function(hour, min) {
  let hourB = false;
  let minB = false;
  //判断小时数
  if (Number.isInteger(hour)) {
    if (hour > 9 && hour < 24) {
      hourB = true;
    } else {
      return `hour must between 10 to 24, 24 clock`;
    }
  } else {
    return `hour must be integer`;
  }
  //判断分钟数
  if (Number.isInteger(min)) {
    if (min >= 0 && min <= 59) {
      minB = true;
    } else {
      return `minutes must between 0 to 59`;
    }
  } else {
    return `minutes must be integer`;
  }
  //总体验证
  if (hourB && minB) {
    return true;
  }
};
// 5. 创建一个专门判断 apptizer 和 drink 数量为数字的 validator, 必须是整数, 且数值为 0-4 之间, 不写就是 0.
let foodValidator = function(apptizer, drink) {
  let apptizerB = false;
  let drinkB = false;
  //验证apptizer
  if (Number.isInteger(apptizer)) {
    if (apptizer >= 0 && apptizer <= 4) {
      apptizerB = true;
    } else {
      return `apptizer must between 0 to 4`;
    }
  } else {
    return `apptizer count must be integer`;
  }
  //验证drink
  if (Number.isInteger(drink)) {
    if (drink >= 0 && drink <= 4) {
      drinkB = true;
    } else {
      return `drink must between 0 to 4`;
    }
  } else {
    return `drink count must be integer`;
  }
  //总体验证
  if (apptizerB && drinkB) {
    return true;
  }
};
