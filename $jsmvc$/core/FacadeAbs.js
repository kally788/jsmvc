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
 * @desc Facade 超类，负责启动框架、初始化操作和各个模块的注册。通过 $jsmvc$.run.addFacade 添加的类会自动继承该超类
 * @example
 * 您需要实现超类中的 startup 方法。并通过 $jsmvc$.run.addFacade 方法来添加 facade 实例。一开始需要注册的模块，可放在 startup 中进行注册
 * <code>
 * $jsmvc$.run.addFacade(function(){
 *      //这里可以定义一些全局的属性
 *      this.x = "示例";//其它位置可通过 $jsmvc$.facade.x 来访问 x 属性
 *      this.startup = function(){
 *          //启动业务逻辑，您可以在这里初始化注册必须的模块、
 *          $jsmvc$.facade.reqPage("js.page.HelloWorld").showPage();//注册 HelloWorld 模块并显示
 *      }
 * });
 * </code>
 * 通过 $jsmvc$.run.addFacade 添加的类会自动继承 FacadeAbs 超类，您可以通过 $jsmvc$.facade 对象来访问超类中的方法和 Facade 实现类的方法
 * <code>
 *     console.log($jsmvc$.facade.x);//控制台打印自定义 Facade 实现类的 x 属性
 *     $jsmvc$.facade.reqModel("js.model.Hi");//调用 Facade 超类的 reqModel 方法注册 Hi 模块
 *     $jsmvc$.facade.sendBroadcast("TEST");//调用 Facade 超类的 sendBroadcast 方法来发送一个名称为 TEST 的广播
 * </code>
 */
