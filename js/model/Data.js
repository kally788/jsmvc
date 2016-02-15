/**
 * Created by zhujili on 2015/11/7.
 * 初始化时创建一个 GreetVO 数据对象
 * 该类用于被 Hi 类继承，主要用于演示模块之间的继承方式
 */

js.model.Data = function () {

    //模块初始化时调用超类的包含函数创建一个 GreetVO 数据对象
    this.onCreate = function(parent){
        parent.setData(new js.model.vo.GreetVO());
    }
}