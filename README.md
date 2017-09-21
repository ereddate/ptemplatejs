# pTemplateJs 
模板、数据绑定、数据过滤、事件处理、条件及列表渲染、样式控制、路由、数据仓库、组件化等等。

<a href="https://travis-ci.org/ereddate/ptemplatejs/jobs/274873714"><img src="https://travis-ci.org/ereddate/ptemplatejs.svg?branch=master" /></a>

<p><a href="http://img.hexun.com/2016/ereddate/hackernews/html/0.0.1/index.html" target="_blank">在线demo1</a> <a href="http://img.hexun.com/2016/ereddate/famousman/html/0.0.1/index.html?type=app" target="_blank">在线demo2</a> <a href="http://img.hexun.com/2016/ereddate/stock/html/0.0.1/index.html?type=app" target="_blank">在线demo3</a></p>
<p>(兼容android\ios系统下, safari\chrome\firefox\opera\猎豹浏览器及其他浏览器)</p>

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
# MIT License
```
Copyright (c) 2016-2017 dong yan (阎冬) <ereddate@gmail.com>

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```