$jsmvc$.core.FacadeAbs = function (template) {

    var self = this;
    //模块容器
    var model = {},page = {},contro = {};
    //观察者列表
    var observer = {};
    //广播ID
    var noticeID = 0;
    //错误消息提示
    var errMsg = {
        "err1":"Can't find JS class # ",
        "err2":"Can't find HTML template # ",
        "err3":"Error:Loop extends # "
    }

    //创建继承链
    var createExtends = function(classFunc, className, type, chain, topClassName, evtName, evtData){
        chain[className] = true;
        var abs,absP,absM,absC,obj,protect,parent;
        //创建超类
        absP = $jsmvc$.core.PageAbs;
        absM = $jsmvc$.core.ModelAbs;
        absC = $jsmvc$.core.ControAbs;
        switch (type){
            case "page":
                abs = absP;
                break;
            case "model":
                abs = absM;
                break;
            case "contro":
                abs = absC;
                break;
        }
        if(classFunc.parentClass && typeof classFunc.parentClass == "string"){
            var pClass = findClass(classFunc.parentClass);
            if(chain[classFunc.parentClass]){
                alert(errMsg.err3+classFunc.parentClass);
                throw errMsg.err3+classFunc.parentClass;
            }
            parent = createExtends(pClass, classFunc.parentClass, type, chain, topClassName);
            if(pClass === absP || pClass === absM || pClass === absC){
                obj = new pClass(topClassName);
            }else{
                pClass.prototype.constructor = pClass;
                obj = type=="contro"?new pClass(evtName, evtData):new pClass();
            }
        }else if(abs && classFunc !== abs){
            //注册到框架中的3大模块默认继承超类
            obj = new abs(topClassName);
        }
        var supers = {};
        if(obj){
            for(var i in obj){
                if(i != "supers" && i != "onCreate" && i != "constructor" && obj[i] != undefined){
                    supers[i] = obj[i];
                }
            }
            if(parent){
                obj.supers = parent.supers;
            }
            if(obj.onCreate && typeof obj.onCreate == "function"){
                protect = obj.onCreate(parent?parent.protect:{});
                delete obj.onCreate;
            }
            classFunc.prototype = obj;
        }
        //继承父类保护链
        var newProtect = {};
        if(parent){
            for(var i in parent.protect){
                newProtect[i] = parent.protect[i];
            }
        }
        if(protect && typeof protect == "object"){
            for(var i in protect){
                newProtect[i] = protect[i];
            }
        }
        return {protect:newProtect, supers:supers};
    }

    //检查类的继承链是否存在错误
    var inspectExtends = function(classFunc){
        if(classFunc.parentClass && typeof classFunc.parentClass == "string"){
            inspectExtends(findClass(classFunc.parentClass))
        }
    }

    //根据类路径，查找出相关的类
    var findClass = function(className){
        var classFunc;
        if(className && typeof className == "string"){
            var routeList = className.split(".");
            var classFunc = window[routeList[0]];
            if(classFunc){
                for(var i=1;i<routeList.length;i++){
                    classFunc = classFunc[routeList[i]];
                    if(!classFunc){
                        break;
                    }
                }
            }
        }
        if(!classFunc || typeof classFunc != "function"){
            alert(errMsg.err1+className);
            throw errMsg.err1+className;
        }
        return classFunc;
    }

    //获取HTML模版
    var getTemplate = function(templateName){
        if(!template || !template[templateName]){
            alert(errMsg.err2 + templateName);
            throw errMsg.err2 + templateName;
        }
        return template[templateName];
    }

    //订阅广播
    var attachNotice = function(evtName, cb){
        if (typeof cb != "function" && typeof cb != "string") {
            return -1;
        }
        if(!observer[evtName]){
            observer[evtName] = {};
        }
        observer[evtName][++noticeID] = cb;
        return noticeID;
    }

    //取消广播订阅
    var removeNotice = function(evtName, evtId){
        if(observer[evtName] && observer[evtName][evtId]){
            delete observer[evtName][evtId];
            return true;
        }
        return false;
    }

    //给PAGE抽象类添加顶级函数
    $jsmvc$.core.PageAbs.prototype.getTemplate = getTemplate;
    $jsmvc$.core.PageAbs.prototype.attachNotice = attachNotice;
    $jsmvc$.core.PageAbs.prototype.removeNotice = removeNotice;

    //发布广播
    var sendBroadcast = function(evtName, data){
        if(!observer[evtName]){
            return -1;
        }
        var count = 0;
        for(var i in observer[evtName]){
            var func = observer[evtName][i];
            if(typeof func == "function"){
                func(evtName, data);
            }else{
                newInstance(func, "contro", evtName, data);
            }
            count ++;
        }
        return count;
    }

    //注册MODEL模块
    var reqModel = function(className){
        if(model[className]){
            return model[className];
        }
        return model[className] = newInstance(className,"model");
    }

    //注册PAGE模块
    var reqPage = function(className){
        if(page[className]){
            return page[className];
        }
        return page[className] = newInstance(className,"page");
    }

    //注册CONTRO模块
    var reqContro = function(className, evtName){
        if(contro[className]){
            return;
        }
        inspectExtends(findClass(className));
        contro[className] = {evtName:evtName, evtId:attachNotice(evtName, className)};
    }

    //移除MODEL模块
    var delModel = function(className){
        findClass(className);
        var obj = model[className];
        if(obj){
            delete model[className];
            if(typeof obj.onDestroy == "function"){
                obj.onDestroy();
            }
        }
    }

    //移除PAGE模块
    var delPage = function(className){
        findClass(className);
        var obj = page[className];
        if(obj){
            delete page[className];
            if(typeof obj.onDestroy == "function"){
                obj.onDestroy();
            }
        }
    }

    //移除CONTRO模块
    var delContro = function(className){
        findClass(className);
        if(contro[className]){
            removeNotice(contro[className].evtName, contro[className].evtId);
            delete contro[className];
        }
    }

    //新建一个实例
    var newInstance = function(className, type){
        var mClass = findClass(className);
        var parent;
        if(type == "contro"){
            parent = createExtends(mClass, className, type ? type : null, {}, className, arguments[2], arguments[3]);
        }else{
            parent = createExtends(mClass, className, type ? type : null, {}, className);
        }
        mClass.prototype.constructor = mClass;
        var obj = type == "contro"?new mClass(arguments[2],arguments[3]):new mClass();
        obj.supers = parent.supers;
        if(obj.onCreate && typeof obj.onCreate == "function"){
            obj.onCreate(parent.protect);
            delete obj.onCreate;
        }
        return obj;
    }

    //--------------------------------------------------------------------------------------------------
    //                  公共方法
    //--------------------------------------------------------------------------------------------------

    /**
     * @type function
     * @name sendBroadcast
     * @desc 发布广播
     * @param evtName:string 要派发的事件名
     * @param evtData:object 派发的数据对象
     * @returns number 派发次数
     * @example
     * 发送一个名称为 TEST 的广播，并附带一个 object 数据对象
     * <code>
     *     //在任何模块中，都可以调用 sendBroadcast 来发送广播
     *     $jsmvc$.facade.sendBroadcast("TEST",{v:123});
     * </code>
     * 订阅方式1：在 page 模块中订阅该广播，参考 $jsmvc$.core.PageAbs
     * <code>
     * js.page.Example = function () {
     *     this.onCreate = function(parent){
     *          parent.attachNotice("TEST",function(evtName,evtData){
     *              console.log(evtData.v);//控制台打印收到的广播数据
     *          });
     *     }
     * }
     * </code>
     * 订阅方式2：定义一个控制器来处理 TEST 消息，参考 $jsmvc$.core.ControAbs
     * <code>
     * //在 js/contro 目录下新建一个名称为 Example 的控制器类
     * js.contro.Example = function (evtName, evtData) {
     *      console.log(evtData.v);//控制台打印收到的广播数据
     * }
     * //在任何模块中，通过调用 reqContro 把控制器注册到 TEST 消息
     * //通常在 Facade 的 startup 方法中把需要注册的控制器在框架启动时就注册起来
     * $jsmvc$.facade.reqContro("js.contro.Example", "TEST");
     * </code>
     */
    this.sendBroadcast = sendBroadcast;

    /**
     * @type function
     * @name reqModel
     * @desc 注册 MODEL 模块并返回实例（单例）
     * @param className:string 类命全路径，如：a.b.c
     * @returns object Model 类单例，多次注册始终返回同一实例
     * @example
     * 在 js/model 目录下新建一个名称为 Example 的 Model 类，参考 $jsmvc$.core.ModelAbs
     * <code>
     * js.model.Example = function () {
     *     this.onCreate = function(parent){
     *          //初始化模块操作
     *     }
     *     //创建一个 Model 的公共方法
     *     this.test = function(){
     *          return "test";
     *     }
     * }
     * </code>
     * 注册 Example 类到框架。根据实际情况，可以在 Facade 的 startup 方法中注册或者是使用到的时候注册
     * <code>
     *     var example = $jsmvc$.facade.reqModel("js.model.Example");
     *     console.log(example.test());//控制台打印 Example 模块中 test 方法的返回值
     * </code>
     */
    this.reqModel = reqModel;

    /**
     * @type function
     * @name reqPage
     * @desc 注册 PAGE 模块并返回实例（单例）
     * @param className:string 类命全路径，如：a.b.c
     * @returns object Page 类单例，多次注册始终返回同一实例
     * @example
     * 在 js/page 目录下新建一个名称为 Example 的 Page 类，参考 $jsmvc$.core.PageAbs
     * <code>
     * js.page.Example = function () {
     *     this.onCreate = function(parent){
     *          //设置 body 为该模块的舞台，即模显示的内容放置在 body 中
     *          parent.setStage(document.body);
     *          //设置 HTML 模版，需要确保 html 目录下有 Example.html 模版文件（名字区分大小写）
     *          parent.setDisplay("html.Example");
     *     }
     * }
     * </code>
     * 注册 Example 类到框架。根据实际情况，可以在 Facade 的 startup 方法中注册或者是使用到的时候注册
     * <code>
     *     var example = $jsmvc$.facade.reqPage("js.page.Example");
     *     example.showPage();//显示 Page 模块到 body 中，showPage 是 PageAbs 超类中的方法。
     * </code>
     */
    this.reqPage = reqPage;

    /**
     * @type function
     * @name reqContro
     * @desc 注册 CONTRO 模块并进行事件监听
     * @param className:string 类命全路径，如：a.b.c
     * @param evtName:string 事件名称
     * @example
     * 在 js/contro 目录下新建一个名称为 Example 的控制器类，参考 $jsmvc$.core.ControAbs
     * <code>
     * js.contro.Example = function (evtName,evtData) {
     *     this.onCreate = function(parent){
     *          //控制器业务处理
     *          console.log("控制器被执行了,evtData:"+evtData.v);
     *     }
     * }
     * </code>
     * 注册 Example 控制器到框架。根据实际情况，可以在 Facade 的 startup 方法中注册或者是使用到的时候注册
     * <code>
     *     //注册一个关注消息名称为 TEST 的控制器
     *     $jsmvc$.facade.reqContro("js.contro.Example", "TEST");
     * </code>
     * 发送一个通知来执行刚才注册的控制器，并附带一个 object 给控制器
     * <code>
     *     //在任何模块中，都可以调用 sendBroadcast 来发送广播
     *     $jsmvc$.facade.sendBroadcast("TEST",{v:123});
     * </code>
     */
    this.reqContro = reqContro;

    /**
     * @type function
     * @name delModel
     * @desc 移除 MODEL 模块，调用该方法会触发模块的 onDestroy 事件
     * @param className:string 类命全路径，如：a.b.c
     * @example
     * <code>
     *     //把名称为 Example 的 model 模块从框架中移除
     *     $jsmvc$.facade.delModel("js.model.Example");
     * </code>
     */
    this.delModel = delModel;

    /**
     * @type function
     * @name delPage
     * @desc 移除 PAGE 模块，调用该方法会触发模块的 onDestroy 事件
     * @param className:string 类命全路径，如：a.b.c
     * @example
     * <code>
     *     //把名称为 Example 的 page 模块从框架中移除
     *     $jsmvc$.facade.delPage("js.page.Example");
     * </code>
     */
    this.delPage = delPage;

    /**
     * @type function
     * @name delContro
     * @desc 移除控制器并删除对应事件侦听
     * @param className:string 类命全路径，如：a.b.c
     * @example
     * <code>
     *     //把名称为 Example 的控制从框架中移除
     *     $jsmvc$.facade.delContro("js.contro.Example");
     * </code>
     */
    this.delContro = delContro;

    /**
     * @type function
     * @name newInstance
     * @desc
     * 新建一个实例。该函数创建的类并不会注册到框架上，而是一个普通的类实例，如同 new 方式实例化的对象一样
     * 与 new 的区别在于使用 newInstance 方式实例化的类可以采用框架的继承方式，详细可参考 jsmvc 继承相关文档
     * @param className:string 类命全路径，如：a.b.c
     * @param type:string [ 可选 ] 指定超类的类型，值为：page、model、contro。无参数时，不继承任何超类
     * @returns object 类的对象
     * @example
     * 在 js/custom 目录下新建一个名称为 ExampleA 的普通类
     * <code>
     * js.custom.ExampleA = function () {
     *     //定义一个私有方法
     *     var me = function(){
     *          return "我是类A的私有方法";
     *     }
     *     //定义一个公共方法
     *     this.a = function(){
     *          return "我是类A的公共方法";
     *     }
     *     this.onCreate = function(parent){
     *          //把私有方法提供给子类作为保护方法访问
     *          return {me:me};
     *     }
     * }
     * </code>
     * 在 js/custom 目录下新建一个名称为 ExampleB 的普通类，并继承类 ExampleA
     * <code>
     * js.custom.ExampleB = function () {
     *     this.b = function(){
     *          return "我是类B的公共方法";
     *     }
     *     this.onCreate = function(parent){
     *          console.log("打印父类保护方法 me 的返回值:"+parent.me());
     *     }
     * }.extends("js.custom.ExampleA");
     * </code>
     * 通过 newInstance 实例化 ExampleB 类，并调用相关的公共方法
     * <code>
     *     var test = $jsmvc$.facade.newInstance("js.custom.ExampleB");
     *     //test 实例的 a、b 方法为公共方法，外界可以直接访问，而 me 为保护方法，只可在子类中访问
     *     console.log("打印 test 实例的 b 方法返回值:"+test.b());
     *     console.log("打印 test 实例的父类 a 方法返回值:"+test.a());
     * </code>
     */
    this.newInstance = newInstance;

    /**
     * @type function
     * @name startup
     * @desc 启动函数，需要在子类中重写该方法，该方法无需手动调用，当框架加载完毕时会自动调用，并且只会调用一次
     * @example
     * 您需要在 js 根目录下创建一个新的 js 文件，并按照以下例子来添加 facade 类
     * <code>
     * $jsmvc$.run.addFacade(function(){
     *      //这里可以定义一些全局的属性、
     *      this.x = "示例";//其它位置可通过 $jsmvc$.facade.x 来访问 x 属性
     *      this.startup = function(){
     *          //启动业务逻辑，您可以在这里初始化注册必须的模块、
     *          $jsmvc$.facade.reqPage("js.page.HelloWorld").showPage();//注册 HelloWorld 模块并显示
     *      }
     * });
     * </code>
     */
    this.startup = function(){
        //启动业务
    }

    //--------------------------------------------------------------------------------------------------
    //                  属性
    //--------------------------------------------------------------------------------------------------

    /**
     * @type attr
     * @name supers
     * @desc 公共函数集合，当您在子类需要重写父类公共函数时，可以通过 supers 集合来调用父类的函数
     * @value object
     */
    this.supers = {}

}