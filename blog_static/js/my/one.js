/* login.html vue实例 */
const loginVue = new Vue({
  el: "#login-container",
  data: {
    loginData: {
      mail: "",
      pwd: "",
    },
    msg: "登录",
    backUrl: "",
  },
  created() {
    if (location.toString().includes("login.html")) {
      this.msg = decodeURI(getUrlParam("tips"));
      if (this.msg == "null" || this.msg == null || this.msg == "") {
        this.msg = "";
      }
      this.backUrl = localStorage.getItem("loginBackUrl");
    }
  },
  methods: {
    async doLogin() {
      if (
        this.loginData.mail.trim().length == 0 ||
        this.loginData.pwd.trim().length == 0
      ) {
        this.msg = "请输入邮箱或密码";
        return false;
      }
      if (
        this.loginData.mail.includes(" ") ||
        this.loginData.pwd.includes(" ")
      ) {
        this.msg = "邮箱或密码不能使用空格";
        return false;
      }
      const { data: res } = await axios({
        url: baseUrl + "/v2/lr/login.do",
        method: "post",
        data: {
          mail: this.loginData.mail,
          pwd: this.loginData.pwd,
        },
      });
      if (res.code == 522) {
        this.msg = "";
        setCookie("userToken", res.data.pwd);
        setCookie("userID", res.data.uid);
        setCookie("userAvatar", res.data.writerAvatar);
        setCookie("userName", res.data.writerName);
        setCookie("userMail", res.data.mail);
        setCookie("userSex", res.data.writerSex);
        setCookie("articleNum", res.data.articleNum);
        setCookie("fans", res.data.fans);

        if (this.backUrl != null && this.backUrl != "") {
          localStorage.removeItem("loginBackUrl");
          location.href = this.backUrl;
          return true;
        } else {
          localStorage.removeItem("loginBackUrl");
          location.href = "index.html";
          return true;
        }
      }
      if (res.code == 525) {
        this.msg = "登录失败，请检查网络是否通畅";
        this.loginData.mail = res.data.mail;
        this.loginData.pwd = "";
        return false;
      }
      if (res.code == 505) {
        this.msg = "请输入邮箱或密码";
        return false;
      }
      if (res.code == 523) {
        this.msg = "邮箱或密码错误";
        this.loginData.mail = res.data.mail;
        this.loginData.pwd = "";
        return false;
      }
    },
  },
});

/* register.html vue实例 */
const registerVue = new Vue({
  el: "#register-container",
  data: {
    msg: "",
    registerData: {
      writerName: "",
      mail: "",
      pwd: "",
      repeatPwd: "",
      code: "",
    },
    codeMsg: "发送验证码",
    enableRegister: true, // 发送验证码按钮是否可点击
    isError: false,
    registerSuccess: false,
  },
  methods: {
    async checkWriterName() {
      if (this.registerData.writerName.length == 0) {
        this.msg = "请输入用户名";
        this.isError = true;
        return false;
      } else if (this.registerData.writerName.includes(" ")) {
        this.msg = "用户名中不能包含空格";
        this.isError = true;
        return false;
      } else {
        const { data: res } = await axios.get(baseUrl + "/v2/lr/check", {
          params: {
            name: this.registerData.writerName,
            mail: "",
          },
        });
        if (res.code == 601) {
          this.msg = "用户名已被使用，请更换一个";
          this.isError = true;
          return false;
        } else if (res.code == 505) {
          this.msg = "请填写信息";
          this.isError = true;
          return false;
        } else {
          this.msg = "";
          return true;
        }
      }
    },
    checkPwd() {
      if (
        this.registerData.pwd.length == 0 ||
        this.registerData.repeatPwd.length == 0
      ) {
        this.msg = "请填写密码";
        this.isError = true;
        return false;
      }
      if (
        this.registerData.pwd.includes(" ") ||
        this.registerData.repeatPwd.includes(" ")
      ) {
        this.msg = "密码中不能包含空格";
        this.isError = true;
        return false;
      }
      if (
        this.registerData.pwd.length != this.registerData.repeatPwd.length ||
        this.registerData.pwd != this.registerData.repeatPwd
      ) {
        this.msg = "两次输入的密码不一致";
        this.isError = true;
        return false;
      }
      this.msg = "";
      this.isError = false;
      return true;
    },
    async checkMail() {
      const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (!mailReg.test(this.registerData.mail)) {
        this.msg = "请提供有效的邮箱地址";
        this.isError = true;
        return false;
      }
      const { data: res2 } = await axios.get(baseUrl + "/v2/lr/check", {
        params: {
          name: "",
          mail: this.registerData.mail,
        },
      });
      if (res2.code == 603) {
        this.msg = "该邮箱已被注册，请更换或找回密码";
        this.isError = true;
        return false;
      } else if (res2.code == 505) {
        this.msg = "请填写信息";
        this.isError = true;
        return false;
      } else {
        this.msg = "";
        return true;
      }
    },
    checkCode() {
      if (this.registerData.code.length == 0) {
        this.msg = "请输入验证码";
        return false;
      } else if (this.registerData.code.includes(" ")) {
        this.msg = "验证码有误";
        return false;
      }
      this.msg = "";
      return true;
    },
    sendCode() {
      if (this.enableRegister) {
        this.checkMail().then((result) => {
          if (result) {
            axios.get(baseUrl + "/v2/lr/code", {
              params: { mail: this.registerData.mail },
            });
            this.enableRegister = false;
            let t = 60;
            const codeMsgTimer = setInterval(() => {
              this.codeMsg = --t + "秒后重试";
            }, 1000);
            const sendCodeTimer = setInterval(() => {
              this.enableRegister = true;
              this.codeMsg = "发送验证码";
              clearInterval(codeMsgTimer);
              clearInterval(sendCodeTimer);
            }, 60000);
          }
        });
      }
    },
    async doRegister() {
      if (
        this.registerData.writerName == "" ||
        this.registerData.pwd == "" ||
        this.registerData.repeatPwd == "" ||
        this.registerData.mail == "" ||
        this.registerData.code == ""
      ) {
        this.msg = "请填写信息";
        return false;
      }
      this.msg = "";
      const { data: res3 } = await axios({
        url: baseUrl + "/v2/lr/register.do",
        method: "post",
        data: {
          writerName: this.registerData.writerName,
          pwd: this.registerData.pwd,
          mail: this.registerData.mail,
        },
        params: { code: this.registerData.code },
      });
      if (res3.code == 513) {
        this.msg = "验证码错误";
        return false;
      }
      if (res3.code == 512) {
        this.msg = "";
        this.registerSuccess = true;
        return true;
      }
      if (res3.code == 505) {
        this.msg = "请填写信息";
        return false;
      }
      if (res3.code == 601) {
        this.msg = "用户名已被使用，请更换一个";
        return false;
      }
      if (res3.code == 603) {
        this.msg = "该邮箱已被注册，请更换或找回密码";
        return false;
      }
      if (res3.code == 511) {
        this.msg = "注册失败,请检查网络是否通畅";
        return false;
      }
    },
    goLoginPage() {
      location.href = "login.html?tips=";
    },
  },
});

