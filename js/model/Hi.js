/**
 * Created by zhujili on 2015/11/7.
 * 一个继承 js.model.Data 类的数据模型
 * 用于对外部提供数据访问
 * 同时用于演示模块之间的继承关系
 */

js.model.Hi = function () {

    //父类保护函数集合引用
    var protected;

    this.onCreate = function(parent){
        //保存父类保护函数集合到一个私有变量中
        protected = parent
    }

    //提供外部获取数据的接口
    this.getMsg = function(){
        return protected.getData().msg;
    }

}["extends"]("js.model.Data");