---
title: "Hello Hugo"
date: 2018-05-07T22:24:24+08:00
draft: false
toc: true
tags: 
  - Hugo
  - 折腾
---

新站终于做好了。

几天前我在《[关于本站的未来](https://www.xxxlbox.com/posts/2018/whats-next-about-this-site/)》一文中详细阐述了我从WordPress换到静态博客系统Hugo的原因，这里不再赘述。简单总结下目前博客迁移的情况：

* 文章只保留了一部分，一些没有很大意义的就删掉了，保留了共11篇文章；
* 评论全部丢失；
* “友链”与“关于”页面的重写还在进行中。

~~关于新站的架构、工作原理、技术细节等话题我们以后会详细讨论。这周有两个考试，等有时间了，我再更新这篇文章……~~

考完了。

## 代码

先来聊聊新站代码相关或者说跟这个Hugo主题相关的话题吧。这个主题目前是自用主题，很多地方都写死了，而且代码比较粗糙，还有一堆bug，因此暂时不会开源。Hugo在中文博客圈里并不是特别火，用的人较少，主题什么的也是挺少的，我是很愿意为社区作贡献的，所以以后等代码拿得出手了我一定会把它丢到GitHub上的。

设计灵感来自Hugo主题“[Sam](https://github.com/hivickylai/hugo-theme-sam)”。看到这个主题的第一眼就被Get到了。文章页，从上到下，映入眼帘的是文章的标题，而不是Header里的站点标题，舒服。排版上，字符与字符之间有一定的间距，不是挤到一起的，配上灰色背景，那叫一个优雅啊，Zhuangbility爆表。本来就打算用这个主题了，实际使用下来，细节问题还是挺多的，改也不好改了，索性就自己写一个，这才有了后面的故事。

写一个Hugo主题可比WP主题容易多了。也就研究了几个主题的源码，对着文档看，几天就把HTML骨架写好了，加样式也比想象中的要顺利。第一次尝试在项目中使用Sass，安装node-sass时踩了不少坑，最后发现了Koala这个软件。Koala带了编译sass的环境，不用手动安装了，而且还带js压缩的功能，简直神器。这次为了实现底栏自动隐藏以及异步加载评论的功能，写了100多行js，最终效果还挺好的，我都有点不敢相信自己。

主题依然走极简风，借鉴了Sam主题多处写得好的地方，包括一些页面布局和文字间距。配色并没有抄Sam主题，抄的是[Humble Bundle](https://www.humblebundle.com)的官网，配色什么的借鉴一下不犯法吧？在框架与库的使用上：

* Normalize.css
* 动画库[animate.css](https://daneden.github.io/animate.css/)
* 图标库使用[Feather](http://feathericons.com/)，轻量，风格也很搭。

既然都用静态博客了，何不把加载速度优化到极致。animate.css特地用gulp自定义构建了，只取了几个需要的动画。借助sass，几个css被合并成一个文件，输出还是压缩的，最终css只有15KB，gzip压缩后只有4.5KB了。js也是做了压缩的，100行代码也就2KB，Feather图标并没有用那个js，而是直接将svg插到html文档中，减少了请求数，也避免了js动态插入svg到DOM时造成的图标显示延时。对了，还有字体，我并未使用任何网络字体，用的是“Trebuchet MS”。该字体绝大多数Windows PC和Mac均有安装，实测iOS也支持，就Android不支持，不过也无所谓，默认的Sans Serif字体也不丑。

评论系统使用Valine，需要加载Leancloud的依赖库，100多KB，评论本身js体积也有70多KB。这要是跟页面同步加载，那我前面做的那些优化就……一夜回到解放前。所以我就开始学习js异步加载的操作了，由于整个项目并没有用jQuery，就不能用jQuery的`.getScript`方法了，最终我在Stackoverflow找到了原生js的替代方法：

https://stackoverflow.com/questions/16839698/jquery-getscript-alternative-in-native-javascript

于是就很爽了。js计算评论框相对页面顶部的像素距离，监听窗口滚动事件，获取滚动距离，与评论框位置对比，就可以判断评论框是否可见。可见，就开始用上面提供的这个loadScript函数加载并执行那两个js。而在页面加载时，就完全不用管这两个巨无霸，速度快得飞起。原先打算用InstantClick.js，现在看来不用了，已经很快了，而且instantclick.js与现有js的一堆兼容问题也不是那么好解决的。

目前还有件事让我有点不舒服——百度统计。我的首页只有三个请求，gzip压缩后总体积也就8KB多，引入百度统计js后，直接多了3个请求，共有9KB，所以说页面体积直接就翻了一翻。难受，却没办法，也不知道Google Analytics怎么样。

## 部署

不太希望别人看到我的每一个Commit，就把源代码放在GitLab上了，私密仓库。腾讯云学生机还没到期，就暂时把博客部署到云服务器上。关于自动部署，这个就有的说了，大致过程是这样的：

1. 将更改Push到GitLab；
2. GitLab通过Webhook向服务器发送一个POST请求；
3. 服务器上运行着一个Node.js小程序，监听该请求，收到POST请求后运行一个shell脚本;
4. 脚本运行，先从GitLab上拉取最新的代码，然后Hugo构建页面，构建的HTML等文件直接放到Nginx网页根目录中，部署完成。🎉

所以本地写完文章，Commit提交后，Push到GitLab，等几秒钟，再打开网站，刚写的文章已经出来了，舒服。为了防止那个js小脚本被杀掉，特地用pm2来管理进程，还可以实现脚本的开机启动。

这样写博客，体验已经很好了，我很满足。但是为了应急，我还是搞了一个可以在线编辑文章的管理“后台”。由于Netlify CMS暂时还不支持GitLab，于是我就用了Forestry.io。

![Forestry.io CMS](https://assets.xxxlbox.com/images/2018/img023.png)

这个“后台”本质上是一个单页应用（SPA），它能与Forestry.io的后端API进行通信，在这里编辑好文章后，点击发布，Forestry.io会自动Commit并Push到GitLab，然后自动部署过程就开始了，美滋滋。事实上Forestry.io也带有自动构建并部署的功能，除了支持GitHub Pages、Amazon S3等静态文件托管之外，还支持FTP/SFTP。

那些说静态博客不好管理的，怎么样，涨姿势了吧。

写的有点乱啊，基本上是想到哪写到哪，就说这么多吧，以后说不定会写个详细点的Hugo博客部署指南……

**更新**：利用DNSPod智能解析，国内访客自动解析到腾讯云服务器，国外访客解析到Netlify全球CDN。
