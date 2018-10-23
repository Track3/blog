---
title: 变身智能路由器，树莓派配置LEDE
date: 2017-05-29T17:25:44+08:00
draft: false
featuredImg: "https://assets.xxxlbox.com/images/2017/Buy_Pi_Cover-01.png"
tags:
  - 折腾
  - 树莓派
---

对于一台仅仅是能用来上网的路由器，我是不满足的。为了做很多interesting的事，我把目光投向手上这台吃灰已久的Raspberry Pi 3B。

早就听说树莓派可以做路由器，可是网上总找不到详细的教程，[OpenWrt](https://openwrt.org/)官方也没有适配树莓派3B，我一直都没成功。直到有一天，我惊喜地发现OpenWrt的一个分支[LEDE](https://lede-project.org/)支持3B了，体验了一番，发现稳定性还有些问题，无法正常使用。最近发现LEDE有更新，试了一下，发现终于能用了。

{{< figure src="https://assets.xxxlbox.com/images/2017/img005.gif" alt="techdata" caption="最先支持3B的一版是17.01.0，最近更新的版本是17.01." width="1232" height="171" >}}

去[这里](https://lede-project.org/toh/views/toh_fwdownload?dataflt%5BBrand*~%5D=Raspberry+Pi+Foundation)下载树莓派LEDE固件。

下载.gz格式的压缩包，解压，用Win32 Disk Imager将镜像烧录至SD卡。这个就不用多说了，相信玩树莓派的都熟悉。

**2018.6.17 更新**：经测试，目前的最新版17.04工作不正常，17.01.2版能用。把下载链接里的所有`17.01.4`改成`17.01.2`即可下载到17.01.2版。至于17.01.3版请自行测试。这里再提供一个3B的[百度网盘下载](https://pan.baidu.com/s/1Vi-4PdQdJTw7ZJs41BUlyw)。

由于树莓派刷LEDE系统后默认IP地址是192.168.1.1，这会与一般路由器的网关地址冲突，所以如果我们要把树莓派直接连到现有路由器上，以实现同一个网段对树莓派的访问，首先就要更改路由器的LAN IP为192.168.1.0或其他你开心的数字（ 确保是同一个网段）。要是不想碰现有路由器，或者你现在并没有路由器（正准备用树莓派做一个），可以直接把树莓派用网线连接至电脑（LEDE的WLAN默认是关闭的，只能用有线；此时最好关闭电脑的WLAN）。我这里就是直接有线连接的。浏览器输入192.168.1.1进入LEDE的Luci web界面。

![Luci web](https://assets.xxxlbox.com/images/2017/img006.gif)

设定好密码以后进入Network>Wireless，点击"Edit"。在下面的"Interface Configuration"中的"Wireless Security"选项卡中设定WIFI密码（加密方式选WPA2-PSK），然后启动WLAN网络。

![Luci interfaces conf](https://assets.xxxlbox.com/images/2017/img007.gif)

此时就可以拔下网线，用WIFI连接，腾出来的那个网口就是WAN口了，我们把宽带接上。再次打开LEDE的后台配置界面，进入Network>Interfaces，编辑"lan"的配置。在"Physical Settings"里面去掉"eth0"即物理有线网卡的勾。保存并应用。这样，就可以确保树莓派上的有线网口是WAN专用了。

{{< figure src="https://assets.xxxlbox.com/images/2017/img008.gif" alt="Luci interface conf" caption="取消'eth0'的勾选" width="1454" height="589" >}}

然后，我们回到"Interfaces"界面下，点击新建一个"wan"的配置，协议请根据自己的实际上网方式选择，我这里是PPPoE。下面的"Cover the following interface"选"eth0"。然后输入宽带账号密码就可以连接上网了。

![Luci interfaces conf](https://assets.xxxlbox.com/images/2017/img009.gif)

![Luci interfaces conf](https://assets.xxxlbox.com/images/2017/img010.gif)

有了网络，首先我们可以安装Luci的中文语言包。进入System>Software，点击"Update lists"更新一下源。直接搜素"zh-cn"，安装"luci-i18n-base-zh-cn"。装完后进System设置，"Language and Style"里面选择中文就行了。

![Luci software conf](https://assets.xxxlbox.com/images/2017/img011.gif)

此时还有一个问题。我用的16G的SD卡，在LEDE下大概只有200多MB可用，我们还需要手动为文件系统扩容。我是参照网上的教程，用的fdisk和resize2fs，然而失败了。最后resize2fs的时候时报错，目前还没解决。不过听说还有个工具叫GParted，但是没有Linux的环境，Windows下需要U盘启动，就没有试……

不知道是不是心理因素，用了树莓派的路由器感觉网比以前快多了（65元的渣渣路由器你懂的）。就是开网页的时候感觉反应飞快。虽然网速没有变快，但是感觉网络整体响应变快，可能网络延迟降低了吧。毕竟树莓派四核CPU加上1G内存对一个路由器来说简直豪华……

然而，如果我们把树莓派刷成路由器，只是简单的把它当成一个上网用的设备，那是不是有点过于大材小用了？LEDE是OpenWrt的一个分支，本质还是一个Linux系统，因此有很多软件包可以使(zhe)用(teng)。这些软件可以极大地拓展路由器的功能，实现各种黑科技。

LEDE采用opkg的软件包管理系统，类似于Debian系的"apt-get"与红帽系的"yum"。我大致看了看软件源，感觉基本上可以把路由器弄成一个服务器了。

下面说说我安装一些软件包：

* openssh-sftp-server：实现sftp访问树莓派，方便传输文件。
* UPnP：通用即插即用。一般的路由器都支持，没有理由不安装。
* QoS：判断网络行为所需的带宽并进行自动分配，保障重要的网络行为数据优先转发，还可以为某个IP限速。一般的路由器都支持，没有理由不安装。
* DDNS：动态dns，将自己的公网IP映射到一个固定的域名解析上，实现公网访问路由器，配置好防火墙和端口转发后还可以直接访问内网。由于一般宽带都不是固定IP的，所以这很重要。普通路由器也支持这个功能，不过往往是只支持花生壳（oray.com）的服务，LEDE上这个支持更多的服务商。
* Aria2 + yaaw：下载机，设置好DDNS后轻松远程下载。

还有一些软件是打算装的，还没有来得及：

* Adblock：屏蔽广告。
* Samba和MiniDLAN：打造NAS和多媒体共享中心。
* LNMP：LEDE是带了一个web server的（不然Luci的web界面怎么打得开），叫uHTTPd。看了一下软件源，发现Nginx和php版本好新，Apache很旧。可能没有多少人会在路由器上跑数据库吧，mysql版本才5.1……考虑到树莓派的性能，sqlite可能是更好的选择。
* Seafile：私有云。

说实话，树莓派还是适合用来折腾，而不是拿来使用。毕竟不是专门的网络设备，网卡的带宽还是共享USB的，而且还是USB2.0，所以就捉襟见肘了。另外，市面上有很多智能路由器产品，它们都有图形化的后台界面，有配套的手机app，只需要几个简单的操作就能实现上面的很多功能，用户体验不知道要强多少。然而，费尽辛苦做成一件事时的喜悦，真的只有经历过才会懂。这也许就是折腾的意义吧。
