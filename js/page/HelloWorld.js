/**
 * Created by zhujili on 2015/11/7.
 * 创建一个显示模块
 * 初始化时创建 HTML 模版对象，并添加交互事件逻辑
 * 提供一个公共函数用于外部调用来改变页面的内容
 */

js.page.HelloWorld = function () {

    //显示对象引用
    var html;
    //模块作用域，当你在一个闭包中需要访问模块的根域时，需要通过 self 来访问，因为通过 this 会访问到闭包中的域
    var self = this;
    //父类保护函数集合引用
    var protected;

    //模块初始化时创建 HTML，并添加点击事件到按钮上
    this.onCreate = function(parent){
        //保存父类保护函数集合到一个私有变量中
        protected = parent;
        //调用父类保护函数把 body 设置为舞台（页面内容将被添加到 body 中）
        protected.setStage(document.body);
        //把 HTML 模版创建为显示对象并转换为 JQ 对象
        html = $(protected.setDisplay("html.helloWorld"));
        //添加按钮事件
        html.find("span:eq(0)").on("click",function(){
            //点击按钮时，发送一个广播来触发 ChangeView 控制器，由 ChangeView 控制来改变页面的内容
            $jsmvc$.facade.sendBroadcast($jsmvc$.facade.cons.GET_NOTICE_NAME());
            //隐藏按钮并把第二个按钮显示出来
            $(this).hide();
            html.find("span:eq(1)").show();
        });
        html.find("span:eq(1)").on("click",function(){
            //点击按钮后显示一个扩展模块
            $jsmvc$.facade.reqPage("ext.example_interior.js.page.Interior").showPage();
        });
        //默认第二个按钮隐藏
        html.find("span:eq(1)").hide();
    };

    //公共函数，用于改变页面上的文本
    this.changeMsg = function(msg){
        html.find("H1").html(msg)
    }

}