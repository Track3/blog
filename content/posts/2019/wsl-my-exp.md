---
title: "WSL之我的体验"
date: 2019-04-14T18:54:00+08:00
draft: false
toc: true
images:
tags:
  - WSL
  - Windows
---

以前，跟绝大多数Windows用户一样，我在日常使用电脑的过程中几乎从来不会碰命令行界面，后来我开始学习建网站，慢慢地就会了一些Linux命令。随着自己对Web开发的了解逐渐深入，我对终端的使用频率也越来越高。新的一年到了[^1]，又到了例行重装系统的时候，这次我决定试一下WSL（Windows Subsystem for Linux）。

## 前言

说到Windows的命令行环境，CMD是公认的难用，这个大家应该没什么意见吧？更可气的是这个命令提示符还很丑，默认发虚的字体，黑乎乎的背景、不支持真彩色……硬核的外表不知吓退了多少小白用户，即使已经升级到了Windows 10这样的版本，CMD依然是那么地不友好。难怪很多人都说Linux是在命令行上面做了个图形界面，Windows是在图形界面里顺便带了个命令行。这话一点也不假，在Linux中，无论你用的是哪一种图形界面，一般按<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+(<kbd>F2</kbd>,<kbd>F3</kbd>,<kbd>F4</kbd>,…) 都会切到对应的TTY：命令行的地位自然就不言而喻了。再看Windows，看名字就知道，窗口，那不就是图形界面嘛。Windows本来就是要革了命令行界面的命的，在早期是为了兼容DOS的一些操作，才搞了个cmd.exe。既然命令行界面根本就不是Windows的核心卖点，绝大多数用户不会接触这个东西，微软自然也就不会重视了。

