/**
 * 关注用户请求
 * @param {*} loginUid 关注人id
 * @param {*} uid 被关注人id
 * @param {*} token 关注人身份令牌
 */
const becomeFansReq = (loginUid, uid, token) => {
  return axios({
    url: baseUrl + "/v2/fans/add",
    method: "post",
    data: {
      uid: uid,
      uid2: loginUid,
    },
    headers: {
      token: token,
      "content-type": "application/json",
    },
  })
}

/**
 * 支付宝支付请求
 * @param { paySubject,payTotalAmount,payComment,uid,uid2 } aliPayDTO 支付参数
 */
const aliPayReq = (aliPayDTO, userToken) => {
  return axios.get(baseUrl + '/v2/my-alipay/pay', {
    params: {
      'paySubject': aliPayDTO.paySubject, 
      'payTotalAmount': aliPayDTO.payTotalAmount,
      'payComment': aliPayDTO.payComment,
      'uid': aliPayDTO.uid,
      'uid2': aliPayDTO.uid2
    },
    headers: {token: userToken}
  })
}

// async cancelFans(uid) {
//   const { data: res } = await axios({
//     url: baseUrl + "/v2/fans/delete",
//     method: "delete",
//     data: {
//       uid: uid,
//       uid2: this.loginUserID,
//     },
//     headers: {
//       token: this.token,
//       "content-type": "application/json",
//     },
//   });

//   if (res.code == 200) {
//     this.writers.some((item, index) => {
//       if (item.uid == res.data.uid) {
//         item.isFans = false;
//         this.$set(item, item.isFans, false);
//         return true;
//       }
//     });
//     this.$notify({
//       title: "成功",
//       message: "已取消关注",
//       type: "success",
//       offset: 80,
//       duration: 2000,
//     });
//   } else if (res.code == 702) {
//     this.$notify({
//       title: "提示",
//       message: "关注失败，请刷新后重试",
//       type: "info",
//       offset: 80,
//       duration: 2000,
//     });
//   } else {
//     this.$notify({
//       title: "错误",
//       message: "关注失败，请检查网络是否通畅",
//       type: "error",
//       offset: 80,
//       duration: 2000,
//     });
//   }
// },

// function request(url,method,errorMsg) {
//   if (method == 'get') {
//     axios.get(url)
//     .then(res=>{
//       return 
//     })
//   } 

//   if (method == 'post') {

//   }

// }