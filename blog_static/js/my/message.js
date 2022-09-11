const messageVue = new Vue({
  el: "#message-container",
  data: {
    sendContent: "",  // 发送内容
    userInfo: {}, // 登录信息
    privateMsgUserInfo: [], // 私信用户信息
    unreadMsgNum: [], // 未读私信数量
    currentUserInfo: {}, // 当前选中的私信用户
    currentReceiveMsg: [], // 之前接收的私信
    currentSendMsg: [], // 之前回复的私信
  },
  async created() {
    this.userInfo = getLoginUserMsg()
    if (!this.userInfo.isLogin) {
      this.$message.error("请先登录")
      location.href = "index.html"
    }
    
    if (getUrlParam('u') != this.userInfo.loginUserID) {
      location.href = '404.html'
    }

    // 获取私信用户
    const {data: res} = await axios.get(baseUrl + '/v2/msg/user/' + this.userInfo.loginUserID)
    if (res.code != 200) {
      this.$message.error("私信用户请求失败")
      return
    }
    this.privateMsgUserInfo = res.data

    // 获取未读私信数量
    const {data: res2} = await axios.get(baseUrl + '/v2/msg/unread/' + this.userInfo.loginUserID)
    if (res2.code != 200) {
      this.$message.error("私信请求失败")
      return
    }
    this.unreadMsgNum = res2.data

    // 合并数据
    this.unreadMsgNum.some(ele => {
      this.privateMsgUserInfo.some(ele2 => {
        if (ele.sendId == ele2.sendId) {
          ele2.unread = ele.unread
          return true
        }
      })
    })
  },
  methods: {
    // 选择当前用户
    async selectUser(sendId) {
      this.currentUserInfo = this.privateMsgUserInfo.find(ele => {
        ele.unread = 0
        return ele.sendId == sendId
      })

      // 请求私信内容
      const {data: res} = await axios({
        url: baseUrl + '/v2/msg/private',
        method: 'post',
        data: JSON.stringify(this.currentUserInfo.commentIds),
        headers: {
          "Content-type": "application/json",
        },
      });

      if (res.code != 200) {
        this.$message.error('获取私信失败')
        return 
      }
      // this.currentReceiveMsg = res.data
      
     // TODO 消息按时间排列 
      console.log(res.data);

    },
    logout() {
      clearCookie();
      this.$notify({
        title: "成功",
        message: "已安全退出",
        type: "success",
        offset: 80,
        duration: 1000,
      });
      const timer = setInterval(() => {
        location.reload();
        clearInterval(timer);
      }, 1000);
    },
  }
});