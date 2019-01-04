# pTemplateJs
pTemplateJs方便快捷的javascript开发框架。

【[技术文档](https://gitee.com/ereddate2017/ptemplatejs/wikis)】
```
github: https://github.com/ereddate/ptemplatejs 
oschina: http://git.oschina.net/ereddate2017/ptemplatejs (快速更新)
```

[在线demo1](http://img.hexun.com/2016/ereddate/hackernews/html/0.0.1/index.html)
[在线demo2](http://img.hexun.com/2016/ereddate/famousman/html/0.0.1/index.html?type=app)
[在线demo3](http://img.hexun.com/2016/ereddate/stock/html/0.0.1/index.html?type=app)
[在线demo4](http://www.iliulan.com/)
[在线demo5](http://nwapi.hexun.com/topic/)
(兼容android\ios系统下, safari\chrome\firefox\opera\猎豹浏览器及其他浏览器)

[ptemplatejs-jQuery插件](http://git.oschina.net/ereddate2017/jquery-ptemplatejs) (用法基本相同）

# 交流
QQ群：9786575

# 三步学会
```
初次使用者，分三步学会使用。
第一步，创建pjs单文件模板, main.pjs：
<div p-template="test">
    <div class="page">
        <div style="{{ style }}">{{ title }}</div>
    </div>
</div>
<script>
    define("test", [], function(require, exports, module){
        exports.done = function(data){
            data = $.extend({style: "", title: ""}, data);
            $.render("test", data, $.query("#app"));
            return function(callback){
                callback && callback(data);
            }
        };
    });    
</script>
<style>
    @base: 23.44/1rem;
    .page{
        div{
            font-size:12/@base;
        }
    }
</style>
第二步，写JS引入:
import "main";
define(function(require, exports, module){
    var test = require("test").done({
        style: "display:block",
        title: "这是标题测试"
    });
    test(function(data){
        ...
    });
});
第三步：生成代码:
输入命令 “grunt build_项目名称” 回车完成代码的编译。

```
# 其他
```
详细，请查看下面的 wiki说明 和 demo.html

链式写法：pTemplate.createTemplate("name")
                  .render("name",{}, parent, function(parent){...})
                  .clone("name", "newName")
                  ...
pTemplate.render(<h1>{{txt}}</h1>, {txt:"hello"}, $.query("body")); 支持html直接写入js。
使用pTemplate.set()或事件中的this._set()方法更新模板的数据，将使模板对应的DOM刷新。
DOM将拥有类似jquery相同的私有dom操作方法，如this._append()、this._frist()、this._css()、this._attr()等等。
调用内部方法，可以使用pTemplate.__mod__.方法名取得。
```