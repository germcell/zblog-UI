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
    isSearchArticle: true // 是否搜索文章，用于标注当前搜索的种类（用户/文章） 
  },
  created() {
    if (location.toString().includes('search.html')) {
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
        const {data: res2} = await axios.get(baseUrl + '/v2/index/search/' + keyword + '?p=' + page + '&t=userInfo')
        // TODO 结果处理
        if (res2.code == 200) {
          if (res2.data != null) {
            this.pageInfo = res2.data
          } else {
            this.pageInfo.list = null
            this.pageInfo.total = 0
          }
          return
        }
        if (res2.code == 505) {
          location.href = 'index.html'
        }
        console.log('搜索用户');
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
  },
})