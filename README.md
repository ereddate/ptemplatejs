# pTemplateJs
模板、数据绑定、数据过滤、事件处理、条件及列表渲染、样式控制等等。
<p><a href="http://img.hexun.com/2016/ereddate/hackernews/html/0.0.1/index.html" target="_blank">在线demo</a> 
(兼容android\ios系统下, safari\chrome\firefox\opera\猎豹浏览器)</p>

# 交流
QQ群：9786575

# 使用方法
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

详细，请查看下面的说明和 demo.html

链式写法：pTemplate.createTemplate("name")
                  .render("name",{}, parent, function(parent){...})
                  .clone("name", "newName")
                  ...
使用pTemplate.set()或事件中的this._set()方法更新模板的数据，将使模板对应的DOM刷新。
DOM将拥有类似jquery相同的私有dom操作方法，如this._append()、this._frist()、this._css()、this._attr()等等。
调用内部方法，可以使用pTemplate.__mod__.方法名取得。

数据是可计算的，如下：
...
title:"AAAA",
...
<h1 p-custom:title="('header_title_'+'{{title | lowercase}}').toUpperCase()" 
或
...
buttonText:"button text",
computed: {
    resetButtonText:function(){
        return this.buttonText.split('').reverse().join('');
    },
    ...
},
...
<input type="button" value="{{ resetButtonText | uppercase }}" 
或
...
title:"3",
...
<span>header_{{title | express : parseInt(this) % 3 + title}}</span>


标签绑定，例如：
...
  handleButtonClearClick(e){
    console.log(this._bindElement[0]._html(0))
  },
...
...
  <h1 p-bind="count">0</h1>
  <h2 p-bind="count_a" p-for="count">0</h2>
  ...
  <button p-for="count_a ..." p-handle:click="handleButtonAddClick">增加</button>
  <button p-for="count" p-handle:click="handleButtonRemoveClick">减少</button>
  <button p-for="count count_a ..." p-handle:click="handleButtonClearClick">清零</button>
...


数据绑定，例如：
...
  title:"defaultEdit",
  handle:{
    handleEditChange(e){
      this._set("test", {
        title:"newEdit"
      });
    },
    ...
  }
...
...
  <div p-template="test">
    ...
    <h1>{{title}}</h1>
    ...
    <input type="text" value="{{title}}" p-handle:change="handleEditChange" />
    ...
  </div>
...


动态创建模板，例如：
pTemplate.render($.createDom("script", {
    "p-template": "test",
    type: "text/html"
  }, $.createDom("h1", {
    html: "header_{{title}}"
  }), $.createDom("input", {
    value: "{{title}}",
    "p-handle:change": "handleChangeFn"
  }))._prependTo($.mixElement(document.body)), {
  title: "test",
  handle:{
    handleChangeFn(e){
      this._set("test", {
        title: this.value
      })
    }
  }
}, $.query("#parent"), function(elem){
  console.log(elem)
});

```

# 模板语法
```
1）模板的属性
p-template="模板名称"，指定模板并赋予名称
p-router:属性名（href或src) = "路由别名"，路由
p-custom:属性名 = "属性值"，属性，属性值可以是表达式或值，如：('title_'+'{{title}}').toUpperCase()
p-handle:事件名.修饰符(prevent|stop|capture|self) = "方法名称"，事件控制
p-express:逻辑名(for或if) = "条件"，逻辑
p-html="模板名称"，插入模板的html代码，忽略数据渲染
p-bind="名称"，标签的绑定名称
p-for="名称"，标签连接绑定标签的名称
p-style:属性名（json|text|class) = "属性值", 样式
p-binddata="数据名"，模板引用模板时，为被引用模板绑定当前模板的数据

注：
p-handle:事件名(keyup)专用修饰符(enter|delete|esc|space|up|down|left|right)
p-handle,增加新的touch事件(pinched|swipe|tap)
p-binddata,绑定当前模板全部数据时数据名为this

2）模板的嵌套，如下：
<script type="text/html" p-template="my-template">
  <header>
    <h1>{{title | lowercase}}</h1>
  </header>
  ...
</script>
<div p-template="b">
  ...
  <my-template title="header name"></my-template>
  ...
</div>

输出后：
<div>
  ...
  <header>
    <h1>header name</h1>
  </header>
  ...
</div>

3）模板数据过滤
filter：内容过滤掉指定值
json：json转String
limitToCharacter：字数限制
limitTo：位数限制
lowercase：字符最小化
uppercase：字符最大化
orderBy：数据正序、倒序
date：日期格式转换
currency：货币转换
empty：为空时替代
passcard：卡号转换
indexOf: 取指定值在数组或字符串的位置
encodeURI: 转换为URI格式
decodeURI: 解码encodeURI后的代码
toString: 任务形式数据转换为字符串
capitalize: 某位数的英文字母的大写转换
toCNRMB: 转换为中文大写人民币
toCNumber: 转换为中文大写数字
toRem: 转换px为rem
hexToRgb: 16进制转rgb
rgbToHex: rgb转16进制
cssPrefix: css属性自动加前缀 -webkit- -o- -ms- -moz-
express: 表达式，表达式中的当前对象可以是this