不得不承认的是，在某些特定的场景下，输入命令比在图形界面里面点来点去更高效。考虑到与时俱进，微软推出了PowerShell。PowerShell很强大也足够现代化，但考虑到习惯问题，我始终下不了决心去学习它。可以说，我对命令行界面的使用习惯完全是折腾Linux服务器培养起来的，因此我更习惯类Unix系统的那一套操作。比如说，在查看目录中包含的文件以及文件夹时，我习惯用`ls`命令而不是`dir`，输入路径时，我也经常习惯性地按了`/`而不是`\`。我们当然没有必要去争论PowerShell与Linux shell孰优孰劣，他们都是解决问题的一种工具罢了，多一个工具，总归是好事。前面吐槽了半天Windows的命令行界面，其实无非就两点，而且得益于强大的社区支持，这些都有比较好的解决方案：

一是shell的问题，这其实就是习惯的问题。CMD就不谈了，PowerShell的确是不错，只要你愿意学习，能够习惯。习惯不了的，你可以试试Cygwin或者Git bash之类的，也一样能在Windows上用一些常用的Linux命令。

其二，就是外观的问题。Windows自带的终端模拟器属于比较底层的应用，就很难有多种外观自定义选项。不过这个其实也不是什么大问题，Windows平台上有很多第三方的终端模拟器可以使用，例如ConEmu以及一个不错的整合：Cmder，还有基于Electron的Hyper、Terminus等，最近我又发现一个很不错的基于微软流畅设计风格的UWP应用：[Fluent Terminal](https://github.com/felixse/FluentTerminal)。

我之前的搭配正是Git bash + Cmder，整体上差强人意（差强人意是“基本能让人满意”的意思），Git bash带的几个Linux命令挺就挺够我用的，Cmder说不上是最好看的终端模拟器，但是它的自定义选项丰富，拓展性极强，而且启动速度也挺快的。

那么问题来了，如果说Git bash + Cmder的组合就已经让我满意了，那为什么还要去折腾这个Linux子系统呢？对我个人而言，WSL最吸引我的就是Linux的包管理器了，就拿我最常用的发行版Debian来说吧，几乎就是你需要什么软件，`apt install`一下，一个命令就全部完成了，依赖什么的根本就不用你来操心。而Windows上安装软件基本上就是要用installer点击一波下一步，虽然也不麻烦，但是如果你有很多软件要装，这样就有点耗时间了。虽然Windows上有第三方的包管理器，Chocolatey或者Scoop，然而我都没用过，所以我不能做评价。WSL最黑科技的地方就是它可以直接运行大多数的Linux二进制程序，对，就是直接运行，配合包管理器，搭建各种开发环境就相当方便了。

同样是让你在Windows上执行Linux命令，对比Cygwin，WSL的实现更加底层。Cygwin中运行的各种Linux命令本质上是编译成Win32下的可执行程序，而WSL则是与Win32同级别的子系统，它可以直接与NT内核交互。说白了就相当于微软自己用Windows NT的API来实现了一遍Linux kernel，从一个Linux程序的角度来看，它就是在与一个假的Linux内核进行交互。由此可见，WSL就像一个翻译官，把Linux应用程序的POSIX系统调用翻译成Windows系统上的NT API调用，所以WSL究竟能有多大的本领或者说对Linux程序有多好的兼容性基本就取决于这个假内核能实现多少真内核的特性，就好比说这个翻译官对外语究竟有多好的掌握。理论上只要实现了足够多的系统调用翻译，那么WSL可以完全模拟成一个Linux内核。

运行一下`uname -a`就可以看到了，这个Linux子系统的内核版本号为`4.4.0-17763-Microsoft`，可见它是以Linux kernel 4.4.0为参照，而我运行的正是Win10 1809，也就是Build 17763。

```bash
$ uname -a
Linux DESKTOP-BH9C0Q3 4.4.0-17763-Microsoft #379-Microsoft Wed Mar 06 19:16:00 PST 2019 x86_64 GNU/Linux
```

## 使用

这篇文章就不详细说Linux子系统怎么启用了，反正也很简单。进“启用或关闭 Windows 功能”，然后在列表里勾上“适用于 Linux 的 Windows 子系统”重启即可。或者直接用带管理员权限的PowerShell运行：

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

启用WSL之后，打开应用商店搜索“wsl”，挑一个你喜欢的发行版安装即可。第一次运行需要设置用户名和密码，之后就可以开始愉快地折腾了。

下面就从我的实际经历出发来记录一下WSL中开发环境的搭建以及一些工具的配置。

### shell

WSL的前身就叫Bash on Windows，可见其重要目标之一就是提供一个类似Linux bash的shell体验。当然，除了默认的bash，你完全可以安装zsh或者fish使用。oh-my-zsh是一个很棒的`zsh`配置管理工具，它可以为你提供一个开箱即用的zsh环境，而且有很多主题插件可以使用。在WSL上运行oh-my-zsh跟在Linux或者Mac上并无太大区别，值得注意的是oh-my-zsh本身就比较慢，而WSL的I/O性能对比原生Windows又要差一点，所以shell的启动速度就是你要注意的了。在我的电脑上配置了oh-my-zsh后shell启动速度大概为两秒，我个人还是可以接受的。安装oh-my-zsh只需运行：

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

主题我推荐`ys`，非常轻量，而且没有特殊字符，因此兼容小字符集的字体而不会出现讨厌的框框。更换主题只需编辑`~/.zshrc`，更改`ZSH_THEME`这一个值即可，例如`ZSH_THEME="ys"`。

另外，再分享一个alias配置：

```bash
alias start="cmd.exe /c start"
```

只需输入`start .`，就能很方便地调用Windows资源管理器打开当前目录[^2]。当然你也可以用`explorer.exe .`命令实现同样的效果，但是前者输入更方便，而且能与CMD、PowerShell共用一套操作。

### 终端

前面被疯狂吐槽的Windows默认终端模拟器（也就是conhost.exe）在最近的这几次Win10更新中已经得到了不少改进，虽然还是被Linux和Mac终端甩开好几条街，但是稍微配置下还是勉强能用的。以下我的配置均是在Win10 19H1（Build 18362）中测试使用的，改版本目前仍在仍处于insider通道，预计5月份推送正式更新。

在终端标题栏上右击，可以看见菜单中有个“默认值”，还有个“属性”，打开它们你会发现其实两个的配置项是一模一样的，这两个设置窗口下配置的保存位置是不一样的。建议是优先改“默认值”，改完后保存重开终端就好了[^3]。

字体我用的是[更纱黑体（Sarasa Gothic）](https://github.com/be5invis/Sarasa-Gothic)，是一套支持中文的等宽字体。值得注意的是conhost对字体极为挑剔，要是你选的字体兼容性不够，当你在WSL下运行`nano`等命令的时候字体会变成新宋体。配色的话，微软出了一个官方工具[ColorTool.exe](https://github.com/Microsoft/console)，支持直接读取iTerm2的`.itermcolors`格式配置文件，可以让你方便地改终端配色。配色直接去[Iterm2-color-schemes](https://iterm2colorschemes.com/)打包下载即可，我用的是`Neutron`。配置了90%的透明度，再加上从Win10 19H1开始支持的全局暗色主题，最终效果如下：

![Win10 19H1系统默认终端](https://assets.xxxlbox.com/images/2019/img027.jpg)

说不上好看，但是最起码不像以前那样丑得刺痛双眼。如果说这个外观还有什么要亟待改进的，我认为就是内边距了，用CSS里的话说就是`padding`。Win10窗口没有像Win7、Win8那样较宽的边框，最终终端的文字是挨着边显示的，总让人觉得有点不舒服。但是总体上来说，新版Win10终端已经是能让我满意了（差强人意），毕竟性能真的无敌，启动贼快……

这里又想起一个可能你还不知道的小技巧，在Windows资源管理器中，按住<kbd>Shift</kbd>右击空白处，右键菜单里会出现“在此处打开 PowerShell 窗口”以及“在此处打开 Linux shell”两个选项。

说完了自带终端，再来聊一下第三方终端模拟器。[Fluent Terminal](https://github.com/felixse/FluentTerminal)绝对是我心目中Windows上最漂亮的终端，它应用了微软流畅设计风格，亚克力半透明效果真的很赞，我个人认为这就是未来Win10上终端该有的样子。

![Fluent Terminal](https://assets.xxxlbox.com/images/2019/img028.jpg)

但是目前Fluent Terminal并不是十分完善，有些小bug。它基于UWP构建，但是因闪退问题没能通过应用商店的测试而无法上架，所以安装起来相对要麻烦一点。你需要导入作者的证书，然后开启Win10旁加载模式，不过作者有提供一键安装脚本并且支持从[Chocolatey](https://chocolatey.org/)安装。除了Fluent Terminal之外，[Terminus](https://github.com/Eugeny/terminus)也非常好用，是我现在的主力终端模拟器，ssh模块用起来很方便。

### Git

在WSL上安装使用git非常简单，但是麻烦的是如何让Windows桌面程序调用WSL里的git呢，难道还要再装一个Git for Windows？还好，早就有人意识到这个问题而且有个不错的解决方案——[wslgit](https://github.com/andy-5/wslgit)。它是一个能把Windows形式的文件路径（例如`C:\Foo\Bar`）与Linux的路径（对应的`/mnt/c/Foo/Bar`）进行互相转换的一个可执行程序，就像代理人一样。wslgit.exe的使用非常简单，下载它，将他重命名为`git.exe`，让后把他加到Path里就行了。像我的习惯的就是C盘根目录建一个`bin`文件夹，然后编辑系统环境变量，选中`Path`这一变量，编辑，添加一行`C:\bin`，这样一来，将任何exe可执行文件丢到`C:\bin`目录下，都可以实现全局的调用。最终效果就是你可以在PowerShell或CMD中直接运行`git`命令了。

![](https://assets.xxxlbox.com/images/2019/img029.jpg)

然而这还不够，有些桌面程序可能还需要单独配置git的可执行路径，比如VS Code。在VS Code配置文件中需加入一行：

```json
"git.path": "C:\\bin\\git.exe"
```

另外，为了提升wslgit的性能，你可以添加一个环境变量`WSLGIT_USE_INTERACTIVE_SHELL`，设其值为`0`或`false`。这样可以使wslgit运行在非交互模式中，在被调用时无需加载`.bashrc`或`.zshrc`等用户配置文件。

### SSH

现如今Win10已经内置了OpenSSH，我们终于不用像以前那样连个ssh还要装一个putty。很显然，WSL里也有一个ssh客户端，那我们怎么让两边共享密钥以及各种配置呢？其实最容易想到办法就是用`ls -s`命令创建软连接了，将Windows下的`C:\Users\you_name\.ssh`（也就是`/mnt/c/Users/your_name/.ssh`）连接到`~/.ssh`即可。这样可以在Windows这一侧下统一管理ssh配置。首先确保PowerShell下能正常连接ssh，并且WSL中的~/.ssh是不存在的，然后在wsl中输入`ln -s /mnt/c/Users/your_name/.ssh/id_rsa ~/.ssh/id_rsa`即可。由于ssh对密钥文件的权限有严格要求，而默认情况下Win的文件系统挂载到Linux时会被设为777权限，显然这个权限对密钥文件来说实在是太大了，ssh会阻止密钥的使用。为了解决这个问题，好在Win10 Build 17093及以后的版本已经支持了WSL启动选项，就是你可以在`/etc/wsl.conf`里自定义wsl启动时的一些配置。我们可以在`wsl.conf`中加入这个：

```ini
[automount]
options = "metadata"
```

这样WSL就能在挂载时写入metadata，问题就解决了，文档在这里：<https://docs.microsoft.com/en-us/windows/wsl/wsl-config#set-wsl-launch-settings>。

值得注意的是，如果你跟我一样使用了`.ssh/config`文件来设置alias，单独指定密钥文件等，那么以上方法就行不通了，ssh会提示你`.ssh/config`文件权限有问题。据说[^4]是`.ssh/config`只允许读写权限，因此无法存在于Win的文件系统中。所以一个解决办法就是不要链接整个`.ssh`文件夹，而是手动链接`.ssh`下的所有非`config`文件，然后在WSL下手动编辑`config`文件。

### Node

WSL对node.js的兼容还是比较好的，安装起来就跟在普通Linux机器上差不多。你可以进行传统的单版本安装，也可以用nvm来方便管理node的版本。你只需要注意nvm会在你的shell配置文件里加入相关环境变量，会比较明显地拖慢shell的启动速度，至少我自己是这样的。当时我的zsh启动很慢，还以为是oh-my-zsh插件装多了，最后网上搜索了半天才发现是nvm的锅。我现在一直用着Current版的node，也没出什么问题，可能因为是比较轻度的使用吧。

### Docker

Docker利用了Linux kernel的一些比较高端的特性，这些特性WSL还未全部实现，所以现阶段WSL是无法直接运行docker的，即无法启动docker的守护进程。docker的架构是分三个部分的，即Client、API以及Server（守护进程），服务端和客户端无须安装到一个地方。WSL运行不了服务端，但是跑客户端是可以的，服务端就用Docker for Windows好了。在Windows与Linux分别装上对应的docker，然后在Docker for Windows的设置中开启"Expose daemon on tcp://localhost:2375 without TLS"选项，最后在WSL中编辑`~/.bashrc`或`~/.zshrc`，加入`DOCKER_HOST=tcp://127.0.0.1:2375`即可。现在WSL里能正常连接到Win上的Docker for Windows，可以进行各种镜像、容器的管理了。

