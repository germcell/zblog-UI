/* 获取用户登录信息 */
function getLoginUserMsg() {
  let userInfo = {}
  userInfo.token = getCookie('userToken')
  userInfo.loginUserID = getCookie('userID')
  userInfo.avatar = getCookie('userAvatar')
  userInfo.wName = getCookie('userName')
  userInfo.userMail = getCookie('userMail')
  userInfo.fans = getCookie('fans')
  userInfo.articleNum = getCookie('articleNum')
  if (getCookie('userSex') === 'male') {
    userInfo.isMale = true
  } else {
    userInfo.isMale = false
  }
  if (userInfo.token != '' && userInfo.token != null) {
    userInfo.isLogin = true
  } else {
    userInfo.isLogin = false
  }
  return userInfo
}

/* 数据格式化显示 */
function formatData(data) {
  const dataInt = Number.parseInt(data)
  const t = dataInt / 1000
  if (parseInt(t) <= 0) {
    return dataInt
  }
  if (t == parseInt(t)) {
    return t + 'k'
  }
  return t.toFixed(1) + 'k'
}


