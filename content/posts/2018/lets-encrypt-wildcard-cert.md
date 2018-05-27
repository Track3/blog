---
title: "Let's Encrypt终于支持泛域名证书了"
date: 2018-03-14T23:51:28+08:00
draft: false
tags:
  - 折腾
---

经历两个多月的测试以及两个多星期的延期，Let's Encrypt的ACME v2 API终于正式开放了。我也在第一时间换上了Wildcard野卡证书。

这里简单记录一下用[acme.sh](https://github.com/Neilpang/acme.sh)获取Wildcard证书的方法。

## 安装

我的腾讯云机器用curl下载不下来，因此我直接`git clone`整个库：

```sh
git clone https://github.com/Neilpang/acme.sh.git
cd ./acme.sh
./acme.sh --install
```

## 生成证书

ACME v2只支持DNS模式颁发证书，即通过在域名上添加一条txt解析记录来验证域名所有权。acme.sh强大的地方在于支持40多种域名解析商的api，像国内常用的腾讯云dnspod、阿里云dns、cloudxns等都支持，这里是完整列表：https://github.com/Neilpang/acme.sh#currently-acmesh-supports。

如果你的DNS服务商在支持之列，就不用手动添加txt记录了。这里以dnspod为例, 首先先登录到[dnspod](https://www.dnspod.cn/)（dnspod已被腾讯收购，账号体系也并入了腾讯云），生成你的api id和api key。然后用`export`命令导入：

```shell
export DP_Id="your_id"
export DP_Key="your_key"
```

然后就可以愉快地获取证书了：

```shell
./acme.sh  --issue  -d example.com  -d *.example.com  --dns dns_dp
```

不出意外的话，获取成功，证书会被放在`~/.acme.sh/`目录下。

## 安装证书

证书放在`~/.acme.sh/`目录下了，最好不要直接让Nginx/Apache读取这些证书文件，正确的方法是使用`--install-cert`命令将证书文件复制到Web Server对应目录下，一般是配置文件目录。我这里用的是Nginx：

```shell
./acme.sh --install-cert -d example.com \
--key-file       /etc/nginx/key.pem  \
--fullchain-file /etc/nginx/cert.pem \
--reloadcmd      "service nginx force-reload"
```

然后你需要手动修改Nginx的配置文件来安装证书以及key。

值得一提的是，acme.sh支持自动更新证书。在你执行`./acme.sh --install`的时候就已经自动建立了cron job，每天0:00点会自动检测所有证书。获取并安装证书的命令会被记录下来，证书在60天以后会自动更新，Nginx配置文件目录下的证书也会同步更新，Nginx会重启——你无需任何操作。

可以看到acme.sh获取Wildcard证书还是比较方便的。当然，acme.sh功能远不止如此，很多高级操作请看[acme.sh wiki](https://github.com/Neilpang/acme.sh/wiki/)。
