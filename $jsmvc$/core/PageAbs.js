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
 * @desc Page 模块超类，负责页面交互和显示，注册到框架上的 page 均为单例。所有通过 $jsmvc$.facade.reqPage 注册的模块都会自动继承该超类
 * @example
 * 在 js/page 目录中新建一个 HelloWorld 类，并在 html 目录中添加一个 helloWorld.html 模版，内容可以是任意 html 标签
 * html 模版文件不需要有 <html> <head> <body> 这样的标签，只需要具体的内容，例如 <div>my is tpl...</div> 即可
 * <code>
 * js.page.HelloWorld = function () {
 *      //模版被创建时的事件
 *      this.onCreate = function(parent){
 *          //设置 body 为该模块的舞台，即模显示的内容放置在 body 中
 *          parent.setStage(document.body);
 *          //设置 HTML 模版，需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
 *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
 *          parent.setDisplay("html.helloWorld");
 *      }
 * };
 * </code>
 * 在框架启动时注册 HelloWorld 模块并且显示到浏览器上。在 facade 的 startup 方法中进行模块注册
 * <code>
 * $jsmvc$.run.addFacade(function(){
 *      this.startup = function(){
 *          //注册 HelloWorld 模块并调用 showPage 方法显示
 *          $jsmvc$.facade.reqPage("js.page.HelloWorld").showPage();
 *      }
 * });
 * </code>
 */
