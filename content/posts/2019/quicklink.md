---
title: "用上了Google quicklink"
date: 2019-03-25T23:05:42+08:00
draft: false
toc: false
images:
tags:
  - 前端
  - Hugo
---

很久很久以前，还是功能机时代，手机能装`.jar`格式的应用，我记得UC浏览器有个很厉害的功能：智能预加载——即它能够检测出页面中的翻页导航，然后提前为你加载下一页，然后你点击“下一页”这个链接时页面秒开。在那个乌龟网速的2G时代，这个功能可以说极大地提升了刷网页的畅快感（尤其是看网络小说的时候🙄）。只是当时流量贵，5元30M，有时候都有点舍不得开这个功能。现如今网速快了，流量也便宜了，这个功能很少再出现在我的视线中。

几个月之前Google Chrome Labs开源了一个由[Addy Osmani](https://github.com/addyosmani)发起的项目[quicklink](https://github.com/GoogleChromeLabs/quicklink)，它可以让浏览器在空闲时预加载视区内的链接以提升后续页面的响应速度，这跟以前的UC浏览器自动缓存下一页功能多少有点像。得知消息我倒是把GitHub地址记下了，却一直没有尝试用一下，最近突然想起这个于是我就在博客上用上了。

关于quicklink的原理，README上已经说得很清楚了，而且已经有了[中文版本](<https://github.com/GoogleChromeLabs/quicklink/blob/master/translations/zh-cn/README.md>)，所以我在这里复制粘贴也没什么意义，想更详细了解的直接去看源码就行。大致过程就是：脚本首先检测视区中的链接，等待浏览器空闲的时候，如果检测到用户不是处于慢速连接或省流量模式下，就用`rel=prefetch`来预加载这些链接。

quicklink的使用超级简单，只需引用`quicklink.umd.js`这个gzip后不到1KB的js，然后调用`quicklink()`方法即可，更重要的是它与现有js几乎不存在冲突问题，不像instantclick.js。官方README上有很多使用方法的示例，你可以调整的配置有：

* 设置被检测的元素，默认为document，即整个页面；
* 指定超时时间（默认两秒）以及超时之后的回调函数；
* 选择使用`rel=prefetch`还是Fetch API；
* 设置链接的白名单、黑名单，指定允许进行预获取操作的host，默认只允许同域；

本站利用了Hugo自带的Asset Pipeline，将`quicklink.umd.js`与原有js一并打包，几乎不影响原始页面的加载。相关代码如下：

```html
{{ $mainjs := resources.Get "js/main.js" -}}
{{ $quicklinkjs := resources.Get "js/quicklink.umd.js" -}}
{{ $script := slice $mainjs $quicklinkjs | resources.Concat "js/bundle.js" | minify | fingerprint -}}
<script src="{{ $script.Permalink }}" {{ printf "integrity=%q" $script.Data.Integrity | safeHTMLAttr }}></script>
<script>
  quicklink({
    ignores: [uri => uri.includes('index.xml')]
  });
</script>
```

兼容性方面，quicklink只支持较新版本的浏览器（Safari除外，最新的也不支持），但是无所谓，你可以把它当作一个渐进性特性（[progressive enhancement](https://www.smashingmagazine.com/2009/04/progressive-enhancement-what-it-is-and-how-to-use-it/)），就是说浏览器不支持也不影响网站的正常浏览，也就少一个体验加分的功能而已。~~谁让你用那么旧的浏览器，怪我咯？~~想让IE11和Safari也支持的话你完全可以引入一个6KB(gzipped)的polyfill，给旧浏览器打个补丁。

本站是静态站点，启用quicklink只会增加服务器的带宽开销，对CPU占用等几乎无影响。而如果你是动态网站，用这个你就不得不考虑下性能方面的问题。如果你觉得直接缓存所有可见链接有点粗暴，你可以看看[instant.page](https://instant.page/)这个项目，它是当你把鼠标光标悬浮在链接上时才开始预加载，类似于InstantClick。说真心的，InstantClick的确有些年头了，它的原理是把整个网站变成单页应用，浏览器不会转圈圈，而是脚本自己在页面顶部加了个进度条，地址的更新也是依赖于`history.pushState()`这个API实现的。这样就有一个问题，网页上的其他js有时会依赖于窗口加载事件（比较常见的就是百度统计、谷歌统计等），加了InstantClick之后用户点击一个链接，虽然表面上好像导航到了一个新的页面，但是窗口加载事件并不存在，所以你必须把依赖窗口加载的这些function像这样重新调用一遍：

```javascript
InstantClick.on('change', function() {
  // functions
  // …
});
```

quicklink以及instant.page利用的是`rel=prefetch`，就温和许多，用起来要方便不少，所以我这里强烈推荐用instant.page来代替InstantClick。

由于quicklink的README实在是太详细，还有简体中文版的，所以我不多说了，感兴趣的自己去看吧，有问题欢迎在评论区讨论。