---
title: WordPress站点如何配置Nginx
date: 2017-06-17T00:48:35+08:00
draft: false
tags:
  - Nginx
  - WordPress
---

从LAMP换到LNMP环境有相当一段时间了，一直在研究怎么配置Nginx最科学，这里就简单分享一下经验。

众所周知，Apache是全球使用最广泛的Web服务器，各种模块很多、教程也多，几乎可以满足你的各种需求。Nginx是一个高性能的Web服务器，它占用资源少，能轻松应对高并发的连接，相比Apache更加轻量化。可以说Nginx与Apache风格迥异，然而，网上很多关于Nginx的教程都是用的Apache的思路，一个配置文件各种写法的都有，让人很疑惑。也许是Nginx配置文件比较智能吧，感觉怎么写都能正常访问，然而作为强迫症，找不到最正确最科学的配置方法，简直难受。

好好看了一下Nginx的官方文档，结合了codex.wordpress.org以及Nginx Wiki上的教程，姑且认为我现在Nginx的配置文件写对了吧，有什么不妥的欢迎讨论……

在运行WordPress时，Nginx与Apache有些区别是你必须要了解的：

* 执行php请求时，Nginx无法直接处理php文件，所以一般它是将php请求传送到后端的php-fpm（默认在本地的9000端口侦听，即127.0.0.1:9000）来处理。而Apache是将php当作自己的一个模块来调用，只要开启了这个模块，无需进一步的配置，Apache就能直接执行php请求。
* Nginx没有像Apache的.htaccess那样的文件目录级别的配置文件。Apache的配置文件是可以AllowOverride的，也就是说你在.htaccess文件中的配置可以覆盖程序目录中的主配置文件（那么这也就意味着每次请求，Apache都会去读取网站根目录下的.htaccess文件，这效率想想就可怕）。当然对于虚拟主机用户来说，由于无法自行更改Apache的主配置文件，.htaccess就很有用了。WordPress的自定义固定链接功能正是通过自动将伪静态规则添加到.htaccess中实现的，由于Nginx没有这个特性，所以伪静态规则就要在nginx.conf中自行添加了。

## HTTPS+HTTP/2配置

这一部分配置应该写在`http {}`块中。

```nginx
# Upstream to abstract backend connection(s) for php
upstream php {
    server unix:/run/php/php7.0-fpm.socket;  #使用unix socket
    server 127.0.0.1:9000;  #使用TCP端口
    # 上面两个取决于php-fpm的配置，二选一即可
}

# Main server
#
server {
    listen       443 ssl http2;
    server_name  www.xxxlbox.com;      # 你的网址
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;    # 开启HSTS

    ssl on;
    ssl_certificate fullchain.pem;     # 指定ssl证书路径
    ssl_certificate_key privkey.pem;
    ssl_dhparam dhparams.pem;
    ssl_session_cache    shared:SSL:15m;
    ssl_session_timeout  30m;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers   ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-ECDSA-DES-CBC3-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:!DSS;
    ssl_prefer_server_ciphers  on;

    root   html/wordpress;     # 指定网站根目录
    index  index.php index.html;

    location / {
        # This is cool because no php is touched for static content.
        # include the "?$args" part so non-default permalinks doesn't break when using query string
        try_files $uri $uri/ /index.php?$args?;
    }

    location ~ \.php$ {
        # NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini
        fastcgi_pass   php;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires max;
        log_not_found off;
    }

    location = /favicon.ico {
	log_not_found off;
	access_log off;
    }

    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }
}
```

其中，`location / {}`块的`try_files`非常机智。网上很多教程都是在这里用了if判断加rewrite，就像这样：

```nginx
if (-f $request_filename/index.html) {
    rewrite (.*) $1/index.html break;
}
if (-f $request_filename/index.php){
    rewrite (.*) $1/index.php;
}
if (!-f $request_filename){
    rewrite (.*) /index.php;
}
```

这很类似Apache的.htaccess的写法，这样配置必然是可以正常访问的。然而，Nginx官方并不推荐使用if，请参见《[If Is Evil](https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/)》。

`try_files`语句的作用就是按顺序检查文件或文件夹是否存在，返回第一个找到的文件或文件夹，如果所有的文件或文件夹都找不到，会进行一个内部重定向到最后一个参数。拿这里的`try_files $uri $uri/ /index.php?$args?`举个例子：当客户端请求`https://www.xxxlbox.com/post/2031`时，此时`uri$`就是`post/2031`（还是`/post/2031`？我不知道）。很明显，这是一个为了美观的“假”链接，网站目录下没有post这个文件夹，`$uri`和`$uri/`都是不存在的，所以请求会被重定向为`https://www.xxxlbox.com/index.php?$args?`。结果请求就被发送到php-fpm了，WordPress自己会判断请求的地址，因此就能显示正确的内容。另一个例子：当客户端请求`https://www.xxxlbox.com/wp-content/uploads/2017/10/img1.png`时，显然，此时$uri能找到，该png文件会直接被发送给客户端。由此可见，`try_files`能很好地支持WordPress的自定义固定链接功能，同时避免了每次都进行if判断，十分高效，推荐使用。

