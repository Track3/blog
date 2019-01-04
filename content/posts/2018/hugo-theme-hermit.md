---
title: "一个Hugo主题：Hermit"
date: 2018-11-27T14:49:11+08:00
draft: false
tags:
  - Hugo
  - 折腾
---

从WordPress换到Hugo，深深感到Hugo在国内的流行度很低，远不如Hexo。之前，在Hugo主题库中实在是找不到满意的主题，于是我一头扎到文档中，写了这个主题。很想为Hugo官方主题库贡献一些东西，无奈自己还是比较菜，一些问题只能慢慢解决。经过自己近5个月的使用、改进，该主题一些较明显的Bug已被修复，最近我抽了点时间，把原来写死了的代码改成了可在配置文件中方便调整的变量，主题终于是拿得出手了。

可以说这是我第一个准备认真去做的开源项目了。小心翼翼地写好Readme，按照官方主题库的要求修改，使用脚本测试完成后，我鼓起勇气向官方主题库发了一个[Issue](https://github.com/gohugoio/hugoThemes/issues/453)，指向我的项目地址。经历了大概一个多月的等待，主题终于在出现在了官方主题站中。

* Hugo官方主题站主页：https://themes.gohugo.io/hermit/
* GitHub项目地址：https://github.com/Track3/hermit

在《[Hello Hugo](/posts/2018/hello-hugo)》这篇文章中我们已经聊了不少关于这个主题的话题，所以这里我就简单总结一下，列一下主要特点：

* 内容至上，注重文字排版，单栏布局，功能及导航均位于可自动隐藏的底栏上；
* 至简，无第三方框架，使用Hugo Pipes[^1]，最终打包压缩的css文件<20KB；
* 文章列表页采用按年分组、以日期排列的形式，类似于书籍目录；
* 支持文章特色图片，以背景图显示[^2];
* 响应式设计，矢量图标。

![Hermit](https://assets.xxxlbox.com/images/2018/img026.png)

主题的使用方法及配置，项目Readme里都有说明，不过是用英文写的，所以我这里还是简单说明一下。 

首先是主题的安装。你可以直接将主题clone到`theme/hermit`目录下，或者，如果你的Hugo站点已经是一个Git仓库了，可以考虑将主题安装为一个submodule，这样更新起来会方便一点。当然，你也可以直接下载zip压缩包手动安装。

然后，复制主题的`exampleSite`目录里的`config.toml`到Hugo的根目录中。请根据自己的需求修改配置，配置文件中有一定的说明，应该很容易理解。关于网站的favicon图标，建议使用[RealFaviconGenerator](https://realfavicongenerator.net/)这个在线工具来生成。主题的社交图标都来自Feather Icons，所以就没有国内的社交媒体的图标了，目前仅支持[这些](https://github.com/Track3/hermit#social-icons)。当然，图标都是保存在`layouts/partials/svg.html`中的独立svg，可以非常方便地添加、更换。

主题对待内容分两种，`posts`文件夹内的内容会被当作所谓的“博客文章”来看待，`posts`之外的则会以“页面”来渲染。使用`hugo new posts/hello-world.md`命令可以生成一个标题为“Hello World”的文章，`hugo new hello-world.md`则会生成一个标题为“Hello World”的页面。

值得注意的是本站目前正在使用的主题并不完全就是Hermit主题，Hermit主题是本站代码修改得到的。当然，页面设计什么的都一样，而且，本站的所有源代码都可以在GitHub上找到[^3]。精力所限，我在短时间内应该不会换主题了，所以这个项目会长期维护下去，以我自己的设想以及GitHub上Issue里的建议来看，这个主题接下来要做的大概有：

* 点击底栏空白处返回顶部，或者加一个返回顶部按钮；
* 文章目录TOC；
* 底栏中加入搜索；
* i18n支持，让主题中的字符串可翻译；
* 标签页模板（即“tags”页面）；

这些只是设想，不保证都能实现，当然欢迎各种形式的Pull Request。

截至本文章发布时，项目已经收到了11颗Star，作为一只萌新，还是很受鼓舞的，尤其是考虑到主题除了被Hugo官方Twitter推广过之外几乎没有任何宣传。说实话，我严重怀疑带有如此强烈个人喜好的主题会有人真正拿去使用，更多希望的是能够抛砖引玉，提供一种思路和参考吧。

[^1]: https://gohugo.io/hugo-pipes/
[^2]: 演示效果见 https://themes.gohugo.io//theme/hermit/posts/post-with-featured-image/
[^3]: https://github.com/Track3/blog