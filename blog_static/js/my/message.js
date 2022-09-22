const messageVue = new Vue({
  el: "#message-container",
  data: {
    sendContent: "",  // 发送内容
    maxError: false,  // 发送内容长度提示
    userInfo: {}, // 登录信息
    privateMsgUserInfo: [], // 左边的私信用户信息列表
    unreadMsgNum: [], // 未读私信数量
    currentUserInfo: {}, // 当前选中的私信用户
    currentReceiveMsg: [], // 当前选择用户的私信
    currentSendMsg: [], // 当前回复的私信
    sortMsg: [], // 按时间降序排序后的所有消息
    ws: {}, // 当前页面的ws连接
    viewUser: {}, // 新建私信的用户信息
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

    // 请求私信用户列表数据
    this.mergePrivateUserInfoData()
  },
  mounted() {
    this.connectionWSServer()
  },
  methods: {
    /**
     * 请求私信用户列表数据，并合并未读消息数据,将每个私信用户和私信数量整合在一起
     */
    async mergePrivateUserInfoData() {
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
        this.$message.error("私信数量请求失败")
        return
      }
      this.unreadMsgNum = res2.data

      // 合并数据,将每个私信用户和私信数量整合在一起
      this.unreadMsgNum.some(ele => {
        this.privateMsgUserInfo.some(ele2 => {
          if (ele.sendId == ele2.sendId) {
            ele2.unread = ele.unread
            return true
          }
        })
      })

      // 判断进入消息中心的方式，从自己的私信进入，或从其他人的私信进入
      this.viewUser = JSON.parse(sessionStorage.getItem('viewUser'))
      this.selectUser(this.viewUser.sendId)
    },
    /**
     * 选择当前对话用户
     */ 
    async selectUser(sendId) {
      // 私信未读数归零
      this.currentUserInfo = this.privateMsgUserInfo.find(ele => {
        ele.unread = 0
        return ele.sendId == sendId
      })

      if (this.currentUserInfo == null) {
        this.viewUser.receiveId = Number.parseInt(this.userInfo.loginUserID)
        this.currentUserInfo = this.viewUser
        this.privateMsgUserInfo.push(this.viewUser)
        sessionStorage.removeItem('viewUser') 
      }

      // console.log(this.currentUserInfo);

      // 防止多次点击一个用户时照成消息累加，在每次请求时先原有清空消息
      this.currentReceiveMsg = []
      this.currentSendMsg = []
      this.sortMsg = []

      // 解决回显消息时的第二种情况,再获取一次私信id
      const {data: res9} = await axios.get(baseUrl + '/v2/msg/newUnread/' + this.userInfo.loginUserID + 
                                                     '/' + this.currentUserInfo.sendId)

      if (res9.code != 200) {
        this.$message.error('获取私信失败res9')
        return
      }
      this.currentUserInfo.commentIds = []
      res9.data.some(ele => {
        this.currentUserInfo.commentIds.push(ele.id)
      })

      if (this.currentUserInfo.commentIds.length == 0) {
        return
      }

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
        this.$message.error('获取私信失败res')
        return 
      }
      
      this.currentReceiveMsg = res.data.receive
      this.currentSendMsg = res.data.send

      if (this.currentReceiveMsg != null) {
        this.currentReceiveMsg.some(ele => {
          this.sortMsg.push(ele)
        })
      }
    
      if (this.currentSendMsg != null) {
        this.currentSendMsg.some(ele => {
          this.sortMsg.push(ele)
        })
      }
     
      // 收发信息内容按时间排序 
      this.sortMsg.sort(function(o1, o2) {return o1.createTime - o2.createTime})
    },
    /**
     * 发送消息
     */
    sendMsg() {
      if (this.sendContent == '' || this.sendContent.length == 0) {
        return
      }

      if (this.sendContent.length > 200) {
        this.maxError = true
        return
      }

      var msgDTO = {
        "sendId": Number.parseInt(this.userInfo.loginUserID),
        "receiveId": this.currentUserInfo.sendId,
        "content": this.sendContent,
        "msgTag": 0,
        "bid": -1,
        "pid": -1
      }
	
      this.ws.send(JSON.stringify(msgDTO))
    },
    /**
     * 建立当前用户和服务端的WS连接
     */
    connectionWSServer() {
      var msgDTO
      var webSocket = new WebSocket(wsUrl + '/v2/msg/ws/' + this.userInfo.loginUserID)
      this.ws = webSocket
      this.ws.onerror = ()=>{ this.$message.error('网络异常，建立连接失败') }
      this.ws.onopen = ()=>{
        this.$message.success('建立连接成功')
      }
       // 实时监听回显/推送消息
       this.ws.onmessage = (evt) => {
        msgDTO = JSON.parse(evt.data)
        msgDTO.createTime = new Date()
          // 将回显数据push到排序后的消息数组中,因为当前ws同时监听，发送，避免回显数据显示重复，需做判断，是当前用户才回显发送内容
          if (msgDTO.sendId == this.userInfo.loginUserID) {
            this.sortMsg.push(msgDTO)
            this.sendContent = ""
          }

        // 1.左侧列表栏无发送者信息,根据sendId查询用户基本信息，并展示
        let is1 = (this.privateMsgUserInfo.length == 0)
        if (is1) {
          if (msgDTO.sendId == Number.parseInt(this.userInfo.loginUserID)) {
            return
          }

          /*
            TODO 当遇到第一种情况时，由于队列的异步，会照成在请求接口前，队列还未将数据写入数据库，
            所以请求接口获取不到最新的私信
          */

          // console.log('1.左侧列表栏无发送者信息,根据sendId查询用户基本信息，并展示');
          this.mergePrivateUserInfoData()
          return
        }
        is1 = this.privateMsgUserInfo.some((ele)=>{
          if (ele.sendId == msgDTO.sendId) {
            return true
          }
        })
        if (!is1) {
          if (msgDTO.sendId == Number.parseInt(this.userInfo.loginUserID)) {
            return
          }
          // console.log('1.左侧列表栏无发送者信息,根据sendId查询用户基本信息，并展示');
          this.mergePrivateUserInfoData()
          return
        }

        // 3.左侧列表栏有发送者信息，并且是正在聊天的人
        const is3 = this.privateMsgUserInfo.some((ele)=>{
          if (ele.sendId == msgDTO.sendId && msgDTO.sendId == this.currentUserInfo.sendId) {
            return true
          }
        })
        if (is3) {
          // 监听接收回显数据
          this.sortMsg.push(msgDTO)
          return
        }

        /*
          当第二种情况时，由于之前请求左侧私信用户列表时已经得到了私信的id，所以此时只能做一个未读数量的增加，
          当选中用户对话后只能根据之前的私信id查询信息，照成不能得到新增的私信信息
        */

        // 2.左侧列表有发送者信息，但不是正在聊天的人,将消息存入，并新增未读数
        this.privateMsgUserInfo.some((ele)=>{
          if (ele.sendId == msgDTO.sendId) {
            // 未读数加1
            ele.unread++
            ele.createTime = new Date()
            return true
          }
        })
      }
    },
    /**
     * 删除当前所有对话
     */
    delAllMsg(sendId) {
      // TODO 删除 sendId + loginUserId 的私信
      console.log(sendId);
    },
    /**
     * 退出
     */
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
  },
  /**
   * 离开时关闭ws连接
   */
  beforeDestory() {
    this.ws.close()
  }
});