---
title: 修改用户目录拯救你的C盘空间
date: 2020-02-02 12:00:00
tags:
  - Windows
  - 折腾
---
Windows LTSC的使用了一段时间后，发现系统盘的容量已经变红了

240G的固态，给系统盘分配了70G，安装完系统差不多占用20G

这就很是奇怪，自己也没有在系统盘装过什么应用，怎么说应该也够用了

打开系统盘一看，发现用户目录占用了30G的空间，里头充满了各种应用的数据与缓存

虽然手动删除没啥用的数据也行，但是看着1909更新的那些新功能很是手痒

于是就直接格盘装1909!

<!--more-->

## 查找解决方法

经过一番百度，发现用户目录是根据环境变量`%USERPROFILE%`来控制的

```cmd
C:\\> echo %USERPROFILE%
C:\\Users\\寒兮
```

这个`%USERPROFILE%`是根据系统注册表来获取的
`计算机\\HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList`
根据网上所说先安装系统，然后在这个目录下找你当前用户UUID，再修改里面的`ProfileImagePath`
在我自己的测试中发现这样会导致问题，比如无法打开Windows菜单
我自己的解决方法是在安装完系统后直接修改`ProfileList`里面的`ProfilesDirectory`
`ProfilesDirectory`的默认值是`%SystemDrive%\\Users`，修改为你想修改的位置再新建用户就行了

![注册表](/images/Modify-windows-user-dir/ProfileList.png)

## 开始折腾

那么，如何在Windows首次启动创建新用户之前修改这个注册表呢？
经过我的各种尝试，还是得使用WinPE来修改

1. 安装完系统后，在PE中`Win`+`R`键输入`regedit`打开PE的本地注册表
2. 点击`计算机\\HKEY_LOCAL_MACHINE`然后点击菜单`文件`中的`加载配置单元`
3. 找到`C:\\Windows\\System32\\config`下面的`SOFTWARE`文件
4. 打开`SOFTWARE`文件，提示命名，随便设置一个名称
5. 回到`计算机\\HKEY_LOCAL_MACHINE`中找到你刚刚设置的名称，修改`ProfilesDirectory`
   `计算机\\HKEY_LOCAL_MACHINE\\刚刚设置的名称\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList`
6. 修改完后点击`计算机\\HKEY_LOCAL_MACHINE\\刚刚设置的名称`然后点击菜单`文件`中的`卸载配置单元`
7. 重启电脑，新建用户

然后用户目录就从默认的`C:\\User\\用户名`改成了`ProfilesDirectory\\用户名`了

