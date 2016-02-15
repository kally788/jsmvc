/**
 * Created by zhujili on 2015/11/5.
 * 添加一个自定义 facade
 * 创建一个全局常量对象和一个工具库对象
 * 重写启动函数并注册必要的模块
 */

$jsmvc$.run.addFacade(function(){

    //实例化一个常量对象
    this.cons = new js.constant.Cons();

    //实例化一个工具对象
    this.utils = new $library$.Utils();

    //框架启动
    this.startup = function(){

        $jsmvc$.facade.reqContro("js.contro.ChangeView", this.cons.GET_NOTICE_NAME());//注册一个用于改边显示内容的控制器
        $jsmvc$.facade.reqModel("js.model.Hi");//注册一个获取问候语的数据模型
        $jsmvc$.facade.reqPage("js.page.HelloWorld").showPage();//注册一个显示页面并调用显示函数
    }

});