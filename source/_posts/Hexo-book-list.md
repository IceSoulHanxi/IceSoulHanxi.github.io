---
title: Hexo实现生成PDF电子书列表并在线预览
date: 2023-06-29 12:00:00
tags:
  - Hexo
  - 前端
  - JavaScript
  - PDF.js
---
## 前因
最近收集了一些编程相关的PDF电子书, 在电脑上使用office或者浏览器查看体验尚可

但是日常非常多碎片时间只能使用手机或平板等移动设备, 收集这些电子书的目的一个是为了学习, 另一个则是为了填补这些碎片时间, 不至于外出闲时只抱着几个QQ群无意义闲聊, 所以说针对移动设备的支持就是必要的
<!-- more -->
首先, 想着在电脑上开一个文件服务器直接通过手机的浏览器访问就能解决问题, 于是就拉了个Nginx的Docker服务把电子书内容挂载进去, 在电脑上使用Edge浏览器测试是没有问题的, 但是到手机的Edge浏览器上一试, 本来想的是直接预览内容结果变成了下载文件, 下载完文件再通过手机上的WPS打开预览, 并且由于没有公网IPv4, 在外出时就只能使用zerotier组网再连接电脑上的文件服务器, 过程就变得非常繁琐

在这么凑合用了2天后, 觉得确实太麻烦了, 同时多下几个电子书后也非常难管理, 导致在看内容之前就已经开始打退堂鼓了, 所以必须寻求更好的解决方案, 基于主要问题没有公网IPv4不方便直接访问, 目前手里也没有能一直保持在线的公网服务器, 为了这点万年不变的静态内容去买个服务器, 我也没这闲钱, 于是打算再再再次复活使用Hexo挂载到github pages服务的博客

Hexo怎么使用、如何部署到pages服务由于之前几次反反复复的心血来潮已经烂熟于心, 但是现在还是遇到了一个问题, 这些电子书应该怎么管理, 手动在文件里建列表虽然现在可行, 但是以后有了更多内容怎么办, 所以说开始在网上查找有没有像Nginx文件列表那样的插件, 在查找一番后没找到满意的内容后, 决定开坑自己写

## 进入正题
Hexo是一个通过将markdown、ejs等内容通过编译渲染成纯静态内容的博客系统, 要实现预定的目标就只能在渲染时做处理, 在查看[官方文档](https://hexo.io/zh-cn/docs/plugins)后, 可通过在`scripts`文件夹下加入js文件实现扩展功能

在尝试文档中的各种API折腾大半天后, 选择使用[标签插件](https://hexo.io/zh-cn/api/tag)功能解决了需求, 该功能是在渲染过程中扫描标签并通过预定的函数直接生成html嵌入, 对多模板与多模板引擎的兼容性较好

### PDF.js引入
文件列表的管理解决了, 但还是只能下载查看, 于是引入了[PDF.js](https://github.com/mozilla/pdf.js)来实现移动设备在线查看

由于目前我选择的模板是[NexT](https://github.com/theme-next/hexo-theme-next), 其已经提供了[PDF.js的成品](https://github.com/next-theme/theme-next-pdf), 则照其说明引入

#### 步骤1. 打开Hexo文件夹
切换到Hexo根目录内, 里面必须要有`source`文件夹
```shell
$ cd hexo-site
$ ls
_config.next.yml  db.json           package-lock.json scaffolds         themes
_config.yml       node_modules      package.json      source
```

#### 步骤2. 下载模块
安装模块到`source/lib`文件夹下
```shell
$ git clone https://github.com/next-theme/theme-next-pdf source/lib/pdf
```

#### 步骤3. 设置
在Hexo的配置文件`_config.yml`中找到`skip_render`项并按下面修改
```yaml
skip_render:
  - lib/**/*    # PDF.js模块目录
  - books/**/*  # 存放PDF电子书的目录
```

### 如何使用
将[脚本文件](https://github.com/IceSoulHanxi/IceSoulHanxi.github.io/raw/master/scripts/index.js)放入`scripts`文件夹下
将PDF电子书放入`source/books`文件夹下
在需要嵌入所有电子书文件列表的页面位置插入以下内容
```
{% books %}
```
如果需要分类或者分目录可以将目录层级写在`books`标签后面
例如只显示`source/books/java/lock`中的文件
```
{% books java lock %}
```
然后只需要按照Hexo正常部署流程即可查看文件列表