另外，WSL默认把Windows的文件系统挂载到`/mnt/`下，比如`/mnt/c/Foo/Bar`，而Docker for Windows期望的地址是`/c/Foo/Bar`，所以容器的文件夹挂载就用不了了。还好在`/etc/wsl.conf`中能指定自动挂载的位置，这里只需在`wsl.conf`的`[automount]`组下加上`root = /`即可。值得注意的是，前面我们用的wslgit的期望挂载位置是`/mnt/`，代码里是写死了的，好在作者应大家的要求，单独编译了一份挂载点为`/`的版本，使用这个版本就行了。

### 其他问题

目前就想到一个，hosts文件的共享。Windows的hosts文件位于`C:\Windows\System32\drivers\etc\hosts`，Linux的位于`/etc/hosts`，默认情况下，WSL会自动用Windows的hosts文件生成Linux的hosts，所以如果你要改WSL中的hosts文件，可以直接改Win下的，让后注销重登即可。如果你想让Win与Linux的hosts不同，你可以编辑`/ect/wsl.conf`加上这些：

```ini
[network]
generateHosts = false
```

另外，听说有人在WSL里跑桌面应用……

## 总结

说实话，我真没想到WSL这一侧竟然有这么完整的Linux体验，而且Linux子系统与Windows的互通性竟然是这么的好。

