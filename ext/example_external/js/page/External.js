/**
 * Created by zhujili on 2015/11/5.
 *
 * 这是一个外部扩展模块例子，当需要时，通过 $jsmvc$.run.includeExt("ext/example_external/package.js",function(state, data){}) 来加载该模块
 */

ext.example_external.js.page.External = function () {

    /**
     * 当页面被创建时
     * 设置舞台为 body
     * 设置 HTML 模版并转换为 JQ 对象
     * 添加页面按钮点击事件，点击按钮后跳转到主界面上
     */
    this.onCreate = function(parent) {
        parent.setStage(document.body);
        $(parent.setDisplay("ext.example_external.html.external")).find("span:eq(0)").on("click",function(){
            //返回到主界面上
            $jsmvc$.facade.reqPage("js.page.HelloWorld").showPage();
        });
    }

}