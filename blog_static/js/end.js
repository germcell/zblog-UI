// 登录表单验证
function checkForm() {
    var reg = /^[0-9a-zA-Z\u4e00-\u9fa5-.]{1,18}$/;
    var nickname = $(".loginForm .nickname").val();
    var pwd = $(".loginForm .pwd").val();
    if (reg.test(nickname) && reg.test(pwd)) {
        return true;
    } else {
        $(".prompt").html("请输入用户名或密码");
        return false;
    }
}

// 注册表单验证
function checkRegisterForm() {
    var reg = /^[0-9a-zA-Z\u4e00-\u9fa5-.]{1,18}$/;
    var reg_pwd = /^[0-9a-zA-Z-.=+*/~!@#$%^&?]{1,18}$/;
    var nickname = $(".register-nickname").val();
    var pwd = $(".register-pwd").val();
    var repeat_pwd = $(".register-repeat-pwd").val();
    var code = $(".register-code").val();

    if (reg.test(nickname) && reg_pwd.test(pwd) && reg_pwd.test(repeat_pwd) && reg.test(code)) {
        if (pwd === repeat_pwd) {
            $(".prompt-reg").html("");
            return true;
        } else {
            $(".prompt-reg").html("两次输入的密码不相同");
            return false;
        }
    } else {
        $(".prompt-reg").html("请填写信息,密码可用特殊字符-.=+*/~!@#$%^&?");
        return false;
    }
}

$(function () {
    /* -----------发起注册请求 ------------- */
    $("#register-btn").on("click", function () {
        if (checkRegisterForm()) {
            $.post("/admin/register.do", $(".registerFrom").serialize(), function (result) {
                if (result.code == 4417) {
                    $(".prompt-reg").html("验证码有误");
                } else {
                    alert(result.message);
                    window.location.replace("/admin");
                }
            })
        }
    })

    /* --------------- 获取验证码-----------  */
    $("#register-btn").attr("disabled", "disabled");  // 未验证码时将注册按钮禁用,待异步提交成功后启用
    var timer;
    var sec = 60;
    var reg_email = /^\w{1,}@\w{1,}\.\w{1,}$/;
    var validateBtn = $(".validate-btn");
    validateBtn.on("click", function () {
        var mail = $(".register-mail").val();
        if (reg_email.test(mail)) {
            $(".prompt-reg").html("");
            // 异步获取验证码
            $.get("/admin/validate",{"mail":mail}, function (result) {
                if (result.code == 4416) {
                    // 验证码按钮定时器
                    timer = window.setInterval( function () {
                        validateBtn.html("获取验证码")
                        validateBtn.removeAttr("disabled");
                        window.clearTimeout(timer);
                    }, "60000");
                    validateBtn.prop("disabled", "disabled");
                    validateBtn.html("60s后重试");
                    $("#register-btn").removeAttr("disabled");
                    alert(result.message)
                } else if (result.code == 4420) {
                    alert(result.message)
                } else {
                    alert(result.code + " : " + result.message);
                }
            })
        } else {
            $(".prompt-reg").html("邮箱格式错误");
        }
    })

    /*-----------category.html 新建分类模态框-------------*/
    $("#add-category").on("click", function() {
        $('.fullscreen.modal').modal('show');
    })

    /*-----------category.html 新建分类提交,上传文件需使用 $.ajax 才能提交,且下列属性为必填项-------------*/
    $("#submit-btn").on("click", function () {
        // console.log("提交成功")
        // var data = $("#categoryForm");
        var formData = new FormData(document.getElementById("categoryForm"));
        $.ajax({
            type: "POST",
            url: "/admin/category/add",
            data: formData,
            async: false,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.code == 4421) {
                    alert(result.message);
                    location.reload();
                } else {
                    alert(result.message)
                }
            },
            error: function() {
                alert("新建失败:请按要求填写信息");
            }
        })
    })

    /*-----------category.html 删除分类-------------*/
    var cid;
    $(".m-delete").on("click", function (e) {
        cid = $(this).parent().parent().find(".cid").val();
        $('.ui.basic.modal').modal('show');
    })
    $("#delete-btn").on("click", function () {
        $.ajax({
            url: "/admin/category/del/" + cid,
            type: "POST",
            data: cid + "&_method=DELETE",
            success: function (result) {
                if (result.code == 4423) {
                    alert(result.message);
                    location.reload();
                } else {
                    alert(result.message);
                }
            },
            error: function () {
                alert("删除失败:500");
            }
        })
    })

    /*-----------category.html 编辑分类-------------*/
    var originalName;
    var originalDescription;
    var cid;
    $(".m-modify").on("click", function () {
        originalName = $(this).parent().parent().find(".m-original-name").attr("data-original-name");
        originalDescription = $(this).parent().parent().find(".m-original-description").attr("data-original-description");
        cid = $(this).parent().parent().find(".cid").val();
        $("#modifyForm :input[name=name]").attr("value", originalName);
        $("#modifyForm :input[name=description]").html(originalDescription);
        $(".ui.fullscreen2.modal").modal("show");
    })
    $("#modify-btn").on("click", function () {
            var formData = new FormData(document.getElementById("modifyForm"));
            // console.log(formData)
            $.ajax({
                url: "/admin/category/update/" + cid,
                type: "POST",
                data: formData,
                async: false,
                processData: false,
                contentType: false,
                success: function (result) {
                    if (result.code == 4421) {
                        alert(result.message);
                        location.reload();
                    } else {
                        alert(result.message);
                    }
                },
                error: function () {
                    alert("编辑失败:500");
                }
            })
    })

    /*-----------blog.html 删除博客-------------*/
    var bid;
    $(".m-blog-delete").on("click", function () {
        bid = $(this).parent().parent().find(".bid").val();
        $('.ui.basic.modal').modal('show');
    })
    $("#blog-delete-btn").on("click", function () {
        // console.log(bid)
        $.ajax({
            url: "/admin/blogs/del/" + bid,
            type: "POST",
            data: cid + "&_method=DELETE",
            success: function (result) {
                if (result.code == 5050) {
                    alert(result.message);
                    location.reload();
                } else {
                    alert(result.message);
                }
            },
            error: function () {
                alert("删除失败 : 500");
            }
        })
    })

    /*-----------blog_add.html 保存草稿按钮-------------*/
    $('#blog-draft-btn').on('click', function () {
        $('#blogEditForm :input[name=isPublish]').prop('value','false');
        $('#blogEditForm').submit();
    })

    /*-----------blog_add.html 发布按钮-------------*/
    $('#blog-publish-btn').on('click', function () {
        $('#blogEditForm :input[name=isPublish]').prop('value','true');
        $('#blogEditForm').submit();
    })

})

/*-----------blog.html 博客搜索-------------*/
function checkBlogSearchForm() {

    const categoryId = $("#blogSearchForm :input[name=categoryId]").val();
    const title = $("#blogSearchForm :input[name=title]").val();
    // if (title.trim() === "" && categoryId == 0) {
    //     return false;
    // }
    const url = "/admin/blogs/page/1/search?" + $("#blogSearchForm").serialize();
    $("#blogSearchForm").attr("action", url);
    return true;
}

/*-----------category.html 分类搜索-------------*/
function searchCategory() {
    var condition = $(".condition").val();
    // 条件为空时，查询所有
    if (condition.trim().length == 0) {
        var url = "/admin/category/" + 1;
        $("#searchForm").attr("action", url);
        return true;
    }
    // 提交不为空时，条件查询
    var url = "/admin/category/"+ condition + "/" + 1;
    $("#searchForm").attr("action", url);
    return true;
}

