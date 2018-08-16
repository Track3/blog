---
title: "编译升级Nginx尝鲜TLS1.3"
date: 2018-07-31T17:13:03+08:00
draft: false
featuredImg: ""
tags:
  - 折腾
  - Nginx
---

## 从PCI DSS说起

PCI DSS，全称Payment Card Industry Data Security Standard，第三方支付行业（支付卡行业）数据安全标准，是由PCI安全标准委员会制定，力在使国际上采用一致的数据安全措施。 早在去年，PCI安全标准委员会就为TLS 1.0设定了最后期限——2018年6月30日，也就是说自2018年6月30日起，网站将需要停止支持TLS 1.0协议才能实现PCI合规。 虽然我这博客跟支付行业并没有什么关系，但是考虑到网站上有大量的`css3`、`es6`代码，那些老旧的浏览器就算能连上，又能有多好的用户体验呢，于是我果断去掉了TLS 1.0和1.1的支持。

事实上，TLS 1.0发布于1999年，至今将近20年。该版本协议有各种已知漏洞，容易遭受BEAST、POODLE等攻击，在已是2018年的今天，的确是老了。现如今最流行的TLS版本毫无疑问是1.2，而且，支持TLS 1.1的浏览器一般都支持1.2，这也是我同时去掉TLS 1.1支持，仅保留1.2版本的原因了。TLS 1.2发布于2008年，是服役时间最长的一个版本，整整10年，TLS协议都没有更新过。要知道TLS协议跟HTTP可不能比啊，HTTP可以10年不更新，TLS不行。HTTP设计之初就几乎没有考虑到安全问题，正因为如此才有SSL和后来的TLS，所以才有HTTPS嘛。TLS是HTTP下面的一个安全层，跟安全有关的东西，就有潜在的漏洞，发现漏洞就得打补丁。与其修修补补，不如出个干净的新版。

TLS 1.3从2014年开始准备到现在，终于快要发布了。要说新版的亮点，除了安全性提高之外，更让大家兴奋的是速度与性能的提升。TLS 1.3增加了新的握手模式，建立连接的速度更快，而且还支持0-RTT的特性。关于TLS 1.3的技术特性以及跟旧版的区别，这里就不多说了，网上文章多的是，反正你只要知道TLS 1.3有很多好处就行了……

如今像Cloudflare、又拍云等CDN都纷纷支持了TLS 1.3，谷歌首页也用上了，我自己何尝不想体验一番，可我用着Nginx官方维护的软件源，实在是太舒服，根本就懒得重新编译安装。然而就在几天前，我一不小心`rm -rf`了服务器的上的`/usr/local/bin`及`/usr/local/lib`文件夹，虽然不是什么关键位置，并没有造成严重的后果，但是强迫症还是决定重装个系统吧，重新编译Nginx，试一下 TLS 1.3，再顺带加上Brotli压缩算法的支持以及对Certificate Transparency的支持。

## TLS 1.3的现状