$jsmvc$.core.PageAbs = function (className) {

    //错误消息提示
    var errMsg = {
        "err1":"Stage must be '<HTML Element> or <JQuery Object>'",
        "err2":"Display must be '<HTML Element> or <JQuery Object> or <HTML Template Route String>'"
    };
    //舞台引用
    var stage;
    //HTML显示对象
    var display;
    var self = this;

    //检查是否为JQ对象
    var isJQuery = function(element){
        return window.jQuery && element instanceof window.jQuery;
    }

    //检查一个对象是否为HTML节点元素或者JQ对象
    var isElement = function(element){
        if(window.HTMLElement && element instanceof window.HTMLElement){
            return true;
        }
        if(window.Element && element instanceof window.Element){
            return true;
        }
        if(window.jQuery && element instanceof window.jQuery){
            return true;
        }
        if(!window.Element){
            try{
                //兼容IE6-7
                element.removeChild(element.appendChild(document.createElement("TEST")));
                return element.nodeType === 1;
            }catch (e){
                return false;
            }
        }
        return false;
    }

    //检查当前页面处于显示状态
    var isActive = function(matchStage){
        if(isElement(display)){
            var active = isJQuery(display)?(display.parent().length?true:false):(display.parentNode?true:false);
            if(active && matchStage){
                if(!stage){
                    return false;
                }
                if(isJQuery(stage)){
                    if(isJQuery(display)){
                        if($.contains(stage.get(stage.length-1),display.get(0))){
                            return active;
                        }
                    }else if($.contains(stage.get(stage.length-1),display)){
                        return active;
                    }
                }else{
                    if(isJQuery(display)){
                        if(display.parent().get(0) === stage){
                            return active;
                        }
                    }else if(display.parentNode === stage){
                        return active;
                    }
                }
                return false;
            }
            return active;
        }else{
            return false;
        }
    }

    //添加页面访问记录，继承FacadeAbs于的方法
    var addPageHistory = this.addPageHistory;
    this.addPageHistory = undefined;

    //取得上一个页面访问记录，继承FacadeAbs于的方法
    var prevPage = this.prevPage;
    this.prevPage = undefined;

    //取得下一个页面访问记录，继承FacadeAbs于的方法
    var nextPage = this.nextPage;
    this.nextPage = undefined;
    //--------------------------------------------------------------------------------------------------
    //                  保护方法
    //--------------------------------------------------------------------------------------------------

    /**
     * @type function
     * @name setStage
     * @modification pro
     * @desc
     * 设置舞台。当调用 showPage 时当前页面显示的位置，例如 body 或者其它的任意可用于添加显示元素的标签
     * setStage 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @param element:element|object 一个HTML节点元素或者JQ对象
     * @returns element|object 舞台对象
     * @example
     * 例子1：在模块初始化时进行舞台设置
     * <code>
     * js.page.HelloWorld = function () {
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //设置 body 为该模块的舞台，即模显示的内容放置在 body 中
     *          parent.setStage(document.body);
     *      }
     * };
     * </code>
     * 例子2：在需要的时候进行舞台设置
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *      }
     *      //自定义私有函数
     *      var test = function(element){
     *          //您自己的逻辑
     *          //...
     *          //调用父类函数来执行添加舞台操作
     *          protected.setStage(element);
     *      }
     * };
     * </code>
     */
    var setStage = function(element){
        if(!isElement(element)){
            alert(errMsg.err1);
            throw errMsg.err1;
        }
        if(stage && stage === element){
            return element;
        }
        return stage = element;
    }

    /**
     * @type function
     * @name getStage
     * @modification pro
     * @desc 获取舞台。 getStage 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @returns element 舞台对象引用
     * @example
     * 模块创建时添加一个舞台对象，之后在一个私有函数中进行获取
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //添加舞台引用
     *          protected.setStage(document.body);
     *      }
     *      //自定义私有函数
     *      var test = function(){
     *          //取得舞台
     *          var s = protected.getStage();
     *          //您的业务逻辑
     *          //...
     *      }
     * };
     * </code>
     */
    var getStage = function(){
        return stage;
    }

    /**
     * @type function
     * @name delStage
     * @modification pro
     * @desc 删除舞台同时移出已添加的显示对象。 delStage 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @returns boolean 成功或者失败
     * @example
     * 模块创建时添加一个舞台对象，之后在一个私有函数中进行删除
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //添加舞台引用
     *          protected.setStage(document.body);
     *      }
     *      //自定义私有函数
     *      var test = function(){
     *          //您的业务逻辑
     *          //...
     *          //移除舞台
     *          protected.delStage();
     *      }
     * };
     * </code>
     */
    var delStage = function(){
        if(stage){
            if(isActive(true)){
                isJQuery(display)?display.remove():display.parentNode.removeChild(display);
            }
            stage = undefined;
            return true;
        }
        return false;
    }

    /**
     * @type function
     * @name setDisplay
     * @modification pro
     * @desc
     * 设置显示对象，如果已经存在显示对象，那么新的显示对象会替换掉旧的，并在原位置显示
     * setDisplay 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @param element:string|element|JQuery 可以是一个element节点、JQ对象或者是HTML模版路径
     * @returns element|JQuery 添加后的显示对象
     * @example
     * 例子1：根据 HTML 模版路径添加显示对象
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
     *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
     *          protected.setDisplay("html.helloWorld");
     *      }
     * };
     * </code>
     * 例子2：把一个 HTML 节点元素作为显示对象添加
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //创建一个 HTML 节点并添加到模块上
     *          var e = document.createElement("DIV");
     *          e.innerHTML = "my is div..";
     *          protected.setDisplay(e);
     *      }
     * };
     * </code>
     * 例子3：把一个 JQ 对象作为显示对象添加
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //创建一个 JQ 对象并添加到模块上，JQ 对象请参考 JQuery 的文档
     *          //您需要确保已经加载了 JQuery 插件，参考 run 中加载资源的相关说明
     *          protected.setDisplay($("<div>my is jq object..</div>"));
     *      }
     * };
     * </code>
     */
    var setDisplay = function(element){
        if(!element || (typeof element != "string") && !isElement(element)){
            alert(errMsg.err2);
            throw errMsg.err2;
        }
        if(display && element === display){
            return element;
        }
        var oldElement;
        if(isActive(false)){
            oldElement = display;
        }
        //创建新的HTML内容
        if(typeof element != "string"){
            display = element;
        }else{
            var tpl = getTemplate(element);
            display = document.createElement("DIV");
            display.innerHTML = tpl.replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
            if(display.childNodes.length == 1){
                display = display.childNodes[0];
            }
        }
        //替换到已存在的HTML相同的位置上
        if(oldElement){
            if(isJQuery(oldElement)){
                oldElement.after(display);
                oldElement.remove();
            }else{
                if(isJQuery(display)){
                    display.insertAfter(oldElement);
                }else{
                    oldElement.parentNode.insertBefore(display, oldElement);
                }
                oldElement.parentNode.removeChild(oldElement);
            }
        }
        return display;
    }

    /**
     * @type function
     * @name getDisplay
     * @modification pro
     * @desc 获取已经添加的显示对象。 getDisplay 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @returns element|JQuery HTML 节点元素或者是 JQ 对象
     * @example
     * 在模块初始化时添加一个模版作为显示对象，并在一个私有函数中进行获取
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
     *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
     *          protected.setDisplay("html.helloWorld");
     *      }
     *      //自定义私有函数
     *      var test = function(){
     *          //获取已经添加的显示对象
     *          var e = protected.getDisplay();
     *          //您可以对 e 的内容进行业务处理
     *          //...
     *      }
     * };
     * </code>
     */
    var getDisplay = function(){
        return display;
    }

    /**
     * @type function
     * @name delDisplay
     * @modification pro
     * @desc 删除已经添加的显示对象。 delDisplay 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @returns boolean 成功或者失败
     * @example
     * 在模块初始化时添加一个模版作为显示对象，并在一个私有函数中进行删除
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
     *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
     *          protected.setDisplay("html.helloWorld");
     *      }
     *      //自定义私有函数
     *      var test = function(){
     *          //删除已经添加的显示对象
     *          protected.delDisplay();
     *      }
     * };
     * </code>
     */
    var delDisplay = function(){
        if(display){
            if(isActive(false)){
                isJQuery(display)?display.remove():display.parentNode.removeChild(display);
            }
            display = undefined;
            return true;
        }
        return false
    }

    /**
     * @type function
     * @name showHistory
     * @modification pro
     * @desc 当page重写showPage函数但又不需要调用父函数supers.showPage的情况下，需要调用本函数来记录页面访问记录，否则无法实现页面前进后退的功能。
     * @param arguments:array 任意长度的参数，调用showPage时会原样返回
     * @example
     * 重写showPage中调用showHistory来记录页面，如果调用了supers.showPage就无需调用showHistory
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *      }
     *      this.showPage = function(){
     *          //this.supers.showPage(); 使用自己的显示方式，不调用父类的showPage
     *          protected.showHistory();
     *          //您的页面显示业务
     *      }
     * };
     * </code>
     */
    var showHistory = function(){
        addPageHistory(className, arguments);
    };

    /**
     * @type function
     * @name showPrevPage
     * @modification pro
     * @desc 显示上一个页面，如果没有时，不会有任何变化。
     * @example
     * 点击某个按钮后，返回到上一个页面，类似点击浏览器上的后退按钮
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *      }
     *      this.showPage = function(){
     *          this.supers.showPage();
     *          //backbtn为您页面上的某个按钮
     *          backbtn.on("click",function(){
     *              protected.showPrevPage();
     *          });
     *      }
     * };
     * </code>
     */
    var showPrevPage = function(){
        var prev = prevPage();
        if(prev != undefined){
            var page = $jsmvc$.facade.reqPage(prev.className);
            if(typeof page.showPage == "function"){
                if(prev.arg.length > 0){
                    page.showPage.apply(page, prev.arg);
                }else{
                    page.showPage();
                }
            }
        }
    }

    /**
     * @type function
     * @name showNextPage
     * @modification pro
     * @desc 显示下一个页面，如果没有时，不会有任何变化。
     * @example
     * 点击某个按钮后，前进到下一个页面，类似点击浏览器上的前进按钮。通常，只有在调用了后退到上一页时，才可能前进到下一页，可参考浏览器的前进后退按钮。
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *      }
     *      this.showPage = function(){
     *          this.supers.showPage();
     *          //nextbtn为您页面上的某个按钮
     *          nextbtn.on("click",function(){
     *              protected.showNextPage();
     *          });
     *      }
     * };
     * </code>
     */
    var showNextPage = function(){
        var next = nextPage();
        if(next != undefined){
            var page = $jsmvc$.facade.reqPage(next.className);
            if(typeof page.showPage == "function"){
                if(next.arg.length > 0){
                    page.showPage.apply(page, next.arg);
                }else{
                    page.showPage();
                }
            }
        }
    }

    /**
     * @type function
     * @name getTemplate
     * @modification pro
     * @desc 获取 HTML 模版。getTemplate 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @param templateName:string 模版路径，目录用 . 符合隔开，并且不要有 .html 后缀
     * @returns string 模版字符串
     * @example
     * 获取 html 目录下的 helloWorld.html 模版字符串
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
     *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
     *          var tpl = protected.getTemplate("html.helloWorld");
     *          //在控制台打印模版内容
     *          console.log(tpl);
     *          //您可以创建 tpl 为节点元素或者 JQ 对象，例如：$(tpl) 来获得一个 JQ 对象
     *          //...
     *      }
     * };
     * </code>
     */
    var getTemplate = this.getTemplate;
    this.getTemplate = undefined;

    /**
     * @type function
     * @name attachNotice
     * @modification pro
     * @desc 订阅广播。attachNotice 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @param evtName:string 广播名称，可以是一个字符串或者常量
     * @param cb:function  回调方法，第一个参数为事件名，第二个参数为事件带回来的数据对象
     * @returns number 事件ID
     * @example
     * 关注 TEST 广播，并在控制台打印广播数据
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //定义一个用来处理广播消息的私有函数，该函数有2个参数：事件名和事件数据
     *      var test = function(evtName, evtData){
     *          console.log(evtData);
     *      }
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          protected.attachNotice("TEST", test);
     *      }
     * };
     * </code>
     * 在任意模块中通过 facade 调用 sendBroadcast 函数来发送该广播
     * <code>
     *     //发送一个名为 TEST 的广播并附带一个字符串作为数据
     *     $jsmvc$.facade.sendBroadcast("TEST","hello!~");
     * </code>
     */
    var attachNotice = this.attachNotice;
    this.attachNotice = undefined;

    /**
     * @type function
     * @name removeNotice
     * @modification pro
     * @desc 取消广播订阅。removeNotice 是一个保护函数，无法通过 this 或者外部访问，请参考例子中的方式访问
     * @param evtName:string 要移除的事件名
     * @param evtId:number 事件ID，添加事件时获得
     * @returns boolean 成功或者失败
     * @example
     * 初始化时关注 TEST 广播，收到广播之后删除它，确保只关注一次
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //定义一个变量来保存广播ID
     *      var evtId;
     *      //定义一个用来处理广播消息的私有函数，该函数有2个参数：事件名和事件数据
     *      var test = function(evtName, evtData){
     *          //在控制台打印广播数据
     *          console.log(evtData);
     *          //然后删除该广播
     *          protected.removeNotice("TEST", evtId);
     *      }
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *          //关注广播并保存广播ID
     *          evtId = protected.attachNotice("TEST", test);
     *      }
     * };
     * </code>
     */
    var removeNotice = this.removeNotice;
    this.removeNotice = undefined;

    /**
     * @type function
     * @name prevPageActive
     * @modification pro
     * @desc 判断页面是否可以后退
     * @returns boolean true是表示可以后退
     * @example
     * 在showPage中检测页面是否可以后退，以此来确定是否要显示后退按钮到top栏
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *      }
     *      this.showPage = function(){
     *          this.supers.showPage();
     *          if(protected.prevPageActive()){
     *              //显示后退按钮
     *          }else{
     *              //隐藏后退按钮
     *          }
     *      }
     * };
     * </code>
     */
    var prevPageActive = this.prevPageActive;
    this.prevPageActive = undefined;

    /**
     * @type function
     * @name nextPageActive
     * @modification pro
     * @desc 判断页面是否可以前进
     * @returns boolean true是表示可以前进
     * @example
     * 在showPage中检测页面是否可以前进，以此来确定是否要显示前进按钮到top栏
     * <code>
     * js.page.HelloWorld = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //保存父类保护函数集合到一个私有变量中
     *          protected = parent;
     *      }
     *      this.showPage = function(){
     *          this.supers.showPage();
     *          if(protected.nextPageActive()){
     *              //显示前进按钮
     *          }else{
     *              //隐藏前进按钮
     *          }
     *      }
     * };
     * </code>
     */
    var nextPageActive = this.nextPageActive;
    this.nextPageActive = undefined;

    //--------------------------------------------------------------------------------------------------
    //                  公共方法
    //--------------------------------------------------------------------------------------------------

    /**
     * @type function
     * @name showPage
     * @desc 把显示对象添加到舞台上（舞台原有的所有元素会被移除），调用该函数前确保已经添加了舞台和显示对象
     * @param arguments:array 您重写showPage时，如果有参数，那么在调用supers.showPage时需要把参数往上传递
     * @returns boolean 成功或者失败
     * @example
     * 创建一个名称为 HelloWorld 的 page 类
     * <code>
     * js.page.HelloWorld = function () {
     *      //模版被创建时的事件
     *      this.onCreate = function(parent){
     *          //设置 body 为该模块的舞台，即模显示的内容放置在 body 中
     *          parent.setStage(document.body);
     *          //设置 HTML 模版，需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
     *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
     *          parent.setDisplay("html.helloWorld");
     *      }
     * };
     * </code>
     * 在框架启动时注册 HelloWorld 模块，并调用 showPage 函数来显示
     * <code>
     * $jsmvc$.run.addFacade(function(){
     *      this.startup = function(){
     *          //注册 HelloWorld 模块并调用 showPage 方法显示
     *          $jsmvc$.facade.reqPage("js.page.HelloWorld").showPage();
     *      }
     * });
     * </code>
     * 或者在其它任意模块中，通过 $jsmvc$.facade.reqPage 来获取到该模块，并调用 showPage
     * <code>
     *     //取得 page 模块
     *     var p = $jsmvc$.facade.reqPage("js.page.HelloWorld");
     *     //调用模块的公共方法
     *     p.showPage();
     * </code>
     */
    this.showPage = function(){
        if(!stage || !display || isActive(true)){
            return false;
        }
        if(isJQuery(stage)) {
            stage.children().detach();
            stage.append(display);
        }else{
            while(stage.hasChildNodes())
            {
                stage.removeChild(stage.firstChild);
            }
            if(isJQuery(display)){
                for(var i=0;i<display.length;i++){
                    stage.appendChild(display.get(i))
                }
            }else{
                stage.appendChild(display);
            }
        }
        showHistory.apply(self, arguments);
        return true;
    };

    /**
     * @type function
     * @name isActive
     * @desc 检查当前页面处于显示状态
     * @param matchStage:boolean 是否匹配当前的舞台，当true时，显示对象必须是添加至当前的舞台上，默认false
     * @returns boolean 活跃/不活跃
     * @example
     * 在模块初始化时添加一个显示对象，并通过 isActive 来判断是否已经被添加到舞台
     * <code>
     * js.page.HelloWorld = function () {
     *      //模版被创建时的事件
     *      this.onCreate = function(parent){
     *          //设置 body 为该模块的舞台，即模显示的内容放置在 body 中
     *          parent.setStage(document.body);
     *          //设置 HTML 模版，需要确保 html 目录下有 helloWorld.html 模版文件（名字区分大小写）
     *          //模版路径用 . 符号隔开，并且不要有 .html 的后缀
     *          parent.setDisplay("html.helloWorld");
     *          //控制台必定打印 false ，因为还未调用 showPage 方法
     *          console.log(this.isActive());
     *      }
     * };
     * </code>
     * <code>
     * $jsmvc$.run.addFacade(function(){
     *      this.startup = function(){
     *          //注册 page 模块
     *          var p = $jsmvc$.facade.reqPage("js.page.HelloWorld");
     *          //调用模块显示
     *          p.showPage();
     *          //控制台必定打印 true，因为已经调用了 showPage 方法
     *          console.log(p.isActive());
     *      }
     * });
     * </code>
     */
    this.isActive = isActive;

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
     * 创建一个名称为 ExampleA 的 page 类，并把私有函数通过 onCreate 传递给子类
     * <code>
     * js.page.ExampleA = function () {
     *      //定义一个可以被子类所访问的私有函数
     *      var test = function(){
     *          return "my is ExampleA";
     *      }
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //模块的初始化操作，例如舞台设置、HTML 模版设置等
     *          //...
     *          //提供给子类访问的私有函数集合
     *          return {test:test}
     *      }
     * };
     * </code>
     * 创建一个名称为 ExampleB 的 page 类并继承 ExampleA
     * <code>
     * js.page.ExampleB = function () {
     *      //父类保护函数集合，调用父类保护函数时需要通过该引用来访问
     *      var protected;
     *      //模块被创建时的事件
     *      this.onCreate = function(parent){
     *          //继承父类的私有函数
     *          protected = parent;
     *          //模块的初始化操作，例如舞台设置、HTML 模版设置等
     *          //...
     *          //调用父类的私有函数并打印返回值到控制台
     *          console.log(protected.test());
     *      }
     * }.extends("js.page.ExampleA");//继承 ExampleA
     * </code>
     */
    this.onCreate = function(parent){
        return {
            setStage:setStage,
            getStage:getStage,
            delStage:delStage,
            setDisplay:setDisplay,
            getDisplay:getDisplay,
            delDisplay:delDisplay,
            showHistory:showHistory,
            showPrevPage:showPrevPage,
            showNextPage:showNextPage,
            getTemplate:getTemplate,
            attachNotice:attachNotice,
            removeNotice:removeNotice,
            prevPageActive:prevPageActive,
            nextPageActive:nextPageActive
        };
    };

    /**
     * @type event
     * @name onDestroy
     * @desc 模块销毁。通过 $jsmvc$.facade.delPage 删除模块时触发，可显式调用
     * @example
     * 创建一个名称为 HelloWorld 的 page 类
     * <code>
     * js.page.HelloWorld = function () {
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
     * 在框架启动时注册 HelloWorld 模块
     * <code>
     * $jsmvc$.run.addFacade(function(){
     *      this.startup = function(){
     *          //注册 HelloWorld 模块
     *          $jsmvc$.facade.reqPage("js.page.HelloWorld");
     *      }
     * });
     * </code>
     * 在其它任意模块中，通过调用 $jsmvc$.facade.delPage 来删除该模块
     * <code>
     *     //删除 page 模块
     *     $jsmvc$.facade.delPage("js.page.HelloWorld");
     * </code>
     * 或者直接调用 onDestroy 来删除
     * <code>
     *     //删除 page 模块
     *     var p = $jsmvc$.facade.reqPage("js.page.HelloWorld");
     *     p.onDestroy();
     * </code>
     */
    this.onDestroy = function(){
        self.onDestroy = undefined;
        $jsmvc$.facade.delPage(className);
        delDisplay();
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
