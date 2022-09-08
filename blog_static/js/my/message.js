const messageVue = new Vue({
  el: "#message-container",
  data: {
    sendContent: "sdfs",
    userInfo: {}
  },
  created() {
    this.userInfo = getLoginUserMsg()
    if (!this.userInfo.isLogin) {
      this.$message.error("请先登录")
      location.href = "index.html"
    }
    


  },
  methods: {
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