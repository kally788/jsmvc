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
 * @desc
 * 控制器超类，负责协调模块之间的业务逻辑，控制器是无状态的，由广播触发执行后即销毁。所有通过 $jsmvc$.facade.reqContro 注册的模块都会自动继承该超类
 * 通过下面的例子说明如何利用控制器来降低模块之间的耦合和复杂度
 * @example
 * 需求：有 2 个 page 和 2 个 model 。2 个 page 业务相同，当用户点击页面按钮时，读取一个 model 的数据然后保存到另一个 model 中
 *
 * 创建一个名称为 modelA 的 model 模块，并对外提供一个读取数据的函数
 * <code>
 * js.model.modelA = function () {
 *      //创建一个公共函数来对外提供数据获取，返回数据 1
 *      this.getV = function(){
 *          return 1;
 *      }
 * };
 * </code>
 * 创建一个名称为 modelB 的 model 模块，并对外提供一个写入数据的函数
 * <code>
 * js.model.modelB = function () {
 *      var data = 0;
 *      //创建一个公共函数，用于保存数据
 *      this.setV = function(v){
 *          data += v;
 *      }
 * };
 * </code>
 * 创建 2 个 page 模块，名称为 pageA 和 pageB
 * 他们都有相同的逻辑，当用户点击页面按钮时，读取 modelA 的 getV 函数返回值加 100 然后调用 modelB 的 setV 来保存数据
 * <code>
 * js.page.pageA = function () {
 *      this.onCreate = function(parent){
 *          parent.setStage(document.body);
 *          var btn = parent.setDisplay($("<div>click btn</div>"));
 *          btn.click(function(){
 *              //当用户点击按钮时，获取 modelA 的值加 100 然后保存到 modelB 中
 *              var n = $jsmvc$.facade.reqModel("js.model.modelA").getV();
 *              $jsmvc$.facade.reqModel("js.model.modelB").setV(n+100);
 *          })
 *      }
 * };
 * </code>
 * <code>
 * js.page.pageB = function () {
 *      this.onCreate = function(parent){
 *          parent.setStage(document.body);
 *          var btn = parent.setDisplay($("<div>click btn</div>"));
 *          btn.click(function(){
 *              //当用户点击按钮时，获取 modelA 的值加 100 然后保存到 modelB 中
 *              var n = $jsmvc$.facade.reqModel("js.model.modelA").getV();
 *              $jsmvc$.facade.reqModel("js.model.modelB").setV(n+100);
 *          })
 *      }
 * };
 * </code>
 * 假如当用户点击按钮后的逻辑发生变化时，比如把增加的值改为 200 时或者 modelA 的函数名称发生改变时，那么您需要修改 pageA 和 pageB 中的逻辑
 * 实际上，您可以通过一个控制器来处理用户点击后的业务，参考如下：
 *
 * 新建一个控制器 controA，并实现 pageA 和 pageB 中点击事件后需要处理的业务
 * <code>
 * js.contro.controA = function (evtName, data) {
 *      var n = $jsmvc$.facade.reqModel("js.model.modelA").getV();
 *      $jsmvc$.facade.reqModel("js.model.modelB").setV(n+100);
 * };
 * </code>
 * 在框架启动时把控制器注册起来
 * <code>
 * $jsmvc$.run.addFacade(function(){
 *      //定义一个通知常量
 *      this.NOTICE_EXAMPLE = "notice_example";
 *      this.startup = function(){
 *          //注册控制器
 *          $jsmvc$.facade.reqContro("js.contro.controA", this.NOTICE_EXAMPLE);
 *      }
 * });
 * </code>
 * 之后，pageA 和 pageB 的点击事件处理中，只要发送一个 NOTICE_EXAMPLE 通知即可
 * 以后无论 modelA 和 modelB 的接口或点击后的控制业务如何变化，只要修改 controA 控制器即可
 * <code>
 * js.page.pageA = function () {
 *      this.onCreate = function(parent){
 *          parent.setStage(document.body);
 *          var btn = parent.setDisplay($("<div>click btn</div>"));
 *          btn.click(function(){
 *              //发送一个通知来让 controA 处理相关业务逻辑
 *              parent.sendBroadcast($jsmvc$.facade.NOTICE_EXAMPLE);
 *          })
 *      }
 * };
 * </code>
 * <code>
 * js.page.pageB = function () {
 *      this.onCreate = function(parent){
 *          parent.setStage(document.body);
 *          var btn = parent.setDisplay($("<div>click btn</div>"));
 *          btn.click(function(){
 *              //发送一个通知来让 controA 处理相关业务逻辑
 *              parent.sendBroadcast($jsmvc$.facade.NOTICE_EXAMPLE);
 *          })
 *      }
 * };
 * </code>
 * 在实际开发项目中，业务和模块中的耦合度比例子中的情况要复杂得多，您需要根据实际情况确定如何应用控制器来减少模块的耦合和复杂度。
 */
$jsmvc$.core.ControAbs = function (className) {

    //--------------------------------------------------------------------------------------------------
    //                  事件
    //--------------------------------------------------------------------------------------------------

    /**
     * @type event
     * @name onCreate
     * @desc 当控制器被执行时触发，您可以在子类重写该事件
     * @param parent:object 父类链中需要提供保护访问的属性或函数集合
     * @returns object 提供给子类保护访问的属性或函数集合
     * @example
     * 创建一个名称为 ExampleA 的控制，并把私有函数通过 onCreate 传递给子类
     * <code>
     * js.contro.ExampleA = function (evtName, data) {
     *      //定义一个可以被子类所访问的私有函数
     *      var test = function(){
     *          return "my is ExampleA";
     *      }
     *      //控制器被执行时的事件
     *      this.onCreate = function(parent){
     *          //提供给子类访问的私有函数集合
     *          return {test:test}
     *      }
     * };
     * </code>
     * 创建一个名称为 ExampleB 的控制器并继承 ExampleA
     * <code>
     * js.contro.ExampleB = function (evtName, data) {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //控制器被执行时的事件
     *      this.onCreate = function(parent){
     *          //继承父类的私有函数
     *          protected = parent;
     *          //调用父类的私有函数并打印返回值到控制台
     *          console.log(protected.test());
     *      }
     * }.extends("js.contro.ExampleA");//继承 ExampleA
     * </code>
     */
    this.onCreate = function(parent){
        return null;
    };

    //--------------------------------------------------------------------------------------------------
    //                  属性
    //--------------------------------------------------------------------------------------------------

    /**
     * @type attr
     * @name className
     * @desc 控制器类名全路径字符串，如：a.b.c
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