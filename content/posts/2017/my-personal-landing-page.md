---
title: 自己写的个人Landing Page
date: 2017-10-22T21:10:04+08:00
draft: false
excerpt: 苦学Web前端，终于弄了个像样的网页出来。
tags:
  - 前端
---

苦学Web前端，终于弄了个像样的网页出来。不废话，链接：[i.xxxlbox.com](https://i.xxxlbox.com)。

![Landing页](https://assets.xxxlbox.com/images/2017/img020.jpg)

我给这个页面起了个名字叫“The One”。为什么叫这个名字呢？说来真的巧，正想起名字的时候，听到了这首《[The One](http://music.163.com/#/song?id=469272617)》。虽然歌曲表达的意思跟页面内容完全无关，不过借用一下做个标题也无妨嘛……

## 先说说特点吧：

1. 使用Bootstrap框架，响应式布局；
2. 黑白相间的熊猫配色，极简主义；
3. 向下滚动时会有呼出动画（Reveal Animations）。

## 使用的框架/库/API：

* [Bootstrap](http://getbootstrap.com/)；
* [jQuery](http://jquery.com/)；
* [Font Awesome](http://fontawesome.io/)；
* [lightGallery](http://sachinchoolur.github.io/lightGallery/)；
* [scrollReveal.js](https://scrollrevealjs.org/)；
* [百度地图 JavaScript API v2.0](http://lbsyun.baidu.com/index.php?title=jspopular)。

为了充实文章内容，我决定贴出一些代码，分享一下心得。

首先我想分享一下CSS里"vh"和"vw"这两个单位，他们分别表示相对浏览器视窗的高度和宽度。浏览器整个可视区的高度和宽度分别被定义为100vh和100vw，所以如果你想把一个元素的高度设定到占满整个浏览器，那么可以简单地设定`height: 100vh`。而且，不管你怎么改变窗口大小，元素的高度总是会保持刚好占满浏览器视区。看到很多人用js实时改变高度来实现铺满效果，反正我的原则就是，CSS能实现的，坚决不碰JavaScript，这个单位简直不要太好用。

然后我想分享一下Flexbox轻松实现元素垂直、水平居中对齐的方法。

拿我的这个页面的header部分来说吧，我的header中有两个container，一个是装着标题以及社交按钮的大容器，一个是装着“点我向下滚动”按钮的靠下的容器。html就像这样：

```html
<header>
    
  <div class="container" id="hdr-center">
   <h1 id="hdr-big-text">大标题</h1>
    <h2 id="hdr-smaller-text">小标题</h2>
    <p id="hdr-social">
      <a class="fa fa-flag" href="#"></a>
      …
      <a class="fa fa-envelope" href="#"></a>
    </p>
  </div>
    
  <div class="container">
    <p>
      <a class="fa fa-chevron-down" id="showmore" href="#me"></a>
    </p>
  </div>
    
</header>
```

首先，我指定整个header部分：

```css
header {
  display: flex;
  flex-direction: column;   /* 设定主轴的方向（即项目的排列方向）为垂直方向 */
  justify-content: center;  /* 定义项目在主轴上居中对齐 */
  align-items: center;      /* 定义项目在交叉轴上居中对齐 */
}
```


这样，header中的两个容器在水平和垂直方向上都是居中的。“点我向下滚动”按钮跑中间去了，那怎么样把它拉到header底部呢？这个时候，我对它上面的容器也就是`#hdr-center`设定：

```css
#hdr-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

`flex: 1`算是`flex-grow: 1`的简写。`flex-grow`默认为0，表示如果轴上存在剩余空间，元素不放大。当只指定`#hdr-center`为`flex-grow: 1`时，该容器会扩大到占满整个轴，这样“点我向下滚动”按钮自然就被挤到下面了。然后再把`#hdr-center`设为`flex`，里面的大小标题和社交按钮就可以完美居中了！

Flexbox真的是快速定位布局的神器，难怪新版Bootstrap都改用Flexbox定位了。如果不用Flexbox的话，垂直居中就不好实现，估计就是要把position设为absolute，然后`left: 50%; top: 50%;`之类的，这就把元素从正常的文档流中剥离了，总感觉这样的居中让人不舒服……

心得体会大概就说这么多吧，总之，写这个页面真的学到了不少东西。栏目设计参考了一些大佬的个人主页，毕竟萌新，各位大佬莫见笑。另外，既然是前端，所有代码都是公开的，需要的可以直接拿走。也欢迎大家给我一些建议，遇到什么兼容性问题欢迎给我反馈，当然了，请务必使用现代浏览器.

等等，是不是少了点什么？好像缺一个反馈表单。以我目前的能力，还做不出表单提交的后端。还是慢慢来吧，不管怎么说，这次整个页面都是自己一手设计、一行一行代码码出来的，虽说简陋了点，但我还是蛮开心的。毕竟萌新，以后会越来越好的。
