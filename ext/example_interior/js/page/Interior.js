/**
 * Created by zhujili on 2015/11/5.
 *
 * 这是一个预加载扩展模块例子，需要在 index.html 的 ext 数组中添加模块路径 "ext/example_interior/package.js"
 * 使用时可通过 $jsmvc$.facade.reqPage("ext.example_interior.js.page.Interior") 直接注册和获取，无需加载
 */

ext.example_interior.js.page.Interior = function () {

    /**
     * 当页面被创建时
     * 设置舞台为 body
     * 设置 HTML 模版并转换为 JQ 对象
     * 添加页面按钮点击事件，点击按钮后加载 example_external 扩展并显示
     */
    this.onCreate = function(parent) {
        parent.setStage(document.body);
        $(parent.setDisplay("ext.example_interior.html.interior")).find("span:eq(0)").on("click",function(){
            $jsmvc$.run.includeExt("ext/example_external/package.js",function(state, data){
                if(state==0){
                    //console.log("开始加载模块完成！");
                    $jsmvc$.facade.reqPage("ext.example_external.js.page.External").showPage();
                }else{
                    if(data.total == 0){
                        //console.log("开始加载模块...");
                    }else{
                        //console.log("加载过程中：", data.total, data.progress,state,data);
                    }
                }
            });
        });
    }

}