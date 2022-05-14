$(function () {

    /* 回车提交搜索表单 */
    $('.ui.form :input[name=search]').on('keypress', function (e) {
        if (e.keyCode == 13) {
            return search();
        } else {
            return false;
        }
    });

    // 输入框的焦点事件
    // $('.ui.form :input[name=search]').focus(function (ele) {
    //     initSearchCondition = ele.currentTarget.attributes.getNamedItem('value').textContent;
    //     // $('.ui.form :input[name=search]').attr('value', '');
    //     var ph = ele.currentTarget.attributes.getNamedItem('placeholder').textContent;
    //     console.log(ph);
    // })
    // $('.ui.form :input[name=search]').blur(function () {
    //     $('.ui.form :input[name=search]').attr('value', initSearchCondition);
    // })


})

$(function() {
    /*------------移动端显示导航栏------------- */
    $("#m-show-nav").on("click", function() {
        $(".m-item").toggle("fast",function(){
            $(".m-item").removeClass("m-mobile-hide");
        });
    });
    /*------------关于我模态框------------*/
    $("#about-me").on("click", function() {
        console.log(1)
        $('.ui.modal').modal('show');
    });
    /*-----------关于我QQ------------*/
    $(".m-qq").on("click", function() {
        // $(".m-qq-qr").fadeIn("slow")
        $(".m-qq-qr").toggle("slow", function() {
            $(".m-qq-qr").removeClass(".m-qq-qr")
        })
    })
    /*-----------关于我WeChat------------*/
    $(".m-wechat").on("click", function() {
        // $(".m-qq-qr").fadeIn("slow")
        $(".m-wechat-qr").toggle("slow", function() {
            $(".m-wechat-qr").removeClass(".m-wechat-qr")
        })
    });
    /*-----------关于我GitHub------------*/
    $(".m-github").on("click", function() {
        // $(".m-qq-qr").fadeIn("slow")
        $(".m-github-qr").toggle("slow", function() {
            $(".m-github-qr").removeClass(".m-github-qr")
        })
    });
})

/* 搜索条件检测，有输入则提交输入内容，没有输入则提交placeholder内容 */
function search() {
    // var initSearchCondition = $('#search_input').attr('value').val();
    var search = $('#search_input').prop('value');
    var ph = $('#search_input').prop('placeholder');
    if (search && typeof(search) != "undefined" && search!=0) {
        return true;
    } else {
        $('#search_input').prop('value', ph);
        return true;
    }
}

/* 下一页 */
function getNextPage(ele) {
    const nextPage = $(ele).attr("data-cp");
    const search = $('#search_input').attr('value');
    $("#blog_refresh").load(/*[[@{/blog/index/{currentPage}(currentPage=${pageInfo.nextPage})}]]*/"/blog/index/" + nextPage);
}

/* 上一页 */
function getPrePage(ele) {
    const prePage = $(ele).attr("data-cp");
    const search = $('#search_input').attr('value');
    $("#blog_refresh").load(/*[[@{/blog/index/{currentPage}(currentPage=${pageInfo.prePage})}]]*/"/blog/index/" + prePage);
}