在Windows目录下可以直接启动Linux shell，PowerShell或CMD可以直接通过`wsl xxx`运行Linux命令，而Linux下可以直接执行安装在Windows中的程序，Path还是共享的，更可怕的是Windows与Linux的命令还能混着用，比如这样直接把文件内容复制到Windows剪贴板中：`cat ~/.zshrc | clip.exe`……

诚然，WSL还有许多不完善的地方，比如I/O性能不够理想，直观感受就是`npm install`的时候有点慢，更重要的是Windows上的第三方软件支持度还不够，有时候无法避免地要在Win与Linux两侧都装上某些软件。不过我真的很期待WSL的进一步完善，什么时候能直接跑docker那就真的nb了。我的期待总结起来就是：

* 完善内核
* 提高性能
* 第三方应用支持

## 相关参考

我在网上搜索与WSL相关的一些问题时发现了很多写得很不错的文章或是教程，这篇文章也有很多是参考他们的。我在前文中有许多写得不全面的，大家都可以去这几个地方看看：

* [WSL 配置指北：打造 Windows 最强命令行](https://blessing.studio/wsl-guide/)
* [Dev on Windows with WSL (dowww)](https://spencerwoo.com/dowww/)


[^1]: 这篇文章起草于2019年1月5日。
[^2]: 来源于https://stackoverflow.com/questions/44245721/launching-explorer-from-wsl。
[^3]:以我自己的亲身体验来看，在19H1以前，改“默认值”没用，保存重开还是原样，只能改“属性”才行。也不清楚这是真的有bug还是我的打开方式不对。
[^4]: https://florianbrinkmann.com/en/3436/ssh-key-and-the-windows-subsystem-for-linux/#comment-3109