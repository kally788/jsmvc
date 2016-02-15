/**
 * Created by zhujili on 2015/11/17.
 * 这是一个常量类，在 facade 类中实例化并提供给全局调用
 */

js.constant.Cons = function () {

    //把所有产量定义为私有变量
    var NOTICE_NAME = "contro_change_greet";

    //提供变量获取方法，通过只读方式来获取变量值可防止变量值被修改
    this.GET_NOTICE_NAME = function(){
        return NOTICE_NAME;
    }

};