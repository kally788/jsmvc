/**
 * Created by zhujili on 2015/11/5.
 * 获取数据模型中的值并调用 HelloWorld 模块的公共函数来改变页面上的文字
 * 该类用于演示项目中控制器的使用
 */

js.contro.ChangeView = function (evtName, data) {

    //收到广播后，调用MODEL接口获取数据，并调用PAGE接口修改页面
    $jsmvc$.facade.reqPage("js.page.HelloWorld").changeMsg($jsmvc$.facade.reqModel("js.model.Hi").getMsg());

}