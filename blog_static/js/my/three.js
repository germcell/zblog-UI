const categoryVue = new Vue({
  el: "#category-container",
  data:{
    userInfo: {},
    isLogin: false,
    categories: [], // 文章分类
    currentCategoryId: null, // 当前选中分类
    pageInfo: {}, // 当前分类文章分页信息
    showBlogs: [], // 当前已展示的文章概要
    blogBoxScrollCapacity: 310, // 博客展示区域，滚动阈值随着页数增多，动态的变化
    blogBoxWidth: 500, // 博客展示区域固定宽度，与css属性绑定，修改时也需要修改css .m-category-box .m-category-blog-content
    page: 1, // 根据阈值查询的当前页码
    scrollEvent: true, // 是否开启滚动监听事件，所有文章加载完后则需要关闭
    unreadNum: 0, // 未读消息,
    blogLoadding: false, // 分类文章信息加载状态，true正在加载，false加载完成
  },
  created() {
    // 加载登录信息
    this.userInfo = getLoginUserMsg()
    if (this.userInfo.token == null) {
      isLogin = false
      return
    }
    axios.get(baseUrl + '/v2/lr/isLogin', {headers: {token: this.userInfo.token}})
    .then(res=>{
      if (res.data.code == 522) {
        this.isLogin = true
        this.unreadNum = Number.parseInt(sessionStorage.getItem('unreadNum'))
      }
    })

    // 加载分类文章
    axios.get(baseUrl + '/v2/category/list')
    .then(res=>{
      this.categories = res.data.data
      this.currentCategoryId = this.categories[0].cid
    }).catch(error=>{
      this.$message.error('分类加载失败' + ' ' + error.message)
    })

    // 加载页面加载时，当前选中的分类文章
    const t = setInterval(()=>{
      this.pageBlogByCid(this.currentCategoryId, 1)
      clearInterval(t)
    },1000)

  },
  mounted(){
     // 监听滚动事件，然后用handleScroll这个方法进行相应的处理
    this.$refs.blogContent.addEventListener('scroll',this.handleScroll)
  },
  methods: {
    /**
   * 前往用户中心
   * @param {*} uid 
   */
    goUserCenter(uid) {
      location.href = 'private_personal.html?uid='+uid+'&m='+Math.random()
    },
    /**
     * 选择当前分类
     * @param {*} cid 
     */
    selectCategory(cid) {
      this.currentCategoryId = cid
      this.page = 1
      this.pageBlogByCid(this.currentCategoryId,this.page)
    },
    /**
     * 监听博客展示区域，滚动距离到达阈值后则发起下一页的请求
     */
    handleScroll() {
      if (!this.scrollEvent) return
      if (!this.pageInfo.hasNextPage) {
        this.$message.info('没有更多了!')
        this.scrollEvent = false
        return
      }

      var scrollTop = this.$refs.blogContent.scrollTop
      if (scrollTop / this.blogBoxScrollCapacity > 1) {
        this.blogLoadding = true
        // console.log('查询下一页',scrollTop,this.page,this.blogBoxScrollCapacity);
        this.blogBoxScrollCapacity += this.blogBoxWidth
        this.page++

        const t = setInterval(() => {
          this.pageBlogByCid(this.currentCategoryId, this.page)
          clearInterval(t)
          this.blogLoadding = false
        }, 1000)
        return
      }
      // console.log('不需要查询下一页',scrollTop,this.page,this.blogBoxScrollCapacity);
    },
    /**
     * 根据分类id分页查询文章
     * @param {*} cid
     * @param {*} page 
     */
    pageBlogByCid(cid, page) {
      axios.get(baseUrl + '/v2/category/outline/page', {params: {cid: cid, p: page}})
      .then(res=>{
        this.pageInfo = res.data.data
        if (page == 1) {
          this.showBlogs = this.pageInfo.list
        } else {
          this.showBlogs.push(...this.pageInfo.list)
        }
      }).catch(error=>{
        this.$message.error('文章加载失败' + ' ' + error.message)
      })
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
  }
})