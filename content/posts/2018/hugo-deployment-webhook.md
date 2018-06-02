---
title: "Hugo利用Webhook实现自动部署"
date: 2018-06-02T14:19:05+08:00
draft: true
tags: 
  - Hugo
  - GitLab
---

既然是静态博客，部署可不就很简单嘛，完全可以在本地电脑上用`hugo`命令生成静态文件，然后FTP上传到服务器就行了。这种方法是最直观的，但实在是有点麻烦，更重要的是，这一点也不geek。都8102年了，谁还用FTP啊，大家都在用Git好不好！这里我就简单记录一下利用GitLab提供的Webhook来实现Hugo在VPS上自动部署的方法。

## 前提

此方法仅适用于在VPS上部署，对于使用GitHub Pages部署或用Netlify部署的同学并不适用。用各类Pages服务的直接本地生成然后Push到Git仓库就行，或者搞个CI自动构建；Netlify就不用多说，绑定账号，选定好Git Repo和分支就不用操心了，一切都是全自动的。

关于怎么搭建配置Hugo这里就不做讨论，所以这篇文章前提是认为你已经在本地安装好了环境，搭好了Hugo站点，并且，你已经把源放到远程Git仓库了，我本人用的是GitLab，后面说的也是GitLab上的方法，当然，跟GitHub大同小异。

另外，我的服务器是Debian 9，其他Linux发行版的应该也是大同小异的，并且以下操作我都是以root身份，如果你是非root账户，出现权限问题记得加`sudo`哦。

## 原理