/* blog.html vue实例 */
const blogVue = new Vue({
  el: "#blog-container",
  data: {
    isThumbsUp: false,
    article: {},     // 文章信息
    hotArticles: [], // 热门文章信息
    category: {},    // 文章分类信息
    copyright: {},   // 文章版权信息
    writer: {},      // 文章作者信息
    userInfo: {},    // 当前登录用户信息
    isLogin: false,  // 是否登录
    likeDTO: {},     // 点赞请求体信息
    selectMoney: '0', // 选择的打赏金额
    appreciateComment: '', // 赞赏留言
  },
  async created() {
    if (location.toString().includes("blog.html")) {
      const bid = getUrlParam("bid");
      if (bid != null && "" != bid) {
        // 查询文章信息
        const { data: res } = await axios.get(
          baseUrl + "/v2/index/article/view/" + bid
        );
        if (res.code == 200) {
          this.article = res.data.blog;
          this.category = res.data.category;
          this.copyright = res.data.copyright;
          this.writer = res.data.writer;
          this.hotArticles = res.data.hotArticlesList
          $("title").text(this.article.title + "-" + $("title").text());
          // 查询点赞状态
          this.userInfo = getLoginUserMsg();
          if (this.userInfo.token != null && this.userInfo.token != "") {
            this.isLogin = true;

            this.likeDTO = {
              uid: this.article.uid,
              mid: this.userInfo.loginUserID,
              bid: this.article.bid,
            };
            const { data: res } = await axios({
              url: baseUrl + "/v2/thumbs-up/isLike",
              method: "post",
              data: {
                uid: this.likeDTO.uid,
                mid: this.likeDTO.mid,
                bid: this.likeDTO.bid,
              },
              headers: {
                token: this.userInfo.token,
                "content-type": "application/json;charset=utf-8",
              },
            });
            if (res.code === 754) {
              this.isThumbsUp = true;
            } else {
              this.isThumbsUp = false;
            }
          }
        } else {
          location.href = "404.html";
        }
      } else {
        location.href = "404.html";
      }
    }
  },
  methods: {
    // 赞赏模态框
    showAppreciate() {
      $('.ui.tiny.modal')
        .modal({
          closable: false,
        })
        .modal('show')
    },
    // 选择打赏金额
    selectAmount(selectMoney) {
      this.selectMoney = selectMoney
    },
    /*
     * 打赏
     *  1.用户是否登录
     *  2.选择金额是否有效
     *  3.留言字数是否合规
     */
    appreciate() {
      if (this.userInfo.token != '' && this.userInfo.token != null) {
        if (this.checkInput()) {
          if (this.appreciateComment.length>200) {
            this.$message.error('留言字数不要超过200个哦~')
            return
          }
  
          const reqParams = {
            'paySubject': '赞赏' + this.writer.writerName,
            'payTotalAmount': this.selectMoney,
            'payComment': this.appreciateComment,
            'uid': this.userInfo.loginUserID,
            'uid2': this.writer.uid
          }

          window.open(baseUrl + 
           '/v2/my-alipay/pay?paySubject=' + reqParams.paySubject + 
           '&payTotalAmount=' + reqParams.payTotalAmount + 
           '&uid=' + reqParams.uid + 
           '&uid2=' + reqParams.uid2 + 
           '&payComment=' + reqParams.payComment)

          // 使用发送异步请求方式，无法打开支付界面
          // const aliPayReqResult = aliPayReq(reqParams, this.userInfo.token)
          // aliPayReqResult.then((res) => {
            // const resultData = res.data
            // if (resultData.code == 200) {
            // window.open(resultData.data)
            // } else {
            //   this.$message.error('支付失败,请稍后重试')
            // }
          // })
          return
        }
        return
      } else {
        window.open(`login.html`)
      }
    },
    /* 
     * 校验输入金额
     *  1.是否为数字
     *  2.是否等于0
     *  3.位数是否大于3，大于则截取前三个字符
     */
    checkInput() {
      const regex = /^[0-9]*$/
      if (regex.test(this.selectMoney)) {
        if (Number.parseInt(this.selectMoney) != 0) {
          if (this.selectMoney.length > 3) {
            this.selectMoney = this.selectMoney.substring(0,3)
            return true
          } else {
            return true
          }
        }
      }
      this.selectMoney = 1
      return false
    },
    // 点赞
    async like(cmd) {
      if (this.isLogin) {
        if (cmd == 1) {
          const { data: res } = await axios({
            url: baseUrl + "/v2/thumbs-up/cancel",
            method: "put",
            data: {
              uid: this.likeDTO.uid,
              mid: this.likeDTO.mid,
              bid: this.likeDTO.bid,
            },
            headers: {
              token: this.userInfo.token,
              "content-type": "application/json;charset=utf-8",
            },
          });
          if (res.code == 756) {
            this.isThumbsUp = false;
            // 取消成功后更新点赞数
            const { data: res2 } = await axios.get(
              baseUrl + "/v2/thumbs-up/get/" + this.article.bid
            );
            this.article.likeNum = res2.data;
          } else {
            this.$message.error("您点击的的太快了");
          }
        } else if (cmd == 2) {
          const { data: res } = await axios({
            url: baseUrl + "/v2/thumbs-up",
            method: "post",
            data: {
              uid: this.likeDTO.uid,
              mid: this.likeDTO.mid,
              bid: this.likeDTO.bid,
            },
            headers: {
              token: this.userInfo.token,
              "content-type": "application/json;charset=utf-8",
            },
          });
          if (res.code == 200) {
            this.isThumbsUp = true;
            // 点赞成功后更新点赞数
            const { data: res2 } = await axios.get(
              baseUrl + "/v2/thumbs-up/get/" + this.article.bid
            );
            this.article.likeNum = res2.data;
          } else {
            this.$message.error("网络异常");
          }
        }
      } else {
        this.goLogin();
      }
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
    getUserInfo(uid) {
      if (uid == this.userInfo.loginUserID) {
        location.href = 'private_personal.html?uid=' + uid + '&dfsadf=' + Math.random()
      } else {
        location.href = 'common_personal.html?uid=' + uid + '&dfsadf=' + Math.random()
      }
    }
  },
  watch: {
    /* 侦听文章数据，如果数据变化则触发代码高亮插件（prism）和（tocbot），否则代码高亮和目录不会生效 */
    article(newValue, oldValue) {
      this.$nextTick(() => {
        Prism.highlightAll()
        tocbot.refresh();
      })
    }
  }
});

/* private_personal.html vue实例 */
const ppVue = new Vue({
  el: "#pp-container",
  data: {
    showUserinfoBox: false, // 显示用户信息框
    isShowEditBtn: false, // 是否显示修改信息按钮
    isEditUsername: false, // 显示用户名编辑框（点击修改按钮后）
    isEditProduce: false, // 显示个人介绍编辑框
    isEditPhone: false, // 显示电话号码编辑框
    isEditBirthday: false, // 显示出生日期编辑框
    isEditSex: false, // 显示性别编辑框
    isEditAvatar: false, // 显示更换头像遮罩
    userInfo: {},
    profile: {
      writer: {},
      articles: {},
      newWriter: {},
    },
    uploadAvatarSuccess: false,
    uploadAvatarSrc: "",
    uploadFiles: [],
  },
  async created() {
    if (location.toString().includes("private_personal.html")) {
      const uid = getUrlParam("uid");
      if (uid == null || uid == "") {
        location.href = "404.html";
        return;
      }
      this.userInfo = getLoginUserMsg();
      if (this.userInfo.loginUserID != uid) {
        location.href = "login.html?tips=身份已过期，请重新登录";
        return;
      }
      const { data: res } = await axios.get(baseUrl + "/v2/lr/isLogin", {
        headers: {
          token: this.userInfo.token,
        },
      });
      if (res.code == 501) {
        location.href = "login.html?tips=身份已过期，请重新登录";
        return;
      }
      const { data: res2 } = await axios.get(
        baseUrl + "/v2/lr/" + this.userInfo.loginUserID,
        {
          headers: {
            token: this.userInfo.token,
          },
        }
      );
      if (res2.code == 501) {
        location.href = "login.html?tips=身份已过期，请重新登录";
        return;
      }
      if (res2.code == 404) {
        location.href = "404.html";
        return;
      }
      if (res2.code == 525) {
        location.href = "500.html";
        return;
      }
      if (res2.code == 200) {
        this.profile.writer = res2.data.writer;
        this.profile.articles = res2.data.articles;
        this.profile.writer.allViews = formatData(this.profile.writer.allViews);
        this.profile.writer.articleNum = formatData(
          this.profile.writer.articleNum
        );
        this.profile.writer.fans = formatData(this.profile.writer.fans);
        this.profile.writer.allLikeNums = formatData(
          this.profile.writer.allLikeNums
        );

        this.profile.articles.some((item) => {
          item.views = formatData(item.views);
          item.likeNum = formatData(item.likeNum);
        });

        if (this.profile.writer.writerSex === "male") {
          this.profile.writer.writerSex = "男";
        } else {
          this.profile.writer.writerSex = "女";
        }
        // 需将用户原始信息和修改信息做一个隔离，需要做一个备份（深拷贝）
        $.extend(true, this.profile.newWriter, this.profile.writer);
        return;
      }
    }
  },
  methods: {
    /* 预览上传头像 */
    showUploadAvatar() {
      const files = this.$refs.uploadAvatar.files;
      if (files.length == 0) return;

      this.uploadFiles = files;

      const file = files[0];
      const s = file.name.split(".");
      const ext = s[s.length - 1];
      if (!suportImgFormat.includes(ext)) {
        this.$message.error("格式不支持");
        return;
      }

      const uploadUrl = window.webkitURL.createObjectURL(file);

      this.uploadAvatarSuccess = true;
      this.uploadAvatarSrc = uploadUrl;
    },
    /* 显示用户信息框 */
    showInfo() {
      if (this.showUserinfoBox == true) {
        this.showUserinfoBox = false;
      } else {
        this.showUserinfoBox = true;
      }
    },
    /* 通过判断 isShowEditBtn 的值来显示信息编辑按钮 */
    showEdit() {
      this.isShowEditBtn = true;
    },
    hideEdit() {
      this.isShowEditBtn = false;
    },
    /* 修改用户名 */
    editUsername() {
      this.isEditUsername = true;
    },
    /* 修改电话号码 */
    editPhone() {
      this.isEditPhone = true;
    },
    /* 修改性别 */
    editSex() {
      this.isEditSex = true;
    },
    /* 修改个人介绍 */
    editProduce() {
      this.isEditProduce = true;
    },
    /* 修改出生日期 */
    editBirthday() {
      this.isEditBirthday = true;
    },
    /* 关闭信息编辑框*/
    escEdit(cmd) {
      if ("1" == cmd) {
        this.isEditUsername = false;
      } else if ("2" == cmd) {
        this.isEditPhone = false;
      } else if ("3" == cmd) {
        this.isEditSex = false;
      } else if ("4" == cmd) {
        this.isEditBirthday = false;
      } else if ("5" == cmd) {
        this.isEditProduce = false;
      }
    },
    /* 显示、隐藏头像遮罩 */
    showAvatarMask() {
      this.isEditAvatar = true;
    },
    hideAvatarMask() {
      this.isEditAvatar = false;
    },
    /* 上传头像模态框 */
    updateAvatar() {
      $(".ui.modal").modal("setting", "closable", false).modal("show");
    },
    /* 发送修改请求 */
    async doEdit(cmd) {
      // 用户名
      if (cmd == 1) {
        if (
          this.profile.newWriter.writerName === this.profile.writer.writerName
        ) {
          this.$message.error("用户名未做更改");
          return;
        }
        if (this.profile.newWriter.writerName.trim().length == 0) {
          return;
        }
        const { data: res2 } = await axios.get(baseUrl + "/v2/lr/check", {
          params: {
            name: this.profile.newWriter.writerName,
            mail: "",
          },
        });
        if (res2.code == 602) {
          const { data: res } = await axios({
            url: baseUrl + "/v2/lr/" + this.profile.writer.uid,
            method: "put",
            data: {
              writerName: this.profile.newWriter.writerName,
            },
            headers: {
              token: this.userInfo.token,
            },
          });
          if (res.code == 200) {
            // 用户名修改成功后，更新cookie
            setCookie("userName", this.profile.newWriter.writerName);
          }
          this.editReqHandler(res.code);
          return;
        }
        this.editReqHandler(res2.code);
        return;
      }
      // 电话号码
      if (cmd == 2) {
        let newPhone = this.profile.newWriter.writerPhone;
        if (newPhone == null || newPhone.trim().length == 0) {
          return;
        }
        const phoneReg = new RegExp("^[0-9]*$");
        if (!phoneReg.test(newPhone) || newPhone.length < 11) {
          this.$message.error("电话号码格式有误");
          return;
        }
        const { data: res } = await axios({
          url: baseUrl + "/v2/lr/" + this.profile.writer.uid,
          method: "put",
          data: {
            writerPhone: this.profile.newWriter.writerPhone,
          },
          headers: {
            token: this.userInfo.token,
          },
        });
        this.editReqHandler(res.code);
        return;
      }
      // 性别
      if (cmd == 3) {
        if (
          this.profile.newWriter.writerSex != "female" &&
          this.profile.newWriter.writerSex != "male"
        ) {
          return;
        }
        const { data: res } = await axios({
          url: baseUrl + "/v2/lr/" + this.profile.writer.uid,
          method: "put",
          data: {
            writerSex: this.profile.newWriter.writerSex,
          },
          headers: {
            token: this.userInfo.token,
          },
        });
        this.editReqHandler(res.code);
        return;
      }
      // 出生日期
      if (cmd == 4) {
        if (this.profile.newWriter.writerBirthday == null) {
          return;
        }
        const { data: res } = await axios({
          url: baseUrl + "/v2/lr/" + this.profile.writer.uid,
          method: "put",
          data: {
            writerBirthday: this.profile.newWriter.writerBirthday,
          },
          headers: {
            token: this.userInfo.token,
          },
        });
        this.editReqHandler(res.code);
        return;
      }
      // 个人介绍
      if (cmd == 5) {
        if (
          this.profile.newWriter.writerIntroduce == null ||
          this.profile.newWriter.writerIntroduce.trim().length == 0
        ) {
          return;
        }
        const { data: res } = await axios({
          url: baseUrl + "/v2/lr/" + this.profile.writer.uid,
          method: "put",
          data: {
            writerIntroduce: this.profile.newWriter.writerIntroduce,
          },
          headers: {
            token: this.userInfo.token,
          },
        });
        this.editReqHandler(res.code);
        return;
      }
      // 修改头像
      if (cmd == 6) {
        let files = null;
        if (this.uploadFiles.length == 0) {
          files = this.$refs.uploadAvatar.files;
        } else {
          files = this.uploadFiles;
        }

        if (files.length == 0) return;

        const file = files[0];
        const s = file.name.split(".");
        const ext = s[s.length - 1];
        if (!suportImgFormat.includes(ext)) {
          this.$message.error("格式不支持");
          return;
        }
        if (file.size > avatarSize) {
          this.$message.error("文件太大");
          return;
        }

        this.uploadFiles = files;

        let formData = new FormData();
        formData.append("avatarFile", file);
        formData.append("mail", this.userInfo.userMail);
        const { data: res4 } = await axios({
          url: baseUrl + "/v2/lr/" + this.userInfo.loginUserID + "/avatar",
          method: "post",
          data: formData,
          headers: {
            token: this.userInfo.token,
            "Content-type": "multipart/form-data",
          },
        });
        if (res4.code == 501 || res4.code == 500) {
          location.href =
            "login.html?tips=身份已过期，请重新登录&md=" + Math.random();
          return;
        }
        if (res4.code == 538) {
          setCookie("userAvatar", res4.data);
          this.$message.success("修改成功，请刷新");
        } else {
          this.$message.error("提交失败，请检查网络是否通畅");
        }
        return;
      }
    },
    /* 个人信息编辑结果处理 */
    async editReqHandler(code) {
      if (code == 601) {
        this.$message.error("提交失败，该用户名已存在");
        return;
      }
      if (code == 501 || code == 500) {
        location.href =
          "login.html?tips=身份已过期，请重新登录&md=" + Math.random();
        return;
      }
      if (code == 404) {
        location.href = "404.html?tips=用户不存在";
        return;
      }
      if (code == 525 || code == 505 || code == 525) {
        this.$message.error("提交失败，请检查网络是否通畅");
        return;
      }
      if (code == 200) {
        this.$message.success("提交成功，正在审核中");
        return;
      }
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
    /* 设置文章状态 1：置为发布状态 0：置为草稿状态 2：删除文章 */
    async setArticleStatus(status, bid, uid) {
      let isStatus = false;
      if (status == 0) {
        isStatus = true;
      } else if (status == 1) {
        isStatus = true;
      } else if (status == 2) {
        isStatus = true;
      }
      if (isStatus) {
        // status == 2
        if (status == 2) {
          const { data: res2 } = await axios({
            url: baseUrl + "/v2/article/" + uid + "/" + bid,
            method: "delete",
            headers: { token: this.userInfo.token },
          });
          if (res2.code == 200) {
            this.$message.success("修改成功");
            return;
          }
          this.$message.error("修改失败，请检查网络是否畅通");
          return;
        }
        //  status == 0 || 1
        const { data: res } = await axios({
          url: baseUrl + "/v2/article/status/" + uid + "/" + bid + "/" + status,
          method: "put",
          headers: { token: this.userInfo.token },
        });
        if (res.code == 200) {
          this.$message.success("修改成功");
          return;
        }
        this.$message.error("修改失败，请检查网络是否畅通");
        return;
      }
    },
    editArticle(bid) {
      localStorage.setItem("currentEditArticleId", bid);
      location.href = "blog_add.html";
    },
  },
});

/* index.html vue实例 */
const indexVue = new Vue({
  el: "#index-container",
  data: {
    ad: {},
    blogPageInfo: {},
    blogs: [],
    writers: [],
    hotBlogPageInfo: {},
    hotBlogs: [],
    currentHotBlogPage: 1,
    isLogin: false,
    wName: "",
    isMale: true,
    avatar: "",
    token: "",
    loginUserID: "",
    loginUserMail: "",
    articleNum: 0,
    fans: 0,
    // alreadyFollow: []
    keyword: ''
  },
  async created() {
    if (location.toString().includes("index.html")) {
      // 1.首页信息渲染
      const { data: res } = await axios.get(baseUrl + "/v2/index");
      if (res.code == 200) {
        this.ad = res.data.ad;
        this.blogPageInfo = res.data.blogPageInfo;
        this.blogs = this.blogPageInfo.list;
        this.hotBlogPageInfo = res.data.hotArticle;
        this.writers = res.data.writers;

        // 2.登录状态判断
        this.token = getCookie("userToken");
        if (this.token != null && this.token != "") {
          this.isLogin = true;
          this.loginUserID = getCookie("userID");
          this.wName = getCookie("userName");
          this.avatar = getCookie("userAvatar");
          this.articleNum = getCookie("articleNum");
          this.fans = getCookie("fans");
          this.loginUserMail = getCookie("userMail");
          if (getCookie("userSex") === "male") {
            this.isMale = true;
          }
          // 默认将推荐作者关注状态置为未关注
          this.writers.forEach((item) => {
            item.isFans = false;
          });

          // 3.判断当前登录用户和推荐作者的关系（是否关注）
          const { data: res2 } = await axios.get(
            baseUrl + "/v2/fans/list/" + this.loginUserID,
            { headers: { token: this.token } }
          );
          if (res2.data != null || res2.length > 0) {
            this.writers.forEach((item) => {
              res2.data.some((item2) => {
                if (item.uid == item2) {
                  item.isFans = true;
                  return true;
                }
              });
            });
          }
        }
        // 4.排行榜记录分页
        this.hotBlogPageInfo.pages =
          this.hotBlogPageInfo.list.length % 5 == 0
            ? this.hotBlogPageInfo.list.length / 5
            : Number.parseInt(this.hotBlogPageInfo.list.length / 5 + 1);
        if (this.hotBlogPageInfo.total > 5) {
          this.hotBlogs = this.hotBlogPageInfo.list.slice(0, 5);
        } else {
          this.hotBlogs = this.hotBlogPageInfo.list;
        }
      }
    }
  },
  methods: {
    // 换一换按钮，相当于做了一个分页操作
    changehot() {
      this.currentHotBlogPage++;
      if (this.currentHotBlogPage > this.hotBlogPageInfo.pages) {
        this.currentHotBlogPage = 1;
        if (this.hotBlogPageInfo.total > 5) {
          this.hotBlogs = this.hotBlogPageInfo.list.slice(0, 5);
        } else {
          this.hotBlogs = this.hotBlogPageInfo.list;
        }
      } else {
        if (this.hotBlogPageInfo.total > this.currentHotBlogPage * 5) {
          this.hotBlogs = this.hotBlogPageInfo.list.slice(
            (this.currentHotBlogPage - 1) * 5,
            this.currentHotBlogPage * 5
          );
        } else {
          this.hotBlogs = this.hotBlogPageInfo.list.slice(
            (this.currentHotBlogPage - 1) * 5
          );
        }
      }
    },
    /*
     * 最新文章分页
     */
    async pager(p) {
      const { data: res } = await axios.get(
        baseUrl + "/v2/index/article/page/" + p
      );
      this.blogs = res.data.list;
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
    getUserInfo(uid) {
      if (uid != null) {
        if (uid == this.loginUserID) {
          location.href = "private_personal.html?uid=" + uid + "&,fsd=" + Math.random();
        } else {
          let lookUserInfo = {};
          this.writers.some((item) => {
            if (item.uid == uid) {
              lookUserInfo = item;
              return true;
            }
          })
          sessionStorage.setItem('isCurrentLoginUserFollowTheWriter', lookUserInfo.isFans)
          location.href = "common_personal.html?uid=" + uid + "&,fsd=" + Math.random();
        }
      }
    },
    async becomeFans(uid) {
      if (this.isLogin) {
        const { data: res } = await axios({
          url: baseUrl + "/v2/fans/add",
          method: "post",
          data: {
            uid: uid,
            uid2: this.loginUserID,
          },
          headers: {
            token: this.token,
            "content-type": "application/json",
          },
        });
        if (res.code == 200) {
          this.writers.some((item, index) => {
            if (item.uid == res.data.uid) {
              // 数据更改后立马渲染页面，能实现效果，原理不理解，但效果指生效一次，取关操作同样
              item.isFans = true;
              this.$set(item, item.isFans, true);
              return true;
            }
          });
          this.$notify({
            title: "成功",
            message: "已成功关注该用户",
            type: "success",
            offset: 80,
            duration: 2000,
          });
        } else if (res.code == 701) {
          this.$notify({
            title: "提示",
            message: "已经关注过了哟",
            type: "info",
            offset: 80,
            duration: 2000,
          });
        } else {
          // 参数为null
          this.$notify({
            title: "错误",
            message: "关注失败，请检查网络是否通畅",
            type: "error",
            offset: 80,
            duration: 2000,
          });
        }
      } else {
        location.href = "login.html?tips=请先登录";
      }
    },
    async cancelFans(uid) {
      const { data: res } = await axios({
        url: baseUrl + "/v2/fans/delete",
        method: "delete",
        data: {
          uid: uid,
          uid2: this.loginUserID,
        },
        headers: {
          token: this.token,
          "content-type": "application/json",
        },
      });

      if (res.code == 200) {
        this.writers.some((item, index) => {
          if (item.uid == res.data.uid) {
            item.isFans = false;
            this.$set(item, item.isFans, false);
            return true;
          }
        });
        this.$notify({
          title: "成功",
          message: "已取消关注",
          type: "success",
          offset: 80,
          duration: 2000,
        });
      } else if (res.code == 702) {
        this.$notify({
          title: "提示",
          message: "关注失败，请刷新后重试",
          type: "info",
          offset: 80,
          duration: 2000,
        });
      } else {
        this.$notify({
          title: "错误",
          message: "关注失败，请检查网络是否通畅",
          type: "error",
          offset: 80,
          duration: 2000,
        });
      }
    },
    personalPage(loginUid) {
      location.href =
        "private_personal.html?uid=" + loginUid + "&,fsd=" + Math.random();
    },
    /**
     * 搜索 (回车触发，点击触发)
     */
     searchEnter(event) {
      if (event.keyCode == 13) {
        if (this.keyword == null || this.keyword == '' || this.keyword.trim().length == 0) {
          return
        }
      location.href = 'search.html?spm=' + Math.random() + '&search=' + this.keyword.trim() + '&p=1' 
      }
     },
     searchClick() {
      if (this.keyword == null || this.keyword == '' || this.keyword.trim().length == 0) {
        return
      }
      location.href = 'search.html?spm=' + Math.random() + '&search=' + this.keyword.trim() + '&p=1' 
    },
  },
});

/* blog_add.html vue实例 */
const baVue = new Vue({
  el: "#blogadd-container",
  data: {
    userMail: "",
    isMale: true,
    wName: "",
    avatar: "",
    token: "",
    loginUserID: "",
    loginUserMail: "",
    articleNum: 0,
    fans: 0,
    isLogin: false,
    addBlog: {
      title: "",
      content: "",
      cid: -1,
      isAppreciate: 1,
      isComment: 1,
      isReprint: 0,
      isPublish: -1,
      uid: -1,
      crTipId: 1,
    },
    categories: [],
    copyrights: [],
    currentEditArticleId: null,
    currentEditArticle: {},
  },
  async created() {
    if (location.toString().includes("blog_add.html")) {
      this.token = getCookie("userToken");
      if (this.token != null && this.token != "") {
        const { data: res } = await axios({
          url: baseUrl + "/v2/lr/isLogin",
          method: "get",
          headers: {
            token: this.token,
          },
        });
        if (res.code == 522) {
          this.isLogin = true;
          this.loginUserID = getCookie("userID");
          this.avatar = getCookie("userAvatar");
          this.wName = getCookie("userName");
          this.userMail = getCookie("userMail");
          this.fans = getCookie("fans");
          this.loginUserMail = getCookie("userMail");
          getCookie("articleNum");
          if (getCookie("userSex") === "male") {
            this.isMale = true;
          }
          const { data: res2 } = await axios.get(
            baseUrl + "/v2/category/listcg",
            {
              headers: {
                token: this.token,
              },
            }
          );
          if (res2.code == 200) {
            this.categories = res2.data;
          }
          const { data: res3 } = await axios.get(
            baseUrl + "/v2/category/listcr",
            {
              headers: {
                token: this.token,
              },
            }
          );
          if (res3.code == 200) {
            this.copyrights = res3.data;
          }
          this.currentEditArticleId = localStorage.getItem(
            "currentEditArticleId"
          );
          localStorage.removeItem("currentEditArticleId");
          if (this.currentEditArticleId != null) {
            const { data: res3 } = await axios({
              url:
                baseUrl +
                "/v2/article/" +
                this.loginUserID +
                "/" +
                this.currentEditArticleId,
              method: "get",
              headers: { token: this.token },
            });
            if (res3.code == 200) {
              this.addBlog = res3.data;
              console.log(this.addBlog);
              this.$refs.text.innerHTML = this.addBlog.content;
            }
          }
          return;
        }
      }
      location.href = "login.html?tips=请先登录&m=" + Math.random();
      return;
    }
  },
  methods: {
    /* 添加、编辑文章、包含封面图片上传 */
    async add(cmd) {
      if (cmd == 2) {
        this.addBlog.isPublish = 0;
      } else {
        this.addBlog.isPublish = 1;
      }
      let formData = new FormData();
      // 1.判断有无上传文件，有则限定上传要求
      const uploadFiles = this.$refs.fp.files;
      if (uploadFiles.length > 0) {
        const file = uploadFiles[0];
        const s = file.name.split(".");
        const s1 = s[s.length - 1];
        if (!suportImgFormat.includes(s1)) {
          this.$message.error("文章封面格式只能为" + suportImgFormat);
          return;
        }
        if (file.size > fpSize) {
          this.$message.error("文章封面大小不能超过3MB");
          return;
        }
        formData.append("file", uploadFiles[0]);
      }
      // 2.验证提价数据
      if (this.addBlog.title.trim().length == 0) {
        this.$message.error("请输入文章标题");
        return;
      }
      this.addBlog.content = this.$refs.text.value;
      if (this.addBlog.content.trim().length == 0) {
        this.$message.error("请输入文章内容");
        return;
      }
      // 获取已选择的分类名称，再根据分类名称匹配对应的cid
      // 因为semantic-ui下拉选择项使用了text作为class，所以获取text，并且为第二个
      // 所以尽量不要再定义名为text的元素
      const cname = document.getElementsByClassName("text")[1].innerHTML;
      this.categories.some((item) => {
        if (item.name === cname) {
          this.addBlog.cid = item.cid;
          return true;
        }
        this.addBlog.cid = -1;
      });
      if (this.addBlog.cid == -1) {
        this.$message.error("请选择文章分类");
        return;
      }
      // 3.完善提交数据
      this.addBlog.uid = this.loginUserID;
      this.addBlog.crTipId = this.$refs.crTipId.value;

      formData.append("mail", this.userMail);
      formData.append("title", this.addBlog.title);
      formData.append("content", this.addBlog.content);
      formData.append("cid", this.addBlog.cid);
      formData.append("isAppreciate", this.addBlog.isAppreciate);
      formData.append("isComment", this.addBlog.isComment);
      formData.append("isReprint", 0);
      formData.append("isPublish", this.addBlog.isPublish);
      formData.append("uid", this.addBlog.uid);
      formData.append("crTipId", this.addBlog.crTipId);

      // 4.检查localStorage是否有值，来决定执行添加还是编辑
      if (this.currentEditArticleId != null) {
        formData.append("bid", this.addBlog.bid);
        formData.append("firstPicture", this.addBlog.firstPicture);
        formData.append("likeNum", this.addBlog.likeNum);
        formData.append("views", this.addBlog.views);
        const { data: res } = await axios({
          url: baseUrl + "/v2/article/" + this.currentEditArticleId,
          method: "put",
          data: formData,
          headers: {
            token: this.token,
            "Content-type": "multipart/form-data",
          },
        });
        if (res.code == 200) {
          this.$message.success("编辑成功");
          let t = setInterval(() => {
            location.href =
              "private_personal.html?uid=" +
              this.loginUserID +
              "&mfds=" +
              Math.random();
            clearInterval(t);
          }, 1000);
          return;
        }
        this.$message.error("编辑失败，请检查网络是否通畅");
        return;
      }
      const { data: res } = await axios({
        url: baseUrl + "/v2/article/add",
        method: "post",
        data: formData,
        headers: {
          token: this.token,
          "Content-type": "multipart/form-data",
        },
      });
      if (res.code == 5052) {
        if (cmd == 1) {
          this.$message.success("发布成功");
          location.href =
            "private_personal.html?uid=" +
            this.loginUserID +
            "&mfsadf=" +
            Math.random();
        } else {
          this.$message.success("保存草稿成功");
          location.href =
            "private_personal.html?uid=" +
            this.loginUserID +
            "&mfsadf=" +
            Math.random();
        }
      }
      return;
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
  },
});

/* common_personal.html vue实例 */
const pcVue = new Vue({
  el: "#personal-container",
  data: {
    currentUserId: null,
    currentUserInfo: {}, // 当前查看用户信息
    currentUserArticle: {},
    userInfo: {}, // 当前登录用户信息
    isFans: false
  },
  async created() {
    if (location.toString().includes("common_personal.html")) {
      this.currentUserId = getUrlParam("uid");
      if (this.currentUserId == null || this.currentUserId == "") {
        location.href = "index.html";
        return;
      }

      // 获取用户信息
      this.userInfo = getLoginUserMsg();
      if (this.currentUserId != this.userInfo.loginUserID) {
        const { data: res } = await axios.get(
          baseUrl + "/v2/lr/access/" + this.currentUserId
        );
        if (res.code == 200) {
          this.currentUserInfo = res.data.writer;
          this.currentUserArticle = res.data.articles;
          $("title").text(this.currentUserInfo.writerName + $("title").text());
          if (this.currentUserInfo.writerSex == "male") {
            this.currentUserInfo.isMale = true;
          } else {
            this.currentUserInfo.isMale = false;
          }
          this.currentUserInfo.allLikeNums = formatData(this.currentUserInfo.allLikeNums);
          this.currentUserInfo.allViews = formatData(this.currentUserInfo.allViews);
          this.currentUserInfo.articleNum = formatData(this.currentUserInfo.articleNum);
          this.currentUserInfo.fans = formatData(this.currentUserInfo.fans);

          // 获取并设置关注状态
          let re = JSON.parse(sessionStorage.getItem('isCurrentLoginUserFollowTheWriter'))
          if (re == null || re == '') {
            const { data: res2 } = await axios({
              url: baseUrl + '/v2/fans/status',
              method: 'post',
              data: {
                uid: this.currentUserInfo.uid,
                uid2: this.userInfo.loginUserID
              },
              headers: {
                token: this.userInfo.token,
                'content-type': 'application/json'
              }
            })
            if (res2.code == 200) {
              this.isFans = res2.data
            } 
          } else {
            this.isFans = re
          }
        } else if (res.code == 404) {
          location.href = '404.html'
        }
      } else {
        location.href = "private_personal.html?uid=" + this.currentUserId + "&,fsd=" + Math.random();
      }
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
    async follow(cmd) {
      if (cmd == 1) {
        const { data: res } = await axios({
          url: baseUrl + "/v2/fans/add",
          method: "post",
          data: {
            uid: this.currentUserInfo.uid,
            uid2: this.userInfo.loginUserID,
          },
          headers: {
            token: this.userInfo.token,
            "content-type": "application/json",
          },
        });
        if (res.code == 200) {
          this.isFans = true
          sessionStorage.setItem('isCurrentLoginUserFollowTheWriter', true)
          this.$message.success('关注成功')
        } else if (res.code == 501) {
          this.$message('你的登录信息已过期，请重新登录')
        } else if (res.code == 701) {
          this.$message('点击的太快啦~')
        } else {
          this.$message.error('请检查网络是否通畅')
        }
      } else if (cmd == 2) {
        const { data: res } = await axios({
          url: baseUrl + "/v2/fans/delete",
          method: "delete",
          data: {
            uid: this.currentUserInfo.uid,
            uid2: this.userInfo.loginUserID,
          },
          headers: {
            token: this.userInfo.token,
            "content-type": "application/json",
          },
        });
        if (res.code == 200) {
          this.isFans = false
          sessionStorage.setItem('isCurrentLoginUserFollowTheWriter', false)
          this.$message('取关成功')
        } else if (res.code == 501) {
          this.$message('你的登录信息已过期，请重新登录')
        } else if (res.code == 702) {
          this.$message('请刷新重试哦~')
        } else {
          this.$message.error('请检查网络是否通畅')
        }
      }
    },
  },
});
