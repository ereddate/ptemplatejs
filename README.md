# pTemplateJs
模板、数据绑定、数据过滤、事件处理、条件及列表渲染、样式控制等等。

# 使用方法
```
请查看 demo.html
```

# 模板语法
```
1）模板的属性
p-template="模板名称"，指定模板并赋予名称
p-router:属性名（href或src) = "路由别名"，路由
p-custom:属性名 = "属性值"，属性
p-handle:事件名.修饰符(prevent|stop|capture) = "方法名称"，事件控制
p-express:逻辑名(for或if) = "条件"，逻辑
p-html="模板名称"，插入模板的html代码，忽略数据渲染

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

tmpl(html, data)
模板翻译，参数分别是模板（dom或string）、数据

set(name, data)
设置指定名称模板的数据值
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

```
