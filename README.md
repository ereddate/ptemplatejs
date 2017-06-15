# pTemplateJs
模板、数据绑定、数据过滤、事件处理、条件及列表渲染、样式控制等等。

# 使用方法
```
请查看 demo.html
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
