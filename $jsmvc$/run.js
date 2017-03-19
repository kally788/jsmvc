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
 * @type object
 * @desc $jsmvc$/run.js 是一个负责加载资源和启动框架的全局对象。您可以通过 $jsmvc$.run 来访问 run 所提供的方法。
 * @example
 * 1：在 index.html 文件的 head 标签中导入 run 脚本文件。
 * <code>
 * &lt;script type="text/javascript" src="$jsmvc$/run.js" charset="utf-8"&gt;&lt;/script&gt;
 * </code>
 * 2：在 index.html 文件的  <head> 标签中创建一个新的  <script> 标签，并定义要加载的 CSS,HTML,JS 数组。
 * <code>
 * //您项目的CSS文件列表
 * var css = [
 *     "css/css.css"
 * ];
 *
 * //您项目的JS文件列表，注意JS数组是个二维数组，用于区分同步/异步加载
 * //加载顺序参考：[[a,b,c],[d,e,f]]。并行加载a、b、c完成后再并行加载 d、e、f，依此类推
 * var js = [[
 *       //加载框架超类
 *      "$jsmvc$/core/FacadeAbs.js",
 *      "$jsmvc$/core/PageAbs.js",
 *      "$jsmvc$/core/ModelAbs.js",
 *      "$jsmvc$/core/ControAbs.js",
 *       //加载您项目js模块文件
 *      "js/contro/ChangeView.js",
 *      "js/model/vo/GreetVO.js",
 *      "js/model/Hi.js",
 *      "js/page/HelloWorld.js",
 *      "js/Facade.js"
 * ]];
 *
 * //您项目的HTML模版文件列表
 * var html = [
 *     "html/helloWorld.html"
 * ];
 *
 * //需要预加载的扩展包，扩展不是必须的，参考 jsmvc 扩展相关文档说明
 * var ext = [
 *     "ext/example/package.js"
 * ];
 * </code>
 * 3：在 index.html 的 body 标签 onload 事件中执行 $jsmvc$.run.start 方法。
 * <code>
 * &lt;body onload="$jsmvc$.run.start(css, js, html, ext, new Date().getTime());"&gt;&lt;/body&gt;
 * </code>
 */