我在上一篇文章《[Hello Hugo](https://www.xxxlbox.com/posts/2018/hello-hugo/)》中已经说过了，就是更改Push到GitLab，GitLab发送一个POST请求到服务器，服务器上一个Node.js脚本监听请求，收到请求就运行一个shell脚本自动拉取最新代码并构建。废话不多说了，开始吧……

## 操作

###  配置环境

我指的是VPS的环境配置。

#### Git

安装Git，这个不用多说了吧：

```bash
apt update
apt install git
```

#### Hugo

在Linux上安装Hugo大概有三种方法：

1. 从系统源安装，这种方法安装更新方便，缺点是版本很低，低到生成页面时都会报错，所以不推荐。
2. 使用snap。安装snap，然后`snap install hugo`，优点是安装更新方便、版本新，然而如果你是国内的服务器，下载速度可能会慢到你怀疑人生。是否用该方法取决于你的服务器的下载速度和你的忍耐程度。
3. 直接去[Hugo Releases](https://github.com/gohugoio/hugo/releases)上找最新的release，官方提供了各个平台的二进制文件，还提供了deb格式的封装，Debian类系统可以直接用dpkg来安装，其他Linux发行版下载二进制拷到`/usr/bin`文件夹中即可使用。

我用的就是第三种方法，以安装最新的0.41为例（64位）：

```shell
wget https://github.com/gohugoio/hugo/releases/download/v0.41/hugo_0.41_Linux-64bit.tar.gz
tar -zxvf hugo_0.41_Linux-64bit.tar.gz
cp hugo /usr/bin/hugo
```

然后运行一下`hugo version`，出现类似信息就表示安装成功了：

```
Hugo Static Site Generator v0.41 linux/amd64 BuildDate: 2018-05-25T16:57:20Z
```

#### Node.js

这个我就不多说了，直接去https://nodejs.org/en/download/ ，有多种安装方式，总有一个适合你。

### 配置服务器上的Git仓库

源码放在GitLab上，为了能在服务器构建，我们需要把仓库克隆一份。git clone提供ssh和https两种方式，我这里还是推荐用ssh来连接，因为https说不定什么时候就要你重新输入账号密码了，这样一来自动部署就卡住了。用ssh要先添加ssh key。GitLab添加ssh key的详细方法请看这里：[GitLab and SSH keys](https://gitlab.com/help/ssh/README)，这里不做过多介绍。配置好ssh key以后，以我的GitLab仓库为例：

```shell
git clone git@gitlab.com:Track3/my-hugo-blog.git
cd my-hugo-blog
hugo -d /usr/share/nginx/html/blog/
```

第一次连接GitLab要确认信息，以后就不用了。后面的`/usr/share/nginx/html/blog/`是我的Nginx文档根目录，也就是生成的静态文件输出目录。

### 配置脚本

新建一个文件夹，先把hugo的自动构建脚本写好。

```shell
mkdir webhook
cd webhook
nano hugo-deploy.sh
```

`hugo-deploy.sh`中写入以下内容并保存：

```bash
#!/bin/bash

cd ~/my-hugo-blog
git pull origin master
hugo -d /usr/share/nginx/html/blog/
exit 0
```

很简单的bash脚本，其中`~/my-hugo-blog`是你的Git仓库也就是网站源码的路径。然后，我们就要用到Node.js来监听GitLab那边发送过来的请求了。用了[gitlab-webhook-handler](https://github.com/SixQuant/gitlab-webhook-handler)这个中间件：

```shell
npm install gitlab-webhook-handler --save
```

然后创建一个`gitlab-webhook.js`，写入以下内容并保存：

```javascript
var http = require('http')
var exec = require('child_process').exec
var createHandler = require('gitlab-webhook-handler')
var handler = createHandler({ path: '/webhook-123456' })

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)

console.log("Gitlab Hook Server running at http://0.0.0.0:7777/webhook-123456");

handler.on('error', function (err) {
  	console.error('Error:', err.message)
})

handler.on('push', function (event) {
    let currentTime = new Date();
    console.log('\n|--------------------> ' + currentTime.toLocaleString());
    console.log('Received a push event for %s to %s', event.payload.repository.name, event.payload.ref);
    exec('sh ./hugo-deploy.sh', function (error, stdout, stderr) {
        if(error) {
            console.error('error: ' + error);
            return;
        }
        console.log('stdout:\n' + stdout);
        console.log('stderr:\n' + stderr);
    });
})
```

这个脚本主要是来自[gitlab-webhook-handler](https://github.com/SixQuant/gitlab-webhook-handler)的README，我自己改了一点，加了日期记录。上面的`path: '/webhook-123456'`你可以任意设置，由于没有设置secret_key验证，所以这里的`webhook-123456`就相当于是密码了，让该路径不至于那么明显。端口用的是`7777`，你可以随意设置，不要过于明显。这样下来最终的监听地址就是`http://0.0.0.0:7777/webhook-123456`了，`0.0.0.0`表示该http服务监听本机的所有ip上收到的请求，说白了就是`0.0.0.0`可以换成服务器的ip或者指向服务器的所有域名。拿我自己的服务器做例子就是`http://xxxlbox.com:7777/webhook-123456`。

然后，我们要运行这个脚本：

```shell
node gitlab-webhook.js
```

现在我们只要告诉GitLab，当有Push的时候，向`http://xxxlbox.com:7777/webhook-123456`发送一个POST请求。于是我们要设置一下GitLab。

### 配置GitLab Webhook

进入你的项目主页，在左边侧栏里选择“Settings”，然后选择“Integrations”，“URL”一栏里填入你的监听地址，“Secret Token”留空，“Trigger”选择“Push events”就行了。添加Webhook后，下边可以发送测试，可以测试脚本是否工作正常。

### 使用pm2管理Node.js进程

pm2是一个很好用的Node应用的进程管理器，具有守护进程，监控，日志的一整套完整的功能，用它可以非常方便地启动、重启Node应用，并且可以实现Node应用的开机启动。安装pm2：

```shell
npm install pm2@latest -g
```

前面出于测试目的，我们直接运行了`gitlab-webhook.js`这个脚本，所以要先按`Ctrl-C`退出，然后用pm2来启动：`pm2 start gitlab-webhook.js`，使用`pm2 startup`命令来设置脚本开机启动。pm2的更多高级用法还请查看[文档](http://pm2.keymetrics.io/docs/usage/quick-start/)。

这样一来，Hugo的自动部署就配置好了，不管是在本地写文章，还是使用Headless CMS，最终只要Commit提交并Push，你的网站就会自动更新，还是很<ruby>方<rp>(</rp><rt>zhuāng</rt><rp>)</rp></ruby><ruby>便<rp>(</rp><rt>bī</rt><rp>)</rp></ruby>的。