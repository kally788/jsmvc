/*!
 *       888    d8888b       d8b   d8b    888   888    d8888b
 *       888 d88          d88   888   88b 888   888 d88      88b
 *       888    d8888b    888   888   888 888   888 888
 * d88   88b          88b 888   888   888 d88   88b d88      88b
 * d8888888b    d8888b    888   888   888    d8b       d8888b
 *
 * JsMvc v1.0
 * http://jsmvc.cn/code
 *
 * Copyright (c) 2016 JsMvc
 * Released under the MIT license
 * http://jsmvc.cn/license
 */

/**
 * @type class
 * @desc Model 模块超类，负责数据业务处理和与服务器通信，注册到框架上的 model 均为单例。所有通过 $jsmvc$.facade.reqModel 注册的模块都会自动继承该超类
 * @example
 * 在 js/model 目录中新建一个 Hi 类，用来向其它模块提供数据内容
 * <code>
 * js.model.Hi = function () {
 *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
 *      var protected;
 *      //模版被创建时的事件
 *      this.onCreate = function(parent){
 *          protected = parent;
 *          //初始化时添加一个数据对象
 *          protected.setData({v:"hello!~"});
 *      }
 *      //创建一个公共函数来对外提供数据获取
 *      this.getV = function(){
 *          return protected.getData().v;
 *      }
 * };
 * </code>
 * 在任何模块中都可以获取到 Hi 模块的数据
 * <code>
 * //在控制台打印 Hi 模块提供的数据
 * console.log($jsmvc$.facade.reqModel("js.model.Hi").getV());
 * </code>
 */
$jsmvc$.core.ModelAbs = function (className) {

    //储存到模块中的数据对象
    var data;
    var self = this;

    //--------------------------------------------------------------------------------------------------
    //                  保护方法
    //--------------------------------------------------------------------------------------------------

    /**
     * @type function
     * @name setData
     * @modification pro
     * @desc 添加/覆盖数据。 setData 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @param v:{*} 任意类型
     * @example
     * 在模块创建时初始化添加一个数据对象
     * <code>
     * js.model.Hi = function () {
     *      //模版被创建时的事件
     *      this.onCreate = function(parent){
     *          //初始化时添加一个数据对象
     *          parent.setData({v:"hello!~"});
     *      }
     * };
     * </code>
     */
    var setData = function(v){
        data = v;
    }

    /**
     * @type function
     * @name getData
     * @modification pro
     * @desc 获取数据。 getData 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @returns {*} 任意类型
     * @example
     * 在模块创建时初始化添加一个数据对象，并提供外部访问函数
     * <code>
     * js.model.Hi = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模版被创建时的事件
     *      this.onCreate = function(parent){
     *          protected = parent;
     *          //初始化时添加一个数据对象
     *          protected.setData({v:"hello!~"});
     *      }
     *      //创建一个公共函数来对外提供数据获取
     *      this.getV = function(){
     *          return protected.getData().v;
     *      }
     * };
     * </code>
     * 在其它位置获取模块数据
     * <code>
     * //在控制台打印 Hi 模块提供的数据
     * console.log($jsmvc$.facade.reqModel("js.model.Hi").getV());
     * </code>
     */
    var getData = function(){
        return data;
    }

    //--------------------------------------------------------------------------------------------------
    //                  事件
    //--------------------------------------------------------------------------------------------------

    /**
     * @type event
     * @name onCreate
     * @desc 当模块被创建时触发，不可显式调用。模块的初始化操作应放在该事件中进行处理，您可以在子类重写该事件
     * @param parent:object 父类链中需要提供保护访问的属性或函数集合
     * @returns object 提供给子类保护访问的属性或函数集合
     * @example
     * 创建一个名称为 ExampleA 的 model 类，并把私有函数通过 onCreate 传递给子类
     * <code>
     * js.model.ExampleA = function () {
     *      //定义一个可以被子类所访问的私有函数
     *      var test = function(){
     *          return "my is ExampleA";
     *      }
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //模块的初始化操作
     *          //...
     *          //提供给子类访问的私有函数集合
     *          return {test:test}
     *      }
     * };
     * </code>
     * 创建一个名称为 ExampleB 的 model 类并继承 ExampleA
     * <code>
     * js.model.ExampleB = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //继承父类的私有函数
     *          protected = parent;
     *          //模块的初始化操作
     *          //...
     *          //调用父类的私有函数并打印返回值到控制台
     *          console.log(protected.test());
     *      }
     * }.extends("js.model.ExampleA");//继承 ExampleA
     * </code>
     */
    this.onCreate = function(parent){
        return {
            getData:getData,
            setData:setData
        };
    };

    /**
     * @type event
     * @name onDestroy
     * @desc 模块销毁。通过 $jsmvc$.facade.delModel 删除模块时触发，可显式调用
     * @example
     * 创建一个名称为 Hi 的 model 类
     * <code>
     * js.model.Hi = function () {
     *      //模版被创建时的事件
     *      this.onCreate = function(parent){
     *      }
     *      //重写 onDestroy 事件，如果没有需要自定义的销毁业务，不必重新该事件
     *      this.onDestroy = function(){
     *          //模块销毁前的业务处理
     *          console.log("模块即将删除！~");
     *          //重写 onDestroy 时必须显式调用父类的 onDestroy
     *          this.supers.onDestroy();
     *          //模块销毁后的业务处理
     *          console.log("模块被删除了！~");
     *      }
     * };
     * </code>
     * 在框架启动时注册 Hi 模块
     * <code>
     * $jsmvc$.run.addFacade(function(){
     *      this.startup = function(){
     *          //注册 Hi 模块
     *          $jsmvc$.facade.reqModel("js.model.Hi");
     *      }
     * });
     * </code>
     * 在其它任意模块中，通过调用 $jsmvc$.facade.delModel 来删除该模块
     * <code>
     *     //删除 model 模块
     *     $jsmvc$.facade.delModel("js.model.Hi");
     * </code>
     * 或者直接调用 onDestroy 来删除
     * <code>
     *     //删除 model 模块
     *     var p = $jsmvc$.facade.reqModel("js.model.Hi");
     *     p.onDestroy();
     * </code>
     */
    this.onDestroy = function(){
        self.onDestroy = undefined;
        $jsmvc$.facade.delModel(className);
    };

    //--------------------------------------------------------------------------------------------------
    //                  属性
    //--------------------------------------------------------------------------------------------------

    /**
     * @type attr
     * @name className
     * @desc 模块类名全路径字符串，如：a.b.c
     * @value string
     */
    this.className = className;

    /**
     * @type attr
     * @name supers
     * @desc 公共函数集合，当您在子类需要重写父类公共函数时，可以通过 supers 集合来调用父类的函数
     * @value object
     */
    this.supers = {};

}