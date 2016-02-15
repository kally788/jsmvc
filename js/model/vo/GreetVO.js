/**
 * Created by zhujili on 2015/11/5.
 * key/value 数据对象
 * 采用预先定义好的 VO 对象来保存数据可明确数据结构
 * 也可以采用 {} 的方式来保存数据，但是当您的数据结构非常多的时候，并不易于后期的维护工作
 */

js.model.vo.GreetVO = function () {
    this.msg = "您好，世界！";
}