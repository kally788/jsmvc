/**
 * Created by zhujili on 2015/11/9.
 * 公共插件集合
 * 在IE8以下的版本，需要手动加入json2.js库
 */

$library$.Utils = function(){
    var Sync = function() {

        /**
         * 瀑布流方式同步执行
         * @param funList 要执行的方法数组，方法的最后一个参数必定为下一个回调方法，任何时候，在调用回调方法时，第一个参数传递非0，将中止流程
         * @param result 最终完成瀑布流执行的回调方法
         *
         * 例：
         sync.waterfall([
         function(cb){
                //第一个执行的方法
                cb(null,1,2,3);
           },
         function(n1,n2,n3, cb){
                //第二个执行的方法，并累加上个方法传递进来的参数
                cb(null,n1+n2+n3);
           }
         ],function(err, data){
            //获得结果
            alert(data)
       });
         */
        this.waterfall = function(funList, result){
            var func = function(){
                //找出要执行方法位置索引，并构建递归到下一个函数中的参数
                var index = arguments[0];
                var arg1 = [];
                for(var i in arguments){
                    arg1.push(arguments[i]);
                }
                arg1.splice(0,1);
                arg1.push(function(){
                    //找出当前方法传递进来的参数，并构建递归到下一个函数中的参数
                    var err = arguments[0];
                    var arg2 = [];
                    for(var i in arguments){
                        arg2.push(arguments[i]);
                    }
                    //如果发生错误或者已经执行到最后，就终止执行并把最后的数据传递给 result。否则执行下一个函数
                    if((err && err != 0) || index+1 == funList.length){
                        result.apply(null,arg2);
                    }else{
                        arg2[0] = index+1;
                        func.apply(null,arg2);
                    }
                });
                funList[index].apply(null,arg1);
            }
            func(0);
        }
    }
    var Url = function () {
        var vars = null;//参数列表
        /**
         * 获取URL参数列表
         * @return object
         */
        this.getVars = function () {
            if (vars) {
                return vars;
            }
            vars = {};
            var hash,
                hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'),
                len = hashes.length;
            for (var i = 0; i < len; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }
            return vars;
        }

        /**
         * 获取URL指定参数
         * @param name string 参数名称
         * @return string
         */
        this.getVar = function (name) {
            if (vars) {
                return vars[name];
            }
            return this.getVars()[name];
        }
    }
    var Storage = function () {
        var storage = {};//缓存对象
        /**
         * 获取本地缓存
         *
         * @author zhujili
         * @date 2014年5月12日
         * @version v1.0
         *
         * @param key string 缓存名称
         *
         * @return object
         */
        this.get = function (key) {
            var data = storage[key];
            if (!data) {
                var json = localStorage.getItem(key);
                if (json) {
                    data = storage[key] = JSON.parse(json);
                }
            }
            if (data) {
                if (data.expires > 0 && (Date.parse(new Date()) / 1000) - data.timestamp >= data.expires) {
                    this.del(key);
                } else {
                    return data.value;
                }
            }
            return null;
        }
        /**
         * 设置本地缓存（不安全，勿保存敏感数据）
         *
         * @author zhujili
         * @date 2014年5月12日
         * @version v1.0
         *
         * @param key string 缓存名称
         * @param value object 要设置的值
         * @param expires number 过期时间/秒，为0时永不过期，默认为600
         *
         * @return void
         */
        this.set = function (key, value, expires) {
            if (typeof expires != "number") {
                expires = 600;
            }
            var data = {
                expires: expires,
                timestamp: Date.parse(new Date()) / 1000,
                value: value
            }
            storage[key] = data;
            localStorage.setItem(key, JSON.stringify(data));
        }
        /**
         * 删除本地缓存
         *
         * @author zhujili
         * @date 2014年5月12日
         * @version v1.0
         *
         * @param key string 缓存名称
         *
         * @return void
         */
        this.del = function (key) {
            delete storage[key];
            localStorage.removeItem(key);
        }
    }
    var Md5 = function(){
        var rotateLeft = function(lValue, iShiftBits) {
            return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
        };
        var addUnsigned = function(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = lX & 2147483648;
            lY8 = lY & 2147483648;
            lX4 = lX & 1073741824;
            lY4 = lY & 1073741824;
            lResult = (lX & 1073741823) + (lY & 1073741823);
            if (lX4 & lY4) return lResult ^ 2147483648 ^ lX8 ^ lY8;
            if (lX4 | lY4) {
                if (lResult & 1073741824) return lResult ^ 3221225472 ^ lX8 ^ lY8; else return lResult ^ 1073741824 ^ lX8 ^ lY8;
            } else {
                return lResult ^ lX8 ^ lY8;
            }
        };
        var F = function(x, y, z) {
            return x & y | ~x & z;
        };
        var G = function(x, y, z) {
            return x & z | y & ~z;
        };
        var H = function(x, y, z) {
            return x ^ y ^ z;
        };
        var I = function(x, y, z) {
            return y ^ (x | ~z);
        };
        var FF = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        var GG = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        var HH = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        var II = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        var convertToWordArray = function(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWordsTempOne = lMessageLength + 8;
            var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - lNumberOfWordsTempOne % 64) / 64;
            var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - lByteCount % 4) / 4;
                lBytePosition = lByteCount % 4 * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | string.charCodeAt(lByteCount) << lBytePosition;
                lByteCount++;
            }
            lWordCount = (lByteCount - lByteCount % 4) / 4;
            lBytePosition = lByteCount % 4 * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | 128 << lBytePosition;
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        };
        var wordToHex = function(lValue) {
            var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = lValue >>> lCount * 8 & 255;
                WordToHexValueTemp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
            }
            return WordToHexValue;
        };
        var uTF8Encode = function(string) {
            string = string.replace(/\x0d\x0a/g, "\n");
            var output = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    output += String.fromCharCode(c);
                } else if (c > 127 && c < 2048) {
                    output += String.fromCharCode(c >> 6 | 192);
                    output += String.fromCharCode(c & 63 | 128);
                } else {
                    output += String.fromCharCode(c >> 12 | 224);
                    output += String.fromCharCode(c >> 6 & 63 | 128);
                    output += String.fromCharCode(c & 63 | 128);
                }
            }
            return output;
        };
        this.encrypt = function(string) {
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
            var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            string = uTF8Encode(string);
            x = convertToWordArray(string);
            a = 1732584193;
            b = 4023233417;
            c = 2562383102;
            d = 271733878;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 3614090360);
                d = FF(d, a, b, c, x[k + 1], S12, 3905402710);
                c = FF(c, d, a, b, x[k + 2], S13, 606105819);
                b = FF(b, c, d, a, x[k + 3], S14, 3250441966);
                a = FF(a, b, c, d, x[k + 4], S11, 4118548399);
                d = FF(d, a, b, c, x[k + 5], S12, 1200080426);
                c = FF(c, d, a, b, x[k + 6], S13, 2821735955);
                b = FF(b, c, d, a, x[k + 7], S14, 4249261313);
                a = FF(a, b, c, d, x[k + 8], S11, 1770035416);
                d = FF(d, a, b, c, x[k + 9], S12, 2336552879);
                c = FF(c, d, a, b, x[k + 10], S13, 4294925233);
                b = FF(b, c, d, a, x[k + 11], S14, 2304563134);
                a = FF(a, b, c, d, x[k + 12], S11, 1804603682);
                d = FF(d, a, b, c, x[k + 13], S12, 4254626195);
                c = FF(c, d, a, b, x[k + 14], S13, 2792965006);
                b = FF(b, c, d, a, x[k + 15], S14, 1236535329);
                a = GG(a, b, c, d, x[k + 1], S21, 4129170786);
                d = GG(d, a, b, c, x[k + 6], S22, 3225465664);
                c = GG(c, d, a, b, x[k + 11], S23, 643717713);
                b = GG(b, c, d, a, x[k + 0], S24, 3921069994);
                a = GG(a, b, c, d, x[k + 5], S21, 3593408605);
                d = GG(d, a, b, c, x[k + 10], S22, 38016083);
                c = GG(c, d, a, b, x[k + 15], S23, 3634488961);
                b = GG(b, c, d, a, x[k + 4], S24, 3889429448);
                a = GG(a, b, c, d, x[k + 9], S21, 568446438);
                d = GG(d, a, b, c, x[k + 14], S22, 3275163606);
                c = GG(c, d, a, b, x[k + 3], S23, 4107603335);
                b = GG(b, c, d, a, x[k + 8], S24, 1163531501);
                a = GG(a, b, c, d, x[k + 13], S21, 2850285829);
                d = GG(d, a, b, c, x[k + 2], S22, 4243563512);
                c = GG(c, d, a, b, x[k + 7], S23, 1735328473);
                b = GG(b, c, d, a, x[k + 12], S24, 2368359562);
                a = HH(a, b, c, d, x[k + 5], S31, 4294588738);
                d = HH(d, a, b, c, x[k + 8], S32, 2272392833);
                c = HH(c, d, a, b, x[k + 11], S33, 1839030562);
                b = HH(b, c, d, a, x[k + 14], S34, 4259657740);
                a = HH(a, b, c, d, x[k + 1], S31, 2763975236);
                d = HH(d, a, b, c, x[k + 4], S32, 1272893353);
                c = HH(c, d, a, b, x[k + 7], S33, 4139469664);
                b = HH(b, c, d, a, x[k + 10], S34, 3200236656);
                a = HH(a, b, c, d, x[k + 13], S31, 681279174);
                d = HH(d, a, b, c, x[k + 0], S32, 3936430074);
                c = HH(c, d, a, b, x[k + 3], S33, 3572445317);
                b = HH(b, c, d, a, x[k + 6], S34, 76029189);
                a = HH(a, b, c, d, x[k + 9], S31, 3654602809);
                d = HH(d, a, b, c, x[k + 12], S32, 3873151461);
                c = HH(c, d, a, b, x[k + 15], S33, 530742520);
                b = HH(b, c, d, a, x[k + 2], S34, 3299628645);
                a = II(a, b, c, d, x[k + 0], S41, 4096336452);
                d = II(d, a, b, c, x[k + 7], S42, 1126891415);
                c = II(c, d, a, b, x[k + 14], S43, 2878612391);
                b = II(b, c, d, a, x[k + 5], S44, 4237533241);
                a = II(a, b, c, d, x[k + 12], S41, 1700485571);
                d = II(d, a, b, c, x[k + 3], S42, 2399980690);
                c = II(c, d, a, b, x[k + 10], S43, 4293915773);
                b = II(b, c, d, a, x[k + 1], S44, 2240044497);
                a = II(a, b, c, d, x[k + 8], S41, 1873313359);
                d = II(d, a, b, c, x[k + 15], S42, 4264355552);
                c = II(c, d, a, b, x[k + 6], S43, 2734768916);
                b = II(b, c, d, a, x[k + 13], S44, 1309151649);
                a = II(a, b, c, d, x[k + 4], S41, 4149444226);
                d = II(d, a, b, c, x[k + 11], S42, 3174756917);
                c = II(c, d, a, b, x[k + 2], S43, 718787259);
                b = II(b, c, d, a, x[k + 9], S44, 3951481745);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }
            var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
            return tempValue.toLowerCase();
        }
    }
    var Cookie = function () {
        var cookie = {};//缓存对象
        /**
         * 获取cookie
         *
         * @author zhujili
         * @date 2014年5月12日
         * @version v1.0
         *
         * @param key string cookie名称
         *
         * @return object
         */
        this.get = function (key) {
            var data = cookie[key];
            if (!data) {
                var json = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));
                if (json) {
                    data = cookie[key] = JSON.parse(json[2]);
                }
            }
            if (data) {
                if (data.expires > 0 && (Date.parse(new Date()) / 1000) - data.timestamp >= data.expires) {
                    this.del(key);
                } else {
                    return data.value;
                }
            }
            return null;
        }
        /**
         * 设置cookie
         *
         * @author zhujili
         * @date 2014年5月12日
         * @version v1.0
         *
         * @param key string cookie名称
         * @param value object 要设置的值
         * @param expires number 过期时间/秒，为0时浏览器关闭即失效，默认为0
         *
         * @return void
         */
        this.set = function (key, value, expires) {
            if (typeof expires != "number") {
                expires = 0;
            }
            var data = {
                expires: expires,
                timestamp: Date.parse(new Date()) / 1000,
                value: value
            };
            cookie[key] = data;
            if (expires && expires > 0) {
                var exp = new Date();
                exp.setTime(exp.getTime() + expires * 1000);
                document.cookie = key + "=" + JSON.stringify(data) + "; expires=" + exp.toGMTString() +"; path=/";
            } else {
                document.cookie = key + "=" + JSON.stringify(data) +"; path=/";
            }
        }
        /**
         * 删除cookie
         *
         * @author zhujili
         * @date 2014年5月12日
         * @version v1.0
         *
         * @param key string cookie名称
         *
         * @return void
         */
        this.del = function (key) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            delete cookie[key];
            document.cookie = key + "=null; expires=" + exp.toGMTString() +"; path=/";
        }
    }
    var Dates = function(){
        /**
         * 格式化日期
         * @param dateObject
         * @param format
         * @returns {*}
         */
        this.format = function(dateObject, format){
            var o = {
                "M+" : dateObject.getMonth()+1, //month
                "d+" : dateObject.getDate(), //day
                "h+" : dateObject.getHours(), //hour
                "m+" : dateObject.getMinutes(), //minute
                "s+" : dateObject.getSeconds(), //second
                "q+" : Math.floor((dateObject.getMonth()+3)/3), //quarter
                "S" : dateObject.getMilliseconds() //millisecond
            }

            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (dateObject.getFullYear()+"").substr(4 - RegExp.$1.length));
            }

            for(var k in o) {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;
        }
        /**
         * 返回中文描述的周
         * @param dateObject
         * @returns {string}
         */
        this.getDay = function(dateObject){
            var days = ["周日","星期一","星期二","星期三","星期四","星期五","周六"];
            return days[dateObject.getDay()];
        }
        /**
         * 获取本月有多少天
         * @param dateObject
         * @returns {number}
         */
        this.getDate = function(dateObject){
            return new Date(dateObject.getFullYear(),dateObject.getMonth()+1,0).getDate();
        }
        /**
         * 获取当前日期为今年的第几周
         * @param dateObject
         * @returns {number}
         */
        this.currentWeek = function(dateObject) {
            var totalDays = 0;
            var days = [31,28,31,30,31,30,31,31,30,31,30,31];
            days[1] = (Math.round(dateObject.getYear() / 4) == dateObject.getYear() / 4)? 29 : 28;
            if (dateObject.getMonth() == 0) {
                totalDays = totalDays + dateObject.getDate();
            } else {
                var curMonth = dateObject.getMonth();
                for (var count = 1; count <= curMonth; count++) {
                    totalDays += days[count - 1];
                }
                totalDays += dateObject.getDate();
            }
            //得到第几周
            var n = 7 - new Date(dateObject.getFullYear() + "-01-01").getDay() + 1;
            if(totalDays < n){
                return 1;
            }
            var week = Math.floor((totalDays - n) / 7)+2;
            if(new Date(dateObject.getFullYear() + "-12-31").getDay()==6){
                return week
            }
            return week > 52 ? 1 : week;
        }
        /**
         * 比较2个日期之间相差多少周（以7天为单位）
         * @param objDate1
         * @param objDate2
         * @returns {Number}
         */
        this.dateDiffWeek = function(objDate1, objDate2) {
            var objDate1, objDate2, intDays;
            intDays = parseInt(Math.abs(objDate1 - objDate2) / 1000 / 60 / 60 / 24);
            intDays = intDays + 1;
            var WeekNum = parseInt(intDays / 7);
            if (WeekNum <= 0 && objDate1 > objDate2) {
                WeekNum = 1;
            }
            return WeekNum;
        }
        /**
         * 把秒数转换为 X天、X小时、X分钟、X秒
         * @param second
         * @returns {string}
         */
        this.secondToDate = function(second){
            if(second<60){
                return second + " 秒 ";
            }
            var d, w, m, s, r="";
            d=w=m=s=0;
            if(second<3600){
                m = Math.floor(second/60);
                s = second - m*60;
            }else if(second<86400){
                w = Math.floor(second/3600);
                m = Math.floor((second-w*3600)/60);
                s = second - (w*3600+m*60);
            }else{
                d = Math.floor(second/86400);
                w = Math.floor((second-d*86400)/3600);
                m = Math.floor((second-(d*86400+w*3600))/60);
                s = second - (d*86400+w*3600+m*60);
            }
            if(d){
                r = d+" 天 ";
            }
            if(w){
                r += w+" 小时 ";
            }
            if(m){
                r += m+" 分钟 ";
            }
            if(s){
                r += s+" 秒 ";
            }
            return r;
        }
    }
    var Server = function(){
        var uniqueId = 0;//请求ID
        /**
         * 调用服务器接口
         * @param url string 接口名称
         * @param param object 发送给服务器的数据 [可选]
         * @param cb function 回调方法 [可选]，回调方法中的第一个参数为唯一请求ID，为0时表示产生错误，第二个参数为返回的数据或者是错误消息，第三个参数为请求耗时毫秒数
         *
         * @return void
         */
        this.call = function (url, param, cb) {
            var reqId = ++uniqueId;
            var startTime = new Date().getTime();
            try{
                $
            }catch (e){
                if (typeof cb == "function") {
                    cb(0, "Must rely on JQuery.ajax.", new Date().getTime() - startTime);
                }
                return;
            }
            $.ajax({
                timeout: 60000,
                url: url,
                data: param ? JSON.stringify(param) : null,
                type: "POST",
                contentType:"application/json; charset=utf-8",
                dataType: "json",
                success: function(data){
                    if (typeof cb == "function") {
                        cb(reqId, data, new Date().getTime() - startTime);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (typeof cb == "function") {
                        cb(0, "status:[" + textStatus + "] error:[" + errorThrown + "]", new Date().getTime() - startTime);
                    }
                },
                cache: false
            });
            return reqId;
        }
    }
    var Regex = function () {
        //检查手机号码是否正确
        this.checkMobile = /^1\d{10}$/;
        //3-4位区号，7-8位直播号码，1－4位分机号，11位手机号
        this.checkPhone = /^((0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?)|^1\d{10}$/;
        //检查电话号码是否正确
        this.checkTel = /^((\(\d{3}\))|(\d{3}\-))?13\d{9}|15\d{9}|18\d{9}$/;
        //是否为数字
        this.checkNumber = /[^\d]/g;
        //验证传真
        this.checkFax = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})$/;
        //网址
        this.checkUrl = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/;
        //邮箱
        this.checkEmail = /^[a-zA-Z0-9]+[_a-zA-Z0-9-]*(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
        //密码 密码只能以6~16位的字母和数字组成
        this.checkPwd = /^[a-zA-Z0-9]{6,12}$/;
        //字母数字组合
        this.checkAZ09 = /^[a-zA-Z0-9\-\_]+$/;
        this.check09 = /^[0-9\-]+$/;
        //是否特殊字符
        this.checkChar = /^[\w\u4e00-\u9fa5]+$/gi;
        //检查日期是否合法
        this.checkDate = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/i;
    }
    var Str = function () {
        /**
         * 获取字符长度，1个中文计为2个字符
         * @param str
         * @returns {*}
         */
        this.getBLen = function (str) {
            if (str == null) return 0;
            if (typeof str != "string") {
                str += "";
            }
            return str.replace(/[^\x00-\xff]/g, "01").length;
        }
        /**
         * 简化文本，中间部分替换为****
         * @param txt
         * @param len
         * @returns {*}
         */
        this.brief = function (txt, len) {
            if (self.getBLen(txt) / 2 > len && len >= 2) {
                var s = txt.substr(0, Math.floor(len / 2));
                var e = txt.substr(txt.length - Math.ceil(len / 2), txt.length);
                return s + "****" + e;
            }
            return txt;
        }
    }
    var Browser = function(){
        var u = navigator.userAgent;
        this.isIE = u.indexOf('Trident') > -1; //IE内核
        this.isOP = u.indexOf('Chrome') > -1; //谷歌内核
        this.isFF = u.indexOf('Firefox') > -1; //火狐内核
        this.webKit = u.indexOf('AppleWebKit') > -1; //苹果、谷歌内核
        this.mobile = !!u.match(/AppleWebKit.*Mobile.*/); //是否为移动终端
        this.ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        this.android = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
        this.iPhone = u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1; //是否为iPhone或者QQHD浏览器
        this.iPad = u.indexOf('iPad') > -1; //是否iPad
        this.webApp = u.indexOf('Safari') == -1; //是否web应该程序，没有头部与底部
    }

    this.sync = new Sync();//异步调用中使用同步方式执行
    this.url = new Url();//用于获取URL中的参数
    this.storage = new Storage();//本地数据持久化
    this.md5 = new Md5();//MD5加密
    this.cookie = new Cookie();//COOKIE操作
    this.date = new Dates();//日期工具
    this.server = new Server();//服务器通信工具
    this.regex = new Regex();//正则表达式集合
    this.str = new Str();//字符串工具
    this.browser = new Browser();//浏览器判断
};