# pTemplateJs
pTemplateJs方便快捷的javascript开发框架。

[![输入图片说明](https://travis-ci.org/ereddate/ptemplatejs.svg?branch=master "在这里输入图片标题")](https://travis-ci.org/ereddate/ptemplatejs/jobs/274873714)


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
第一步，创建html：
<div id="main"></div>
<!-- 创建完的html将放到上面的div中 -->
<div p-template="test">
  <div style="{{ style }}">{{ title }}</div>
</div>
第二步，写样式:
var styles = pTemplate.createStyle({
  default:{
    color: "red"
  }
});
第三步：写javascript:
pTemplate.render(
  "test", 
  {style: styles.default, title: "这是测试标题"},
  pTemplate.query("#main"),
  function(elem){
    console.log("创建完成");
  }
);
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