if(window["$jsmvc$"]){
    var err = "'$jsmvc$' namespace conflict or <jsmvc> already load!";
    alert(err);
    throw err;
}
window["$jsmvc$"] = {
    run:new function () {

        //加载资源的版本号，可在调用start时重新指定
        var ver = "0_0_0";
        //HEAD标签，用于加载CSS和JS文件的
        var oHead;
        //加载超时定时器
        var timeoutLoad;
        //用于保存body中的内容，加载完成后会把body内容进行还原
        var oldBody = null;
        //指向当前run实例
        var self = this;
        //是否已经初始化过了，run只允许启动一次
        var init = false;
        //加载进度默认显示的动画效果
        var ing = ["&nbsp;&nbsp;&nbsp;",".&nbsp;&nbsp;","..&nbsp;","..."], ingIndex = 0, timeIng;
        //加载进度和当前加载的资源URL
        var totalLen = 0, progressLen = 0, currUrl = {};
        //已经加载的记录
        var loadRecord = {ext:{},css:{},js:{},html:{url:{},name:{}}};
        //由用户创建的facade实例，通过addFacade方法添加到框架上，实例自动继承超类 $jsmvc$.core.FacadeAbs
        var facade = null;

        //错误消息提示
        var errMsg = {
            "err1":"Repeat add facade class!",
            "err2":"Your not add facade class!",
            "err3":"run.start function Can only call once!",
            "err4":"run.start(parameter error)!",
            "err5":"Can't find HEAD!",
            "err6":"Browser version is too low!",
            "err7":"run.includeExt format definition error # ",
            "err8":"Frame core load not complete!"
        }

        //判断IE版本，大于9的版本均设置为9
        var isIE = false, ieVer = 9;
        if(navigator.appName=="Microsoft Internet Explorer")
        {
            var iev = navigator.appVersion.split(";")[1].replace(/[ ]/g,"");
            switch (iev){
                case "MSIE4.0":
                case "MSIE5.0":
                case "MSIE5.5":
                    ieVer = 5;
                    break;
                case "MSIE6.0":
                    ieVer = 6;
                    break;
                case "MSIE7.0":
                    ieVer = 7;
                    break;
                case "MSIE8.0":
                    ieVer = 8;
                    break;
            }
            isIE = true;
        }

        //判断是否为本地访问
        var locParts = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/.exec( location.href.toLowerCase() ) || [];
        var isLocal = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test( locParts[ 1 ] );

        //必要的原型扩展
        Function.prototype["extends"] = function(classRoute){
            this.parentClass = classRoute;
            return this;
        };

        //创建加载时默认的视图
        var createDisplay = function(){
            if(oldBody === null){
                oldBody = document.body.innerHTML;
            }
            var num = Math.round(progressLen/totalLen*10);
            var ok = "";
            var no = "";
            for(var i=0;i<num;i++){
                ok += "■";
            }
            for(var i=0;i<10-num;i++){
                no += "■";
            }
            var gif = "<div style='font:26px \"Arial\'><span style='color: #1c1c1c;'>"+ok+"</span><span style='color: #7f8171;'>"+no+"</span></div>";
            var txt = "<div style='font:18px/25px \"Arial\";color: #7b755a;' id='msg'><span>loading</span><span id='ing'>"+ing[ingIndex]+"</span>"+(num*10)+"%</div>";
            var body = "<div style='height:50px; width:160px;top:50%;left:50%;position:absolute;margin:-25px 0 0 -80px;'>"+gif+txt+"</div>";
            document.body.innerHTML = "<div style='background-color: #fcfbed; position:absolute;width: 100%;height: 100%;text-align: center;'>"+body+"</div>";
            if(!timeIng){
                timeIng = setInterval(function() {
                    if(ingIndex > 3){
                        ingIndex = 0;
                    }
                    var ingSpan = document.getElementById("ing");
                    if(ingSpan){
                        ingSpan.innerHTML = ing[ingIndex];
                    }else{
                        clearTimeout(timeIng);
                        timeIng = null;
                    }
                    ingIndex ++;
                }, 100);
            }
        }

        //加载资源进度
        var loading = function(total, progress){
            if(self.onLoading && typeof self.onLoading == "function"){
                self.onLoading(total, progress);
            }else{
                createDisplay();
            }
        }

        //加载资源失败
        var loadFail = function(url){
            if(self.onLoadFail && typeof self.onLoadFail == "function"){
                self.onLoadFail(url);
            }else{
                createDisplay();
                document.getElementById("msg").innerHTML = "load error # <br> url:[" + url + "]";
            }
        }

        //加载资源超时
        var loadTimeout = function(urlList){
            if(self.onLoadTimeout && typeof self.onLoadTimeout == "function"){
                self.onLoadTimeout(urlList);
            }else{
                var errUrl = "";
                for(var i in urlList){
                    if(errUrl == ""){
                        errUrl += i;
                    }else{
                        errUrl += " \n "+i;
                    }
                }
                createDisplay();
                document.getElementById("msg").innerHTML = "load timeout # <br> url:[" + errUrl + "]";
            }
        }

        //浏览器不兼容
        var compatibility = function(){
            if(self.onCompatibility && typeof self.onCompatibility == "function"){
                self.onCompatibility();
            }else{
                createDisplay();
                document.getElementById("msg").innerHTML = "Must be IE"+((typeof self.setIEVerLimit != "number" || self.setIEVerLimit < 6) ? 6 : self.setIEVerLimit)+".0 Above Browser!";
            }
        }

        //获取 XMLHttpRequest 对象
        var getRequest = function(){
            var request;
            if(isLocal || window.XMLHttpRequest === undefined){
                request = window.ActiveXObject !== undefined ? new window.ActiveXObject("Microsoft.XMLHTTP"):undefined;
            }else{
                request = window.XMLHttpRequest !== undefined ? new window.XMLHttpRequest():undefined;
            }
            if(!request){
                alert(errMsg.err6);
                throw errMsg.err6;
            }
            return request;
        }

        //根据JS文件路由创建命名空间，返回{{package: *, className: *}}
        var createNamespace = function(url){
            //定义命名空间
            var namespace = url.split(".js")[0].split("/");
            var namespaceLs = [];
            for(var i = 0; i < namespace.length-1; i++){
                if(namespace[i] != "" && typeof namespace[i] == "string"){
                    namespaceLs.push(namespace[i]);
                }
            }
            if(namespaceLs.length > 0){
                var route = window[namespaceLs[0]];
                if(!route){
                    window[namespaceLs[0]] = {};
                    route = window[namespaceLs[0]];
                }
                for(var i = 1; i < namespaceLs.length; i++){
                    if(!route[namespaceLs[i]]){
                        route[namespaceLs[i]] = {};
                    }
                    route = route[namespaceLs[i]];
                }
                return {package:route, className:namespace[namespace.length-1]};
            }
        }

        //加载JS
        var includeJS = function(url, cb){
            if(loadRecord.js[url]){
                if(cb && typeof cb == "function") cb(true, createNamespace(url));
                return;
            }
            var route = createNamespace(url);
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.charset = "utf-8";
            if(isIE && ieVer < 9){
                //处理 script 标签 onload|onerror 事件兼容性问题（IE6-8无onerror事件，所以采用ActiveXObject的方式来加载）
                var request = getRequest();
                request.open("GET",(url.indexOf("?") == -1) ? (url + "?ver=" + ver) : url) ;
                request.onreadystatechange = function() {
                    if(request.readyState == 4) {
                        if(request.status == 200 || request.status == 0){
                            oScript.text = request.responseText;
                            oHead.appendChild(oScript);
                            loadRecord.js[url] = true;
                            if(cb && typeof cb == "function") cb(true, route);
                            oHead.removeChild(oScript);
                        }else{
                            if(cb && typeof cb == "function") cb(false, route);
                        }
                    }
                };
                request.send();
            }else{
                oScript.src = (url.indexOf("?") == -1) ? (url + "?ver=" + ver) : url;
                oHead.appendChild(oScript);
                var funcEvent = function(status){
                    oScript.onload = oScript.onerror = null;
                    if(status) loadRecord.js[url] = true;
                    if(cb && typeof cb == "function") cb(status, route);
                    oHead.removeChild(oScript);
                }
                oScript.onerror = function(){
                    funcEvent(false);
                }
                oScript.onload = function(){
                    funcEvent(true);
                };
            }
        }

        //加载CSS
        var includeCSS = function(url, cb){
            if(loadRecord.css[url]){
                if(cb && typeof cb == "function") cb(true);
                return;
            }
            var oCss  = document.createElement("link");
            oCss.rel  = "stylesheet";
            oCss.href = (url.indexOf("?") == -1) ? (url + "?ver=" + ver) : url;
            oCss.charset = "utf-8";
            oCss.type =  "text/css";
            var timer, sheet, cssRules;
            if ( "sheet" in oCss ) { //FF/CM/OP
                sheet = "sheet";
                cssRules = "cssRules";
            }else { //IE
                sheet = "styleSheet";
                cssRules = "rules";
            }
            var funcEvent = function(status){
                clearInterval( timer );
                oCss.onerror = oCss.onload = null;
                if(status) loadRecord.css[url] = true;
                if(cb && typeof cb == "function") cb(status);
            }
            var funcState = function() {
                if (oCss[sheet]){
                    try {
                        oCss[sheet][cssRules].length;//在某些浏览器下，跨域加载CSS时访问cssRules将产生错误
                    } catch( e ) {
                        funcEvent(true);
                        return;
                    }
                    if(oCss[sheet][cssRules].length){
                        funcEvent(true);
                    }else{
                        funcEvent(false);
                    }
                }
            }
            oCss.onerror = function(){
                funcEvent(false);
            }
            oCss.onload = function(){
                funcState();
            }
            //处理 link 标签 onload|onerror 事件兼容性问题（Safari不兼容onload|onerror，IE不兼容onerror）
            timer = setInterval(funcState , 50 );
            oHead.appendChild(oCss);
        }

        //加载HTML
        var includeHTML = function(url, cb){
            if(loadRecord.html.url[url]){
                if(cb && typeof cb == "function") cb(true);
                return;
            }
            var request = getRequest();
            request.open("GET",(url.indexOf("?") == -1) ? (url + "?ver=" + ver) : url) ;
            request.onreadystatechange = function() {
                if(request.readyState == 4) {
                    if(request.status == 200 || request.status == 0){
                        //创建模版名称（把文件路径转换为链式字符串）
                        var templatePath = url.split(".html")[0].split("/");
                        var templateName = "";
                        for(var i = 0;i < templatePath.length; i++){
                            templateName += (templateName==""?"":".")+templatePath[i];
                        }
                        //分析模版文件
                        var node = document.createElement("jsmvc");
                        node.setAttribute("id", templateName);
                        node.innerHTML = request.responseText;
                        var childList = node.getElementsByTagName("jsmvc");
                        if(childList.length){
                            for(var j = 0; j < childList.length; j++){
                                var child = childList[j];
                                loadRecord.html.url[url] = loadRecord.html.name[child.getAttribute("id")] = child.innerHTML;
                            }
                        }else{
                            loadRecord.html.url[url] = loadRecord.html.name[templateName] = request.responseText;
                        }
                        if(cb && typeof cb == "function") cb(true);
                    }else{
                        if(cb && typeof cb == "function") cb(false);
                    }
                }
            };
            request.send();
        }

        //加载扩展
        var includeExt = function(ext, cb){
            //扩展已经存在了
            if(loadRecord.ext[ext]){
                if(typeof cb == "function"){
                    cb(0);
                }
                return;
            }
            //开始加载扩展
            var total = 0,progress = 0,currExtUrl = {};
            if(typeof cb == "function"){
                cb(1, {total:total, progress:progress});
            }
            //设置超时
            var timeout = setTimeout(function(){
                if(typeof cb == "function"){
                    cb(3, currExtUrl);
                }
            }, typeof self.setLoadTimeout == "number"?self.setLoadTimeout:60000);
            includeJS(ext, (function(url){
                return function(status, route){
                    var fail = false;
                    //加载扩展失败
                    function failLoad(url){
                        fail = true;
                        clearTimeout(timeout);
                        if(typeof cb == "function"){
                            cb(2, url);
                        }
                    }
                    //加载错误
                    function errLoad(){
                        clearTimeout(timeout);
                        if(typeof cb == "function"){
                            cb(4, errMsg.err7 + ext);
                        }
                    }

                    //package.js 加载失败
                    if(!status){
                        failLoad(url);
                        return;
                    }

                    //package.js 包错误
                    var package = route ? route.package[route.className] : undefined;
                    if(!package){
                        errLoad();
                        return;
                    }
                    var css = package.css;
                    var js = package.js;
                    var html = package.html;

                    //package.js 扩展包格式定义错误
                    if((css && typeof css != "object") || (js && typeof js != "object") || (html && typeof html != "object")){
                        errLoad();
                        return;
                    }

                    //获取要加载的资源长度
                    total = (css?css.length:0)+(js?js.length:0)+(html?html.length:0);
                    //加载扩展完成
                    function completeLoad(){
                        clearTimeout(timeout);
                        loadRecord.ext[ext] = ext;
                        if(typeof cb == "function"){
                            cb(0);
                        }
                    }
                    //加载HTML
                    function loadHtml(){
                        var htmlNum = 0;
                        if(!html || html.length == 0){
                            completeLoad();
                        }
                        for(var i=0; html && i<html.length; i++){
                            currExtUrl[html[i]] = html[i];
                            includeHTML(html[i], (function(url){
                                return function(status){
                                    if(!status || fail){
                                        if(!status){
                                            failLoad(url);
                                        }
                                        return
                                    }
                                    if(typeof cb == "function"){
                                        cb(1, {total:total, progress:++progress});
                                    }
                                    delete currExtUrl[url];
                                    htmlNum++;
                                    if(htmlNum == html.length){
                                        completeLoad();
                                    }
                                }
                            })(html[i]));
                        }
                    }

                    //加载JS
                    function loadJs(){
                        if(!js || js.length == 0){
                            loadHtml();
                        }
                        var jsNum = 0;
                        for(var i=0; js && i<js.length;i++){
                            currExtUrl[js[i]] = js[i];
                            includeJS(js[i], (function(url){
                                return function(status){
                                    if(!status || fail){
                                        if(!status){
                                            failLoad(url);
                                        }
                                        return;
                                    }
                                    if(typeof cb == "function"){
                                        cb(1, {total:total, progress:++progress});
                                    }
                                    delete currExtUrl[url];
                                    jsNum++;
                                    if(jsNum == js.length){
                                        loadHtml();
                                    }
                                }
                            })(js[i]));
                        }
                    }

                    //加载CSS
                    function loadCss(){
                        var cssNum = 0;
                        if(!css || css.length == 0){
                            loadJs();
                        }
                        for(var i=0; css && i<css.length; i++){
                            currExtUrl[css[i]] = css[i];
                            includeCSS(css[i], (function(url){
                                return function(status){
                                    if(!status || fail){
                                        if(!status){
                                            failLoad(url);
                                        }
                                        return;
                                    }
                                    if(typeof cb == "function"){
                                        cb(1, {total:total, progress:++progress});
                                    }
                                    delete currExtUrl[url];
                                    cssNum++;
                                    if(cssNum == css.length){
                                        loadJs();
                                    }
                                }
                            })(css[i]));
                        }
                    }
                    loadCss();
                }
            })(ext), true);
        }

        //开始加载
        var start = function(css, js, html, ext, vers){
            if(isIE && ieVer < ((typeof self.setIEVerLimit != "number" || self.setIEVerLimit < 6) ? 6 : self.setIEVerLimit)){
                compatibility();
                return;
            }
            if(init){
                alert(errMsg.err3);
                throw errMsg.err3;
            }
            init = true;
            if((css && typeof css != "object") || (js && typeof js != "object") || (html && typeof html != "object") || (ext && typeof ext != "object")){
                alert(errMsg.err4);
                throw errMsg.err4;
            }
            oHead = document.getElementsByTagName('HEAD');
            if(oHead){
                oHead = oHead.item(0);
            }else{
                alert(errMsg.err5);
                throw errMsg.err5;
            }
            var fail = false;
            //设置超时
            timeoutLoad = setTimeout(function(){
                loadTimeout(currUrl);
            }, typeof self.setLoadTimeout == "number"?self.setLoadTimeout:60000);
            //设置版本号
            ver = vers?vers:ver;
            //获取要加载的资源长度
            totalLen = (css?css.length:0)+(html?html.length:0)+(ext?ext.length:0);
            if(js){
                for(var i = 0; i<js.length; i++){
                    if(typeof js[i] != "object"){
                        alert(errMsg.err4);
                        throw errMsg.err4;
                    }
                    totalLen += js[i].length;
                }
            }

            //加载完成
            function completeLoad(){
                clearTimeout(timeoutLoad);
                clearTimeout(timeIng);
                if(oldBody !== null){
                    document.body.innerHTML = oldBody;
                    oldBody = null;
                }
                //检查框架是否已经全部加载
                if(!$jsmvc$.core.PageAbs || !$jsmvc$.core.ModelAbs || !$jsmvc$.core.FacadeAbs){
                    alert(errMsg.err8);
                    throw errMsg.err8;
                }
                //创建 facade 实例
                if(typeof facade == "function"){
                    window["$jsmvc$"].facade = facade.prototype = new $jsmvc$.core.FacadeAbs(loadRecord.html.name, self.setBackHistory);
                    facade = new facade();
                    facade.supers = {};
                    for(var i in window["$jsmvc$"].facade){
                        if(i != "supers" && i != "startup"){
                            facade.supers[i] = window["$jsmvc$"].facade[i];
                        }
                    }
                    window["$jsmvc$"].facade = facade;
                    if(typeof facade.startup == "function"){
                        facade.startup();
                        delete facade.startup;
                    }
                }else{
                    alert(errMsg.err2);
                    throw errMsg.err2;
                }
            }

            //加载失败
            function failLoad(url){
                fail = true;
                clearTimeout(timeoutLoad);
                clearTimeout(timeIng);
                loadFail(url);
            }

            //加载扩展
            function loadExt(){
                var extNum = 0;
                if(!ext || ext.length == 0){
                    completeLoad();
                }
                for(var i=0; ext && i<ext.length; i++){

                    currUrl[ext[i]] = ext[i];
                    includeExt(ext[i],(function(url){

                        return function(state, msg){

                            if(state == 2 || fail){
                                if(state == 2){
                                    failLoad(msg);
                                }
                                return;
                            }
                            if(state == 0){
                                loading(totalLen, ++progressLen);
                                delete currUrl[url];
                                extNum++;
                                if(extNum == ext.length){
                                    completeLoad();
                                }
                            }else if(state == 1){
                                //加载过程
                            }else if(state == 2){
                                //加载扩展失败
                            }else if(state == 3){
                                //加载扩展超时
                                clearTimeout(timeoutLoad);
                                loadTimeout(msg);
                            }else if(state == 4){
                                alert(msg);
                                throw msg;
                            }
                        }
                    })(ext[i]));
                }
            }

            //加载HTML
            function loadHtml(){
                var htmlNum = 0;
                if(!html || html.length == 0){
                    loadExt();
                }
                for(var i=0; html && i<html.length; i++){
                    currUrl[html[i]] = html[i];
                    includeHTML(html[i], (function(url){
                        return function(status){
                            if(!status || fail){
                                if(!status){
                                    failLoad(url);
                                }
                                return;
                            }
                            loading(totalLen, ++progressLen);
                            delete currUrl[url];
                            htmlNum++;
                            if(htmlNum == html.length){
                                loadExt();
                            }
                        }
                    })(html[i]));
                }
            }

            //加载JS
            function loadJs(){
                if(!js || js.length == 0){
                    loadHtml();
                }else{
                    var jsOffset = 0;
                    (function load(){
                        var jsNum = 0;
                        if(js[jsOffset].length==0){
                            jsOffset++;
                            if(jsOffset==js.length){
                                loadHtml();
                            }else{
                                load();
                            }
                            return;
                        }
                        var len = js[jsOffset].length;
                        for(var i=0;i<len;i++){
                            currUrl[js[i]] = js[i];
                            includeJS(js[jsOffset][i], (function(url){
                                return function(status){
                                    if(!status || fail){
                                        if(!status){
                                            failLoad(url);
                                        }
                                        return;
                                    }
                                    loading(totalLen, ++progressLen);
                                    delete currUrl[url];
                                    jsNum++;
                                    if(jsNum == js[jsOffset].length){
                                        if(jsOffset+1 == js.length){
                                            loadHtml();
                                        }else{
                                            jsOffset++;
                                            load();
                                        }
                                    }
                                }
                            })(js[jsOffset][i]));
                        }
                    })();
                }
            }

            //加载CSS列队
            function loadCss(){
                var cssNum = 0;
                if(!css || css.length == 0){
                    loadJs();
                }
                for(var i=0; css && i<css.length; i++){
                    currUrl[css[i]] = css[i];
                    includeCSS(css[i], (function(url){
                        return function(status) {
                            if(!status || fail){
                                if(!status){
                                    failLoad(url);
                                }
                                return;
                            }
                            loading(totalLen, ++progressLen);
                            delete currUrl[url];
                            cssNum++;
                            if (cssNum == css.length) {
                                loadJs();
                            }
                        }
                    })(css[i]));
                }
            }

            loadCss();
            loading(totalLen, progressLen);
        }

        //添加 Facade
        var addFacade = function(fo){
            if(facade){
                alert(errMsg.err1);
                throw errMsg.err1;
            }
            facade = fo;
        }

        //--------------------------------------------------------------------------------------------------
        //                  方法
        //--------------------------------------------------------------------------------------------------

        /**
         * @type function
         * @name start
         * @desc 加载资源文件并启动程序，该方法只允许被调用一次，放在 body 标签的 onLoad 事件中执行
         * @param css:array 要加载的CSS文件URL列表
         * @param js:array 要加载的JS文件URL列表（二维数组）
         * @param html:array 要加载的HTML文件URL列表
         * @param ext:array 要预加载的扩展模块列表
         * @param vers:string 资源版本号
         * @example 您需要定义好需要加载的各项数组，然后在 <body> 标签的 onload 事件中添加 start 方法
         * <code>
         * &lt;body onload="$jsmvc$.run.start(css, js, html, ext, new Date().getTime());"&gt;&lt;/body&gt;
         * </code>
         */
        this.start = start;

        /**
         * @type function
         * @name includeJS
         * @desc 异步加载JS。通常情况下，无需使用该方法。JS 应在调用 start 时进行加载
         * @param url:string JS地址。已经加载过了直接返回成功
         * @param cb:function 加载完毕回调方法，回调方法包含2个参数：
         * 1.加载状态 boolean
         * 2.JS命名空间 { package:包, className:类名 }
         * @example
         * <code>
         * $jsmvc$.run.includeJS("http://example.com/x.js", function(s, o){
         *      if(s){
         *          if(o){
         *              console.log(o.className);
         *              console.log(o.package[o.className]);
         *          }
         *      }else{
         *          console.log("error");
         *      }
         * });
         * </code>
         */
        this.includeJS = includeJS;

        /**
         * @type function
         * @name includeCSS
         * @desc 异步加载CSS。CSS文件不能是空内容。通常情况下，无需使用该方法。CSS 应在调用 start 时进行加载
         * @param url:string CSS地址
         * @param cb:function 加载完毕回调方法，回调方法包含1个 boolean 参数，表示是否加载成功
         * @example
         * <code>
         * $jsmvc$.run.includeCSS("http://example.com/x.css", function(s){
         *      if(s){
         *          console.log("ok");
         *      }else{
         *          console.log("error");
         *      }
         * });
         * </code>
         */
        this.includeCSS = includeCSS;

        /**
         * @type function
         * @name includeHTML
         * @desc 异步加载HTML。通常情况下，无需使用该方法。HTML 应在调用 start 时进行加载
         * @param url:string HTML地址
         * @param cb:function 加载完毕回调方法，回调方法包含1个 boolean 参数，表示是否加载成功
         * @example
         * <code>
         * $jsmvc$.run.includeHTML("http://example.com/x.html", function(s){
         *      if(s){
         *          console.log("ok");
         *      }else{
         *          console.log("error");
         *      }
         * });
         * </code>
         */
        this.includeHTML = includeHTML;

        /**
         * @type function
         * @name includeExt
         * @desc 异步加载扩展模块。对于在调用 start 已预加载的扩展，无需再调用该方法
         * @param ext:string 要加载的扩展包
         * @param cb:function 加载扩展回调
         * 回调函数的第一个参数为加载状态：0=成功 1=加载过程 2=加载失败 3=加载超时 4=出现错误
         * 回调函数的第二个参数为状态数据：根据不同的状态，值不同
         *     当第一个参数为 0 时，第二个参数为空
         *     当第一个参数为 1 时，第二个参数为 object，加载进度对象 { total:总进度，0为开始加载, progress:当前进度 }
         *     当第一个参数为 2 时，第二个参数为 string，加载失败的资源URL
         *     当第一个参数为 3 时，第二个参数为 object，超时仍为完成加载的url资源object集合，k/v 均为URL
         *     当第一个参数为 4 时，第二个参数为 string，错误消息
         * @example
         * <code>
         * $jsmvc$.run.includeExt("http://example.com/ext/package.js", function(s, o){
         *      switch (s){
         *          case 0:
         *              console.log("ok");
         *          break;
         *          case 1:
         *              if(o.total){
         *                  console.log("total:"+o.total, "progress:"+o.progress);
         *              }else{
         *                  console.log("Start load ing...");
         *              }
         *          break;
         *          case 2:
         *              console.log("Load fail # URL:"+o);
         *          break;
         *          case 3:
         *              console.log("Load timeout!", JSON.stringify(o));
         *          break;
         *          case 4:
         *              console.log("Load error # msg:",+o);
         *          break;
         *      }
         * });
         * </code>
         */
        this.includeExt = includeExt;

        /**
         * @type function
         * @name addFacade
         * @desc 添加 Facade 类来启动程序进行初始化操作，该方法只允许被调用一次。参考 $jsmvc$.core.FacadeAbs 文档
         * @param facade:function 一个继承 $jsmvc$.core.FacadeAbs 的自定义类
         * @example
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
        this.addFacade = addFacade;

        //--------------------------------------------------------------------------------------------------
        //                  事件
        //--------------------------------------------------------------------------------------------------

        /**
         * @type event
         * @name onLoading
         * @desc 当框架开始加载资源时触发该事件
         * @param total:number 总要加载的资源数量
         * @param progress:number 当前加载的资源数量
         * @example
         * <code>
         * $jsmvc$.run.onLoading = function(total, progress){
         *      //您可以根据实际需求来处理加载进度界面
         *      console.log("total:"+total, "progress:"+progress);
         * }
         * </code>
         */
        this.onLoading = null;

        /**
         * @type event
         * @name onLoadFail
         * @desc 当框架加载某个资源失败时触发该事件，产生该事件后程序终止
         * @param url:string 加载失败的资源URL地址
         * @example
         * <code>
         * $jsmvc$.run.onLoadFail = function(url){
         *      //您可以根据实际需求来处理加载错误界面
         *      console.log(url);
         * }
         * </code>
         */
        this.onLoadFail = null;

        /**
         * @type event
         * @name onLoadTimeout
         * @desc 当框架加载资源超时触发该事件，该事件只会产生一次。超时时间可以通过 setLoadTimeout 设置
         * @param urlObject:object 加载超时后仍未完成加载的URL集合
         * @example
         * <code>
         * $jsmvc$.run.onLoadTimeout = function(urlObject){
         *      //您可以根据实际需求来处理超时加载提示
         *      console.log(JSON.stringify(urlObject));
         * }
         * </code>
         */
        this.onLoadTimeout = null;

        /**
         * @type event
         * @name onCompatibility
         * @desc 当框架不兼容指定IE版本时触发该事件，产生该事件后程序终止。IE版本限制可通过 setIEVerLimit 设置
         * @example
         * <code>
         * $jsmvc$.run.onCompatibility = function(){
         *      //您可以根据实际需求来处理浏览器不兼容提示
         *      console.log("compatibility");
         * }
         * </code>
         */
        this.onCompatibility = null;

        //--------------------------------------------------------------------------------------------------
        //                  属性
        //--------------------------------------------------------------------------------------------------

        /**
         * @type attr
         * @name setLoadTimeout
         * @desc 加载资源超时的时间设置（毫秒），默认为 60000
         * @value number
         */
        this.setLoadTimeout = null;

        /**
         * @type attr
         * @name setIEVerLimit
         * @desc 限制低的IE版本。最低为6，设置低于6时默认为6，默认8
         * @value number
         */
        this.setIEVerLimit  = null;

        /**
         * @type attr
         * @name setBackHistory
         * @desc 如果设置为true，可以通过浏览器前进后退按钮来切换页面，默认为true
         * @value boolean
         */
        this.setBackHistory = true;
    }
}