const vm = new Vue({
  el: '#search-container',
  data: {
    isLogin: false,
    keyword: '',
    page: 1,
    pageInfo: {
      'total': 0,
      'list': null
    },
    userInfo: {},
    isSearchArticle: true, // 是否搜索文章，用于标注当前搜索的种类（用户/文章） 
    hotArticles: [],
    follows: [], // 当前用户已关注的用户
  },
  created() {
    if (location.toString().includes('search.html')) {
      // 0.查询文章排行榜
      axios.get(baseUrl + '/v2/index/article/rank')
        .then((res) => {
          if (res.data.data.length > 10) {
            vm.hotArticles = res.data.data.slice(0, 10)
          }
          vm.hotArticles = res.data.data
        })
      // 1.获取查询关键词
      this.keyword = decodeURI(getUrlParam('search'))
      this.page = getUrlParam('p')
      $("title").text(this.keyword + " - " + $("title").text());
      if (this.keyword == null || this.keyword == 'null' || this.keyword == '') {
        this.keyword = ''
        return
      }
      this.sendSearchReq(this.keyword, this.page, 1)
      // 2.获取登录状态
      this.userInfo = getLoginUserMsg()
      if (this.userInfo.token != null && this.userInfo.token != "") {
        this.isLogin = true
      } else {
        this.isLogin = false
      }
    }
  },
  methods: {
    /**
     * 发送搜索请求,判断isSearchArticle的值来决定查询类别
     * @param {*} keyword 搜索关键词
     * @param {*} page 页码
     */
    async sendSearchReq(keyword, page) {
      if (this.isSearchArticle) {
        const {data: res} = await axios.get(baseUrl + '/v2/index/search/' + keyword + '?p=' + page)
        if (res.code == 200) {
          if (res.data != null) {
            this.pageInfo = res.data
          } else {
            this.pageInfo.list = null
            this.pageInfo.total = 0
          }
          return
        } 
        if (res.code == 505) {
          location.href = 'index.html'
        }
      } else {
        // TODO 查询用户时的分页
        const {data: res2} = await axios.get(baseUrl + '/v2/index/search/' + keyword + '?p=' + page + '&t=userInfo')
        if (res2.code == 200) {
          if (res2.data != null) {
            /**
             * 设置登录用户与查询用户的关注状态
             */
            if (this.isLogin) {
              const {data: res3} = await axios.get(baseUrl + '/v2/fans/list/' + this.userInfo.loginUserID,
              { headers: {token: this.userInfo.token}} )
              this.follows = res3.data

              if (res3.data != null || res3.length > 0) {
                res2.data.list.some(searchEle => {
                  const result = this.follows.find(followEle => searchEle.uid == Number.parseInt(followEle))
                  if (result != undefined) {
                    searchEle.isFans = true
                  } else {
                    searchEle.isFans = false
                  }
                })
              } else {
                res2.data.list.some(searchEle => searchEle.isFans = false)
              }
              this.pageInfo = res2.data
            } else {
              this.pageInfo = res2.data
            }
          } else {
            this.pageInfo.list = null
            this.pageInfo.total = 0
          }
          return
        }
        if (res2.code == 505) {
          location.href = 'index.html'
        }
      }
    },
    /**
     * 设置搜索类别
     */
    searchUser() {
      this.isSearchArticle = false
      this.sendSearchReq(this.keyword, this.page)
    },
    searchArticle(page) {
      this.isSearchArticle = true
      this.sendSearchReq(this.keyword, page)
    },
    /**
     * 分页
     * @param {*} page 页码
     */
    pager(page) {
      this.sendSearchReq(this.keyword, page)
    },
    /**
     * 触发搜索
     * @param {*} event 
     * @returns 
     */
    searchEnter(event) {
      if (event.keyCode == 13) {
        if (this.keyword == null || this.keyword == '' || this.keyword.trim().length == 0) {
          return
        }
        this.isSearchArticle = true
        this.sendSearchReq(this.keyword, this.page)
      }
     },
     searchClick() {
      if (this.keyword == null || this.keyword == '' || this.keyword.trim().length == 0) {
        return
      }
      this.isSearchArticle = true
      this.sendSearchReq(this.keyword, this.page)
    },
    /**
     * 跳转文章详情页
     * @param {*} bid 文章id
     */
    viewArticle(bid) {
      location.href = 'blog.html?bid=' + bid + '&wer=' + Math.random()
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
    /**
     * 进入用户首页，如果是自己，则进入个人首页
     * @param {*} uid 
     */
    getUserInfo(uid) {
      if (uid != null) {
        if (uid == this.userInfo.loginUserID) {
          location.href = "private_personal.html?uid=" + uid + "&,fsd=" + Math.random();
        } else {
          location.href = "common_personal.html?uid=" + uid + "&,fsd=" + Math.random();
        }
      }
    },
    /**
     * 关注用户,关注后根据请求结果设置状态
     * @param {*} uid 
     */
    becomeFans(uid) {
      if (this.isLogin) {
        const reqResult = becomeFansReq(this.userInfo.loginUserID, uid, this.userInfo.token)
        reqResult.then(result => {
          const reqCode = result.data.code 
          if (reqCode == 200) {
            this.pageInfo.list.some(item => {
              if (item.uid == uid) {
                item.isFans = true
                return true
              }
            });
            this.$notify({
              title: "成功",
              message: "已成功关注该用户",
              type: "success",
              offset: 80,
              duration: 2000,
            });
            return
          } 
          if (reqCode == 701) {
            this.$notify({
              title: "提示",
              message: "已经关注过了哟",
              type: "info",
              offset: 80,
              duration: 2000,
            })
            return
          }
          //  参数为null
          this.$notify({
            title: "错误",
            message: "关注失败，请检查网络是否通畅",
            type: "error",
            offset: 80,
            duration: 2000,
          });
        })
      } else {
        this.goLogin()
      }
    },
    /**
     * 取消关注用户
     * @param {*} uid 
     */
    cancelFans(uid) {
      
      // TODO 取消关注请求编写

    },
    /**
     * 登录提示框
     */
     goLogin() {
      this.$confirm("您还未登录，是否立即登录?", "登录提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const backUrl = location.toString();
          localStorage.setItem("loginBackUrl", backUrl);
          location.href = "login.html?tips=请登录";
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消操作",
          });
        });
    },
  },
})