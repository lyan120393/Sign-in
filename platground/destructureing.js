function toUnix(
  { m = 0, d = 0, year = 0, h = 0, min = 0, x = 0, y = 0 } = { x: 3, y: 5 }
) {
  console.log(x + y);
}

toUnix({}); //4. 如果传入时没有任何的数据, 则自定返回当天日期的 unix 值.

//自定制功能:根据提供的时间去把时间转换为MM-DD-YYYY HH:mm格式的 unix 时间.
//1. 如果传入时,仅仅传入 HH:mm 时间, 则自动设定为当天的 HH:mm 时间.
//2. 如果传入时带有 MM-DD-YYYY HH:mm 时间则使用传入额的时间
//3. 如果传入时仅仅带有 MM-DD-YYYY 没有 HH:mm 则自动返回指定日期的 unix 值.
//4. 如果传入时没有任何的数据, 则自定返回当天日期的 unix 值.
