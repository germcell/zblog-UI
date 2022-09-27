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

/**
 * 点赞数、粉丝数类数据格式化显示，如2000 =>2k
 * @param {*} data 
 * @returns 
 */
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




