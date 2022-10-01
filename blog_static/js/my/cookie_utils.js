/* 设置cookie */
function setCookie(key, value) {
  let now = new Date()
  now.setDate(now.getDate() + 30)
  document.cookie = key + '=' + value + ';expires=' + now.toUTCString()
}

/* 获取指定cookie */
function getCookie(key) {
  let value = ''
  const cookies = document.cookie
  let arr = cookies.split(';')
  arr.some((item) => {
    let arr2 = item.split('=')
    if (arr2[0].includes(key)) {
      value = arr2[1]
      return true;
    }
  })
  return value
}

/* 获取url参数 */
function getUrlParam(key) {
  let v = null
  let url = location.toString()
  let p1 = url.split('?')[1]
  if (p1 == null || '' == p1) {
    return null
  }
  let p2 = p1.split('&')
  p2.some(item => {
    let k = item.split('=')[0]
    if (k == key) {
      v = item.split('=')[1]
      return true
    }
  })
  return v
}

/* 清除cookie */
function clearCookie() {
  let value = ''
  const cookies = document.cookie
  let arr = cookies.split(';')
  arr.some((item) => {
    let arr2 = item.split('=')
      document.cookie = arr2[0] +"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  })
}

/**
 * 一般日期格式化
 * @param {*} time 需处理的时间戳
 * @param {*} needHour 是否保留时分秒
 * @returns 
 */
function dateFormat(time, needHour) {
  var date = new Date(time);
  var year = date.getFullYear();
  var month = date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
  var day = date.getDate()<10 ? "0"+date.getDate() : date.getDate();
  var hours = date.getHours()<10 ? "0"+date.getHours() : date.getHours();
  var minutes = date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();
  var seconds = date.getSeconds()<10 ? "0"+date.getSeconds() : date.getSeconds();
  if (needHour) {
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  }
  return year + "-" + month + "-" + day;
}

/**
 * 格式化评论时间
 * 24h内显示今天时分 -> 今天 12:32
 * 48小时内显示昨天时分 -> 昨天 12:32
 * 当前年内显示月+日+时分 -> 8-23 12：32 
 * 不在当前年显年+月+日+时分 -> 2021-8-23 12:32
 * 
 * @param {*} timeArr 需处理的时间戳数组 
 */
function commentDateFormat(timeArr) {
  // 获取当前年份、小时
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth()+1<10 ? "0"+(currentDate.getMonth()+1) : currentDate.getMonth()+1;
  var currentDay = currentDate.getDate()<10 ? "0"+currentDate.getDate() : currentDate.getDate();
  var currentHours = currentDate.getHours()<10 ? "0"+currentDate.getHours() : currentDate.getHours();
  var currentMinutes = currentDate.getMinutes()<10 ? "0"+currentDate.getMinutes() : currentDate.getMinutes();

  // 遍历并格式化待处理日期
  timeArr.forEach(ele=>{
    var date = new Date(ele.createTime);
    var year = date.getFullYear();
    var month = date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
    var day = date.getDate()<10 ? "0"+date.getDate() : date.getDate();
    var hours = date.getHours()<10 ? "0"+date.getHours() : date.getHours();
    var minutes = date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();

    // 因为此处可能重复的格式化之前的数据，但此时的数据已经不再是标准的时间戳了，所以不能获取它对应的年月日，结果为NaN
    // 所以此处判断如果为NaN则表示这个数已被格式化过，直接跳过，继续格式化后面的日期
    if (Object.is(year, NaN)) {
      return
    }

    if (year != currentYear) {
      ele.createTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    } else if (month == currentMonth && day == currentDay) {
      ele.createTime = '今天 ' + hours + ':' + minutes;
    } else if (month == currentMonth && day == currentDay-1) {
      ele.createTime = '昨天' + hours + ':' + minutes;
    } else {
      ele.createTime = month + '-' + day + ' ' + hours + ':' + minutes
    }
  })
  return timeArr;
}
