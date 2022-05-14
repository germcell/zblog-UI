/* 设置cookie */
function setCookie(key, value) {
  document.cookie = key + '=' + value
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

/* 日期格式化 */
function dateFormat(time, needHour) {
  var date=new Date(time);
  var year=date.getFullYear();
  var month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
  var day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();
  var hours=date.getHours()<10 ? "0"+date.getHours() : date.getHours();
  var minutes=date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();
  var seconds=date.getSeconds()<10 ? "0"+date.getSeconds() : date.getSeconds();
  if (needHour) {
    return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
  }
  return year+"-"+month+"-"+day;
}