写法：
{{ name | filter : 'a' }}
{{ {a:1,b:2} | json }}
{{ text | limitTo : 2 }}
{{ array | indexOf : "b" }}
{{ number | toCNRMB }}
{{ number | toCNumber }}
{{ abc | lowercase }}
{{ abc | uppercase }}
{{ 123 | orderBy : reverse }}
{{ 321 | orderBy : sort }}
{{ date | date : MM/dd/yyyy }}
{{ capitalize | capitalize : 2 }}
{{ capitalize | capitalize : 0 }}
{{ 1000 | currency : '$' }}
{{ 8888888888888888888 | passcard : 4 }} 后面的4不输入的话，默认为4
{{ usname | empty : null }}
{{ 20 | toRem : 25.88 }} 后面的数据是html的字体大小
{{ #efefef | hexToRgb }}
{{ rgb(0,0,0) | rgbToHex }}
{{ "backface-visibility:hidden" | cssPrefix }}
{{ title | express : parseInt(this) % 3 }} title等于3时, this就是字符串3，表达式执行后返回结果0

```

# 提供的方法：
```
query(selector, parent)
选择器，返回数组，参数分别是表达式、父级

each(object, function(name, value){...}) 或 each(array, function(index, object){...})
for循环

getBaseFontSize()
获取页面基础字体大小，与setBaseFontSize方法配合使用

setBaseFontSize(16)
设置页面基础字体大小

ready(function(){...})
当页面准备完成后执行的方法

watch(object, key, object[key].value, callback)
对象值变化监控方法

extend(object1, object2)
对象扩展方法，返回被扩展对象本身

getTemplate(name)
获取指定名称的模板对象

router({...})
路由配置方法

clone(name, newName)
克隆模板，创建新名称的模板对象

createStyle({...})
创建新的数据化样式对象

getStyle(name)
获取指定名称的样式类值

createDom(tagName, arguments, children)
创建新的dom对象，文本标签使用"textnode"、标签片段使用"docmentfragment"

createTemplate(name, arguments)
创建新的模板对象，参数分别是名称、配置

render(name, arguments, parent, callback)
渲染模板，参数分别是名称、配置、插入到的父级、渲染后的回调函数
注：name可以是模板名称、模板HTML字符串、dom标签、function、包含render方法的对象

tmpl(html, data)
模板翻译，参数分别是模板（dom或string）、数据

set(name, data)
设置指定名称模板的数据值

mixElement(element)
扩展标签的私有方法，返回标签本身

animate 动画配置并执行
  animate(element, options, speed, callback, ease);
play 动画执行
  play(element, options, speed, callback, ease);
stop 动画停止
  stop();
delay 动画暂停并等待执行或延迟
  delay(time);

```

# Element对象私有方法，支持伪类选择器（例如："div:contents","div:parents","div:children","div:text"等等）。
```
_set(option)
按配置重绘原有Element

_findNode(selector)
以当前节点为父节点近条件查找，支持多条件查找用空格分开，返回数组

_contents()
查找父节点下的全部子节点

_empty()
清空当前节点

_parents(selector)
按条件查找当前节点的父节点

_attr(name, value)
给属性赋值

_children(selector)
按条件查找当前节点的子节点

_removeAttr(name)
删除属性

_text(value)
取文本或赋文本

_html(value)
取html或赋html

_clone(bool)
克隆节点

_on(eventName, fn)
赋事件

_off(eventName)
删除事件

_trigger(eventName)
执行事件

_remove(element)
删除当前节点

_append(element)
追加节点

_appendTo(element)
将当前节点追加到指定节点

_prepend(element)
开头插入节点

_prependTo(element)
插入到指定节点的开头

_after(element)
当前节点后插入指定指定节点

_css(name, value)
取或设置样式属性值

_addClass(name)
添加class名，支持添加多个class名，用空格分开

_removeClass(name)
删除class名，其他同上

_prop(name, value)
设置或返回属性值

_data(name, value)
设置或返回数据

_removeData(name)
删除数据

_toggleClass(name)
切换样式名

_hasClass(name)
判断是否包含指定样式名

_length(bool)
获取子节点的长度，bool等于true返回childNodes.length，否则返回children.length

_width(value)
宽度，value等于true，将返回包含margin\padding\border的值

_animate(styles, time, callback, timingFunction)
CSS3动画

_show()
显示

_hide()
隐藏

_height(value)
高度，其他同_width

_tmpl(data)
给当前标签的html模板赋值

_offset()
取绝对值，返回{top, left}

_index()
取索引值

_prevAll()
取当前节点前的同父节点的所有节点

_map(callback, arg)
把每个子节点通过函数传递到当前匹配集合，返回数组

_nextAll()
取当前节点后的同父节点的所有节点

_previous()
取上一节点

_next()
取下一节点

_has(a, b)
判断是否包含

_scrollLeft(value)
滚动条的水平偏移

_scrollTop(value)
滚动条的垂直偏移

_first()
第一个子节点

_last()
最后一个子节点

_eq(index)
选取带有指定索引值的元素

_val(value)
设置或获取节点的value属性值

_bindElement
绑定的节点集

_watch
监听标签的变化（查看test-bindelem.html）

_query
私有选择器

```