## 301跳转，强制https访问

```nginx
# Redirect non-www to www
#
server {
    listen       80;
    listen       443 ssl http2;
    server_name  xxxlbox.com;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    ssl_certificate 1_xxxlbox.com_bundle.crt;
    ssl_certificate_key 2_xxxlbox.com.key;
    ssl_dhparam dhparams.pem;

    return 301 https://www.xxxlbox.com$request_uri;
}

# Redirect http to https
#
server {
    listen       80;
    server_name  www.xxxlbox.com;

    return 301 https://www.xxxlbox.com$request_uri;
}
```

在网上搜索“Nginx 301跳转”，很多地方都是这么做的：

```nginx
server {
    listen       80;
    server_name  www.example.org  example.org;
    if ($http_host = example.org) {
        rewrite  (.*)  http://www.example.org$1;
}
```

Nginx官方文档上是这么写的，强烈建议大家去看看这一页：

> This is a wrong, cumbersome, and ineffective way. The right way is to define a separate server for `example.org`
>
> <cite>《[Converting rewrite rules](http://nginx.org/en/docs/http/converting_rewrite_rules.html)》</cite>

这里使用的是`return 301`，也是新版Nginx推荐的用法。

## WP Super Cache

Apache下，WP Super Cache可以自己生成rewrite规则并写入.htaccess文件中，而Nginx没有.htaccess这样的机制，因此rewrite规则需要自己配置。这个规则可以直接放入`server {}`块中。

```nginx
# WP Super Cache rules.
#
set $cache_uri $request_uri;

# POST requests and urls with a query string should always go to PHP
if ($request_method = POST) {
    set $cache_uri 'null cache';
}

if ($query_string != "") {
    set $cache_uri 'null cache';
}

# Don't cache uris containing the following segments
if ($request_uri ~* "(/wp-admin/|/xmlrpc.php|/wp-(app|cron|login|register|mail).php|wp-.*.php|/feed/|index.php|wp-comments-popup.php|wp-links-opml.php|wp-locations.php|sitemap(_index)?.xml|[a-z0-9_-]+-sitemap([0-9]+)?.xml)") {
    set $cache_uri 'null cache';
}

# Don't use the cache for logged in users or recent commenters
if ($http_cookie ~* "comment_author|wordpress_[a-f0-9]+|wp-postpass|wordpress_logged_in") {
    set $cache_uri 'null cache';
}
```

此时你的`location / {}`块中`try_files $uri $uri/ /index.php?$args?`应加上WP Super Cache的路径，即：

```nginx
location / {
    try_files /wp-content/cache/supercache/$http_host/$cache_uri/index-https.html $uri $uri/ /index.php?$args?;
}
```

当然如果你的不是https站点，应稍作修改：

```nginx
location / {
    try_files /wp-content/cache/supercache/$http_host/$cache_uri/index-http.html $uri $uri/ /index.php?$args?;
}
```

把WP Super Cache设置为Mod_rewrite模式，这样的话，借助WP Super Cache生成静态html文件，当条件符合时，Nginx可以直接把这些静态文件发送给用户，完全绕过php，实现全站伪静态。

另外，WordPress上还有一个很有名的缓存插件叫W3 Total Cache，它的Nginx规则在WordPress文档里也能找到：https://codex.wordpress.org/Nginx#W3_Total_Cache_Rules

## 一些其他问题

我们知道WordPress能上传文件的最大体积是由php.ini的配置决定的。除此之外，Nginx对文件的上传大小也有限制（默认好像是2MB），超过这个大小WordPress会报http错误。因此nginx.conf的`http {}`块中需加一句`client_max_body_size  64m;`（改成你想要的大小）。另外，别忘了开启gzip压缩，`gzip on;`。

使用`nginx -t`命令可以测试nginx.conf的语法是否正确。

暂时就说这么多吧，有什么其他东西以后再慢慢添加。并非专业人士，有问题欢迎指出。

个人感觉Nginx的配置文件比Apache的简洁多了，写Nginx的配置文件就跟写作文一样，每一行的意思都很清楚，非常接近英文语句，可读性高。还记得我刚换Nginx时的各种不适应，感觉现在已经离不开了。Nginx的一些特性真的是让人不得不爱。

---

我的Nginx配置参考自这些页面，英语好的强烈建议打开看看：

* https://codex.wordpress.org/Nginx
* https://www.nginx.com/resources/wiki/start/topics/recipes/wordpress/
* 关于Nginx的配置常见错误，官方吐槽：《[Pitfalls and Common Mistakes](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/)》