虽然已经有很多网站用上了TLS 1.3，但是TLS 1.3标准并没有正式发布。目前最新草案是Draft 28。从[https://github.com/tlswg/tls13-spec/releases](https://github.com/tlswg/tls13-spec/releases)上可以看到，Draft 28发布后好几个月都没有再发新版本了，所以我猜应该是差不多了。Nginx从1.13开始支持`TLSv1.3`的选项，然而能否成功开启TLS 1.3还取决于编译Nginx时所用OpenSSL的版本。OpenSSL 1.1.1才能支持TLS 1.3，现在还是预览版，而且[OpenSSL的官方Wiki](https://wiki.openssl.org/index.php/TLS1.3)上写得很清楚：

> OpenSSL 1.1.1 will not be released until (at least) TLSv1.3 is finalised. 

一般的Linux发行版自带的OpenSSL肯定不可能是预发行版的，Nginx官方的软件源也肯定不会用预发行版的OpenSSL来编译，所以基本上只要你的Nginx用的是包管理器安装的，即使你用着1.14这样的版本，也是无法成功开启TLS 1.3的。（使用`nginx -V`命令即可查看Nginx所用的OpenSSL版本。）现阶段只能在编译Nginx时用`--with-openssl=/path/to/openssl `手动指定OpenSSL的源码位置来达到支持TLS 1.3的目的。

再说说客户端这边。从Chrome 65开始，Chrome会默认开启并使用TLS 1.3 Draft 23，最新的Chrome 68则添加了Draft 28支持，在Chrome的试验性功能下可手动开启。Mozilla提供了一个TLS 1.3 Draft 28的测试服务器：[https://tls13.crypto.mozilla.org/](https://tls13.crypto.mozilla.org/)，如果你的浏览器能打开就说明支持最新的Draft 28。很重要的一点是，服务端与客户端支持的Draft版本必须一致，不然就会握手失败。最新的[OpenSSL_1_1_1-pre8](https://github.com/openssl/openssl/releases/tag/OpenSSL_1_1_1-pre8)支持26、27以及28版本，并不支持现在浏览器支持更普遍的Draft 23等版本，关于这个问题已经有补丁出来了，可以让OpenSSL支持旧的Draft版本。不过我只是想简单体验一下TLS 1.3，而且浏览器总会更新的，所以就不打这个补丁了……

**更新**：TLSv1.3已于8月10日正式发布。Welcome, [RFC 8446](https://tools.ietf.org/html/rfc8446).

## 编译安装Nginx的过程

我编译安装Nginx的过程基本就是按着[屈屈大佬的这篇文章](https://imququ.com/post/enable-tls-1-3.html)来的。屈哥这篇文章最后更新时间还是去年，那时OpenSSL还没有出1.1.1的预览版，只是在GitHub仓库中有一个draft-18分支，有些细节还是不一样的，所以我还是这里简单记录一下我的编译安装过程。

我的系统是Debian 9 Stretch 64位，并且是root用户，一些命令可能需要根据情况调整了哦。

### 安装系统依赖

```bash
apt update
apt install build-essential libpcre3 libpcre3-dev zlib1g-dev git
```

### 获取依赖&组件

#### OpenSSL

```bash
wget https://github.com/openssl/openssl/archive/OpenSSL_1_1_1-pre8.tar.gz
tar -zxf OpenSSL_1_1_1-pre8.tar.gz
```

#### ngx_brotli

谷歌开发的压缩算法，压缩率比gzip高。

```bash
git clone https://github.com/google/ngx_brotli.git
cd ngx_brotli
git submodule update --init
cd ../
```

#### nginx-ct

使Nginx支持证书透明（Certificate Transparency）功能。

```bash
wget https://github.com/grahamedgecombe/nginx-ct/archive/v1.3.2.tar.gz
tar -zxf v1.3.2.tar.gz
```

### 编译并安装Nginx

我安装的是最新的主线版1.15.2，编译参数是在Nginx官方软件源中的编译参数的基础上改动而成，值得注意的是：

* 并没有自定义安装位置，因此默认会被安装到`/usl/local/nginx/`目录下。即：
  * 二进制位置`/usl/local/nginx/sbin/nginx`;
  * 配置文件位置`/usl/local/nginx/conf/nginx.conf;`
  * 网页根目录`/usl/local/nginx/html/`;
  * 总之，日志、缓存、动态模块都在`/usl/local/nginx/`下……
* 指定的运行用户和用户组分别是nobody和nogroup。
* nginx-ct的编译使用了Nginx的动态模块特性。

```bash
wget http://nginx.org/download/nginx-1.15.2.tar.gz
tar -zxf nginx-1.15.2.tar.gz
cd nginx-1.15.2
./configure --add-module=../ngx_brotli --add-dynamic-module=../nginx-ct-1.3.2 --with-openssl=../openssl-OpenSSL_1_1_1-pre8 --user=nobody --group=nogroup --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module
make
make install
```

这样一来，Nginx就安装完成了，但是为了方便，我们可以建一个软连接：

```bash
ln -s /usr/local/nginx/sbin/nginx /usr/local/bin/nginx
```

这样就可以直接用`nginx`命令来管理服务了。然而这还不够，我们还要一个启动脚本。`nano /etc/init.d/nginx`，写入以下内容：

```bash
#! /bin/sh

### BEGIN INIT INFO
# Provides:          nginx
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the nginx web server
# Description:       starts nginx using start-stop-daemon
### END INIT INFO

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/local/nginx/sbin/nginx
NAME=nginx
DESC=nginx

test -x $DAEMON || exit 0

# Include nginx defaults if available
if [ -f /etc/default/nginx ] ; then
  . /etc/default/nginx
fi

set -e

. /lib/lsb/init-functions

case "$1" in
  start)
    echo -n "Starting $DESC: "
    start-stop-daemon --start --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON -- $DAEMON_OPTS || true
    echo "$NAME."
    ;;
  stop)
    echo -n "Stopping $DESC: "
    start-stop-daemon --stop --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON || true
    echo "$NAME."
    ;;
  restart|force-reload)
    echo -n "Restarting $DESC: "
    start-stop-daemon --stop --quiet --pidfile \
        /usr/local/nginx/logs/$NAME.pid --exec $DAEMON || true
    sleep 1
    start-stop-daemon --start --quiet --pidfile \
        /usr/local/nginx/logs/$NAME.pid --exec $DAEMON -- $DAEMON_OPTS || true
    echo "$NAME."
    ;;
  reload)
    echo -n "Reloading $DESC configuration: "
    start-stop-daemon --stop --signal HUP --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON || true
    echo "$NAME."
    ;;
  status)
    status_of_proc -p /usr/local/nginx/logs/$NAME.pid "$DAEMON" nginx && exit 0 || exit $?
    ;;
  *)
    N=/etc/init.d/$NAME
    echo "Usage: $N {start|stop|restart|reload|force-reload|status}" >&2
    exit 1
    ;;
esac

exit 0
```

保存后添加执行权限，并设置Nginx为开机启动：

```bash
chmod a+x /etc/init.d/nginx
update-rc.d -f nginx defaults
```

然后就可以用`service nginx start|stop|restart|reload `等命令愉快地操作Nginx了。

### Nginx的配置

这里就贴一下SSL与ngx_brotli相关配置了，nginx-ct还没弄好……

#### SSL相关

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:TLS13-AES-128-CCM-8-SHA256:TLS13-AES-128-CCM-SHA256:EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+ECDSA+AES128:EECDH+aRSA+AES128:RSA+AES128:EECDH+ECDSA+AES256:EECDH+aRSA+AES256:RSA+AES256:EECDH+ECDSA+3DES:EECDH+aRSA+3DES:RSA+3DES:!MD5;
ssl_prefer_server_ciphers on;
```

要注意从1.15.0开始，`ssl on|off`这个选项已经废弃，现只需在`listen`选项中带上`ssl`即可，即`listen 443 ssl http2`。

#### ngx_brotli相关

这里有很多选项可以调整，但是我基本都用默认了。

```nginx
gzip         on;
gzip_vary    on;
gzip_types   text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;

brotli       on;
brotli_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;
```

## 感受效果

由于现在几乎没有默认支持TLS 1.3 Draft 28的浏览器，所以现阶段用户访问本站基本上还是会用TLS 1.2。如果你用的是Chrome 68，现在就可以在地址栏中输入`chrome://flags/#tls13-variant`开启Draft 28体验一番。目前手机版Chrome还没更新，暂不支持Draft 28，而我又不想装金丝雀版，所以还在坐等中。我自己在PC版Chrome中的感觉是几乎没什么区别，可能是请求数少，本来就很快了吧……F12 Security选项卡下效果：

![Chrome 68测试结果](https://ojirvqiyr.qnssl.com/images/2018/img024.png)

贴一下[SSL Labs的检测结果](https://www.ssllabs.com/ssltest/analyze.html?d=www.xxxlbox.com)，“Protocol Support”一项终于是满分了：

![SSL Labs测试结果](https://ojirvqiyr.qnssl.com/images/2018/img025.png)

突然发现，即将发布的TLSv1.3加上2015年定稿的HTTP/2，这两个组合起来简直就是加强版的https啊！那些说https慢的人也该醒醒了吧。