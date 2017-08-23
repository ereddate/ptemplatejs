# pTemplateJs
模板、数据绑定、数据过滤、事件处理、条件及列表渲染、样式控制等等。
<p><a href="http://img.hexun.com/2016/ereddate/hackernews/html/0.0.1/index.html" target="_blank">在线demo1</a></p>
<p><a href="http://img.hexun.com/2016/ereddate/famousman/html/0.0.1/index.html" target="_blank">在线demo2</a></p>
<p>(兼容android\ios系统下, safari\chrome\firefox\opera\猎豹浏览器)</p>

<p>jQuery.ptemplatejs插件，jQuery专用，用法基本相同。
<a href="http://git.oschina.net/ereddate2017/jquery-ptemplatejs" target="_blank">详细说明及使用请查看</a> 

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
使用pTemplate.set()或事件中的this._set()方法更新模板的数据，将使模板对应的DOM刷新。
DOM将拥有类似jquery相同的私有dom操作方法，如this._append()、this._frist()、this._css()、this._attr()等等。
调用内部方法，可以使用pTemplate.__mod__.方法名取得。
```
