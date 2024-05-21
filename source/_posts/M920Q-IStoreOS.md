---
title: 联想M920Q准系统自组家庭网关
date: 2024-05-17 12:00:00
tags:
 - 家庭组网
 - OpenWRT
 - iStoreOs
 - M920Q
 - 软路由
 - IPTV
 - VLAN
---
最近接到了个活，需要改善家庭网络环境并科学上网收看国外体育频道
在我实地考察后确认现有以下设备
<!--more-->

## 现有设备
1. 光猫 TEWA-1000E
2. 客厅路由 TPLink-WTC181电信定制款
3. 电信IPTV电视盒
4. 客厅电视盒
5. 书房路由 TPLink-WTC181电信定制款
6. 主卧路由 TPLink-WTC181电信定制款
7. 主卧电视盒
8. 地下室路由 TPLink-XDR1520
9. 弱电箱中未知品牌千兆傻瓜交换机
10. 监控系统及其若干摄像头
11. 老款IMac一体机
12. 若干智能家居等

## 前期规划
原设备由光猫拨号且作为主路由，3个电信定制路由器作为AP提供WIFI
其中客厅的路由器开启了IPTV功能，将VLAN45直通给电信IPTV电视盒
而光猫只有3个网络口，其余设备如监控与地下室路由经电信工作人员之手后只能停用
现需要将上述设备全部接入网络，且保留原有设备正常工作
![拓扑](/images/M920Q-iStoreOS/Layout.svg)

## 设备准备
之前有看到过用联想小主机准系统+PCIE网卡的解决方案
于是打算尝试一波
在了解到如果需要使用PCIE网卡则需要在M720Q/M920Q/M920X中进行选择
这3款均为LGA1151机器其中M920X支持显卡、PCIE位有机箱散热开孔且背面有双M.2硬盘槽位(其中一个为Sata)
而M720Q使用的B360芯片组,M920Q与M920X都使用的Q370芯片组
这3款准系统均默认支持8-9代U

在撕逼鱼逛了一圈后找到了一家299卖M920Q准系统的朋友随即下单
本来打算极致性价比选只要30就能包邮的G4560，但是为了减少翻车概率最终选择了55包邮属于9代的G5420T
硬盘则由于容量需求不大，选择了18块包邮的0通电全新Intel 16G傲腾

### 硬件配置
|硬件名|价格|渠道|
|----|----|----|
|联想M920Q准系统|299|撕逼鱼|
|Pcie×8 Riser卡|30|淘宝|
|G5420T 2c4t 3.2GHz|55|淘宝|
|4G DDR4 2666MHz|35|拼夕夕|
|Intel傲腾M10 16GB|18|拼夕夕|
|90w联想方口适配器|27|拼夕夕|
|RTL8111F四口千兆网卡|96|拼夕夕|
|总价|560|-|

![Hardwares](/images/M920Q-iStoreOS/Hardwares.png)

## 系统固件
最开始打算直接自编译OpenWRT或者Lede
在之前有逛过KoolCenter,而该论坛管理推出了叫iStoreOS的改进固件
iStoreOS基本满足了所有所需功能,并且自带了RTL8111F驱动和Docker支持等扩展
于是选择iStoreOS最新版本
iStoreOS官网地址: [https://www.istoreos.com/](https://www.istoreos.com/)

### 固件安装
安装步骤可以参考官网教程
官方教程地址: [https://doc.linkease.com/zh/guide/istoreos/install_x86.html](https://doc.linkease.com/zh/guide/istoreos/install_x86.html)
本人是直接使用了另外一个名为[Ventoy](https://ventoy.net)的多功能引导工具进行安装
直接下载固件后得到比如`xxx20221123xx-xxx.img.gz`的文件
将其解压后的固件内容放置到安装有Ventoy的U盘中系统文件夹内即可

接下来是直接将该U盘插入机器进行安装
通电开机后快速短按F1进入bios
由于是需要作为路由使用，在断电重连后也应该自动开机，则将bios中Power的`Restore AC Power Loss`设置为`Power On`
接下来找到储存中选择U盘启动，进入到Ventoy后直接选择固件启动

登录U盘系统，登录成功之后，输入：`quickstart` (或者 qu + tab 自动补全)
选择`Install X86`，一直按确定，就行了。具体如下图所示：
![Install](/images/M920Q-iStoreOS/Install.png)

### 修改软件源
拔掉U盘后直接按开关启动系统，进入系统后可以输入`quickstart`
选择`Show Interfaces`来查看当前设备上级分配IP进行访问
正常情况下，系统会将板载网口设置为eth0，作为WAN口使用，而PCIE网口为eth1-4，作为LAN口使用
也可以直接选择将其他电脑接入机器的PCIE网卡口直接访问`192.168.100.1`打开网页面板
固件默认用户为`root`默认密码为`password`，可在`系统`-`管理权`内进行更改

先修改软件源地址方便直接从国内下载
在`系统`-`杂项设置`中IPK镜像服务器选择一个国内地址即可

## 软路由拨号
原本PPPoE拨号是有光猫进行，例如电信可以拨打10000号转人工客服，要求转成桥接模式
如果不知道PPPoE拨号的宽带密码，则需要继续向客服提出重置宽带密码要求
吐槽一句，修改宽带密码的时候不能开免提，要求还比较多，电信为何不直接生成一个随机密码

## 科学上网
iStoreOS的源与应用商店内均没有科学上网插件
不过Github上有第三方做兼容，绝大部分科学上网插件都有做提供
仓库地址: [https://github.com/AUK9527/Are-u-ok/tree/main/x86](https://github.com/AUK9527/Are-u-ok/tree/main/x86)

### 安装
我选择的是PassWall2
安装方式参考链接
下载Passwall2.run文件后直接在iStore应用商店的手动安装中`选择或拖放文件`即可

### 配置
安装完成后在侧边栏中的服务内找到PassWall2即可看到网页面板
由于使用的本人自建服务节点进行代理，所以只有单个节点，如需使用订阅可以参考[该站点](https://passwall2.org/)
先找到节点的链接再在顶部栏的节点列表中点击`通过链接添加节点`即可
回到基本设置中将`主开关`打开，节点设置为`Xray分流: [分流总节点]`
将下方的红色`默认`选项改为刚刚添加的节点
打开下方的`路由器本机代理`
根据是否所有设备全局代理自行判断是否需要开关`客户端代理`
如果不需要所有设备全局代理则可以在顶栏中的访问控制中添加需要全局代理的设备
![Passwall2](/images/M920Q-iStoreOS/Passwall2.png)

## DNS优化
由于总所周知的特殊原因国内获取某些国外域名的DNS解析时会解析失败并且目前的广告数量惊人
于是引入AdGuard Home、SmartDNS与PassWall2进行搭配使用

### 安装
在`系统`-`软件包`内先点击`更新列表`等待更新
更新完成后在左边的`过滤器`中填入`AdGuardHome`，选择下方的软件的安装
SmartDNS由于有Luci面板，`过滤器`填入`luci-i18n-smartdns-zh-cn`进行安装安装

### 配置AdguardHome
AdguardHome由于是安装的未携带Luci面板的版本，所以需要直接访问后台进行手动安装
访问AdguardHome后台: [http://192.168.100.1:3000](http://192.168.100.1:3000)
进入安装向导，点击`开始配置`
网页端口可保持为3000，而DNS端口建议设置为其他端口，如5555
设置管理员账号，建议与iStoreOS的root密码一致以免忘记
基础配置完成后点击`打开仪表盘`
在`上游DNS服务器`中填入信任的DNS服务器，本人使用如下内容
```
https://1.1.1.1/dns-query
https://8.8.8.8/dns-query
https://dns.alidns.com/dns-query
https://doh.pub/dns-query
https://223.6.6.6/dns-query
```
由于使用的都是DoH，所以可以开启下方的`并行请求`以加快DNS解析
再就是`Bootstrap DNS 服务器`地址，本人使用如下内容
```
119.29.29.29
223.5.5.5
240c::6666
240c::6644
```
配置完成后点击`测试上游DNS`然后点击`应用`则完成了AdguardHome的安装与配置
其他的详细配置可以参考Adguard官网: [https://adguard.info/zh_cn/adguard-home/overview.html](https://adguard.info/zh_cn/adguard-home/overview.html)

### 配置SmartDNS
在`服务`-`SmartDNS`中打开Luci面板，在常规设置中勾选`启用`
勾选`自动设置Dnsmasq`，`端口`设置为53，并将`缓存大小`设置为5000000
再在下方的`上游服务器`中添加刚刚配置好的AdguardHome地址，如127.0.0.1:5555
配置完成后记得翻页到最下方点击`保存并应用`即可完成SmartDNS的安装与配置

### 配置PassWall2
在`服务`-`PassWall2`-`基本设置`-`DNS`中
将`远程DNS协议`设置为UDP，`远程DNS`设置为127.0.0.1，`远程DNS出站`设置为直连即可完成配置
配置完成后点击`保存并应用`

## 网络优化
由于直接使用该X86软路由作为主路由接替光猫进行拨号，则保证网络稳定也是重中之重

### 网卡驱动
由于PCIE网卡RTL8111F默认使用的r8169驱动，而该驱动不是最优适配版本
所以需要将网卡驱动更换为最优适配的r8168驱动
在`系统`-`杂项设置`-`驱动`中选择`Realtek r8168 驱动`即可
配置完成后点击`保存并应用`

### 智能队列
为了避免其中一个设备进行大流量下载导致其他设备无法正常使用网络
原本是开启TurboAcc，在`网络`-`防火墙`-`路由/NAT分载`-`软件流量分载`下看到了
> 实验特性。与 QoS/SQM 不完全兼容。

了解到了SQM智能队列[https://openwrt.org/docs/guide-user/network/traffic-shaping/sqm](https://openwrt.org/docs/guide-user/network/traffic-shaping/sqm)
智能队列是通过流量特征来进行缓冲区与网络队列调度，相对于结合了AQM与QOS进行网络调度、流量整形

在`系统`-`软件包`内先点击`更新列表`等待更新
完成后在左边的`过滤器`中填入`luci-i18n-sqm-zh-cn`，选择下方的软件的安装

安装完成后在`网络`-`SQM队列管理`内勾选`启用此 SQM 实例`
`接口名称`则选择你的`wan`所在网口，例如`eth0`
下载与上传速度填写实际网速的90%，如不知道实际网速则可进行测速，如使用[https://www.speedtest.cn/](https://www.speedtest.cn/)
例子：上传速度30Mbps则填写27000，下载速度1000Mbps则填写900000
配置完成后点击`保存并应用`
而`软件流量分载`则看情况自行判断是否开启（该设备为了保证网络稳定性还是没有开启）

### BBR流控
如果有自建科学上网工具或者服务器网络优化经验，那对BBR一定不陌生
BBR流控是Google推出的新一代TCP拥塞控制算法，和智能队列有一定的功能重合
而BBR更注重TCP流的稳定性，智能队列则是着眼全局进行宏观流控
BBR具体的效果如何也没有测试，但是既然有就装着试试呗
在`系统`-`软件包`内先点击`更新列表`等待更新，然后在过滤器中搜索`kmod-tcp-bbr`点击安装即可
如果想要验证是否安装成功，可以在`服务`-`终端`中填入账号密码登录后执行`lsmod | grep bbr`
如果安装成功应该会输出类似如下内容
```shell
root@iStoreOS:~# lsmod | grep bbr
tcp_bbr                24576 73 
```

## IPTV配置
原本的设置中IPTV是光猫直接通过VLAN走网口1直通到客厅中开启IPTV模式的WTC181路由器
而现在中间加了一层iStoreOS，则需要把VLAN继续直通到客厅的路由器

### 光猫配置
如果光猫没有配置网络和IPTV通过VLAN实现单网口复用
得先获取到光猫的超级管理员账号密码，可以尝试联系电信装维师傅获取（不是10000号客服）
如果行不通的，并且刚好也是TEWA-1000E等类似设备则可以参考一下如下步骤自给自足

#### 获取超级管理员密码
参考[https://www.luyouwang.net/9134.html](https://www.luyouwang.net/9134.html)
首先，找到光猫，拿手机拍下背面信息
并且准备一个使用FAT16/32格式的U盘，也可以使用Ventoy启动盘，将U盘插入光猫后的USB口
然后，进入光猫的后台，在浏览器中直接访问[http://192.168.1.1](http://192.168.1.1)
使用手机拍下了的光猫背面信息登录，检查U盘是否被正确识别
其次，在浏览器中打开[http://192.168.1.1:8080](http://192.168.1.1:8080)
继续使用手机拍下了的光猫背面信息登录
点击`管理`-`设备管理`后在浏览器中按下F12打开开发者面板
在开发者面板头部栏中找到`元素`或`Elements`打开，使用Ctrl+F搜索`set2_sessionKey`或者`set3_sessionKey`
`set3_sessionKey`的后面会带上下划线与数字，将其包含`set3_sessionKey`完整复制下来拼入下面链接
```url
http://192.168.1.1:8080/usbbackup.cmd?action=backupeble&set3_sessionKey=
```
例子: `http://192.168.1.1:8080/usbbackup.cmd?action=backupeble&set3_sessionKey=set3_sessionKey_123`
打开链接后的页面中包含`USB备份配置`，如果`备份配置`被禁用
请在浏览器中按下F12打开开发者面板找到`控制台`或`Console`将如下内容粘贴进去回车执行
```js
usbsubarea = {
    selectedIndex: 0,
    value: "never_mind...",
    options: [{ value: "usb1_1" }]
};
btnApply();
```
此时U盘的Fat16/32分区中会有一个名为`e8_Config_Backup/ctce8_TEWA-1000E.cfg`的文件
如果像我一样使用的Ventoy启动盘，则需要下载一个例如DiskGenius的工具，在名为`VTOYEFI`的分区中找到这个文件
通过鼠标右键，使用`复制到指定文件夹`将其提取出来
![DiskGenius](/images/M920Q-iStoreOS/DiskGenius.png)
再打开配置解码网站[https://www.luyouwang.net/xor/](https://www.luyouwang.net/xor/)
选择导出的`e8_Config_Backup/ctce8_TEWA-1000E.cfg`文件，点击`转换`
![Upload](/images/M920Q-iStoreOS/Upload.png)
再按照解码网站描述用法使用Ctrl+F搜索`TeleComAccount`或`telecomadmin`
```xml
      <X_CT-COM_TeleComAccount>
        <Password>1kqgaxK8wz</Password>
      </X_CT-COM_TeleComAccount>
```
`1kqgaxK8wz`既为超级管理员密码，电信超级管理员账号默认为`telecomadmin`
注意，该密码仅在本次开机后有效，重启光猫后失效，失效后需要重复上述步骤

#### IPTV与互联网单网口复用
参考[https://zhuanlan.zhihu.com/p/109457053](https://zhuanlan.zhihu.com/p/109457053)
浏览器打开[http://192.168.1.1:8080](http://192.168.1.1:8080)登录光猫后台
使用通过之前获取的超级管理员账号密码
打开`网络`-`网络设置`-`网络连接`
首先`连接名称`中找到`2_INTERNERT_B_VID`取消全部LAN端口绑定，如下图所示
![ModemInternet](/images/M920Q-iStoreOS/ModemInternet.png)
其次找到`连接名称`为`3_Other_B_VID_45`的连接，同样取消所有LAN端口绑定，如下图所示
![ModemIPTV](/images/M920Q-iStoreOS/ModemIPTV.png)

然后打开`网络`-`网络设置`-`VLAN绑定`
在`用户侧端口`选择当前连接软路由的网口，`用户侧VLAN`填写IPTV VLAN Id当前是45
`绑定WAN连接名称`选择`3_Other_B_VID_45`，点击保存，如下图所示
![ModemVLAN](/images/M920Q-iStoreOS/ModemVLAN.png)

至此光猫端配置结束

### 软路由配置
打开软路由后台中的`网络`-`接口`-`设备`，点击页面最下方的`添加设备配置`
添加一个`设备类型`为VLAN(802.1q)的设备，现有设备选择WAN口所在的适配器(一般为eth0)
再添加另外一个VLAN(802.1q)设备，该设备选择运营商IPTV电视盒所在的适配器下，该网络使用的eth1

还需要添加一个`设备类型`为网桥的设备，把刚刚创建的2个VLAN设备添加到网桥中
需要将`高级设置中的`的`启用混杂模式`、`IGMP嗅探`、`启用多播支持`等功能禁用
![RouterNetDevice](/images/M920Q-iStoreOS/RouterNetDevice.png)

回到`网络`-`接口`-`接口`，找到页面最下方的`添加新接口`
需要添加一个`不配置协议`且设备使用刚刚创建的网桥的接口
![RouterInterface](/images/M920Q-iStoreOS/RouterInterface.png)

最后打开`网络`-`防火墙`-`常规设置`-`区域`中添加一个区域
入站数据、出站数据、转发皆设置为`接受`，关闭IP伪装与MSS钳制，将刚刚创建的接口添加至涵盖的网络中

至此软路由端配置结束

### AP路由配置
使用的TPLink电信定制路由，型号为WTC181，该路由自带IPTV VLAN配置
进入后台后点击`路由设置`-`IPTV设置`
给`IPTV模式`选择`开启VLAN`，`VLAN ID`从光猫设置中获取，湖南电信为45，最后选择需要绑定的网口即可
![TPLinkIPTV](/images/M920Q-iStoreOS/TPLinkIPTV.png)

配置完毕后将运营商IPTV电视盒通过有线连接至绑定的网口，等待一会后网络灯从红灯转绿，成功IPTV配置完成

## 自定义视频源
为了观看国外运动节目直播
给几个电视盒子安装了TVBox
TVBox地址: [https://github.com/o0HalfLife0o/TVBoxOSC](https://github.com/o0HalfLife0o/TVBoxOSC)
TVBox分为数据源与直播源，数据源使用的[https://www.饭太硬.top/](https://www.xn--sss604efuw.top/)，使用体验还不错
直播源就想对一般了，尝试了[IPTV-org](https://github.com/iptv-org/iptv)、[Epg.pw](https://epg.pw/)等源
但是单个源使用的体验不是太友好，一个是非相关直播内容太多，二是源的失效率不低

### xTeVe
在查看iStore商店的时候看到了一个插件，[xTeVe](https://github.com/xteve-project/xTeVe)
xTeVe是一个M3U源代理与管理工具，可以配置多个直播源，并且支持M3U源的筛选
#### 安装与配置
直接从iStore商店安装即可
安装后在`服务`-`Xteve`中点击`启用XTEVE`
然后访问[http://192.168.100.1:34400/web](http://192.168.100.1:34400/web)进入后台配置
映入眼帘的是"Number of tuners"是指能够同时让几个设备看直播，我这里配置为10
![XteveInstallStart](/images/M920Q-iStoreOS/XteveInstallStart.png)
然后是"EPG Source"，是指节目信息源的格式，这里直接按默认即可
![XteveInstall](/images/M920Q-iStoreOS/XteveInstall.png)
再是"M3U Playlist"，需要先填一个直播源，后续可以添加多个，我这里先使用的IPTV-org的CCTV源
[https://mirror.ghproxy.com/https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u](https://mirror.ghproxy.com/https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u)
![XteveInstallM3U](/images/M920Q-iStoreOS/XteveInstallM3U.png)
最后是"XMLTV File"，指节目信息源，可以在[https://epg.pw/xmltv.html](https://epg.pw/xmltv.html)下自行挑选
![XteveInstallXMLTV](/images/M920Q-iStoreOS/XteveInstallXMLTV.png)

xTeVe的首页内容如下，在Playlist中添加M3U直播源，在XMLTV添加节目信息源
在Filter中可以筛选直播源，而Mapping中可以对直播源进行详细信息调整
![XteveMain](/images/M920Q-iStoreOS/XteveMain.png)

需要注意的是某些直播源没有节目信息，在最终的数输出节目源中不会显示
可以在Mapping中点击`Bulk Edit`进行批量选择，在勾选后直播源后双击任意直播源名称打开对话框
在对话框最下方有`XMLTV File`与`XMLTV Channel`选项，`XMLTV File`选择xTeVe Dummy
`XMLTV Channel`则任意选择，点击`Done`，保存后会自动启用所有被批量选中的直播源
![XteveMapping](/images/M920Q-iStoreOS/XteveMapping.png)

最后将xTeVe顶栏中的M3U URL填入TVBox配置中的直播源则完成了配置

### Pixman/4GTV
[四季線上 4GTV 免费播放全部频道 第三弹(需科学上网)](https://pixman.io/topics/13)
偶然发现的项目，可以解锁部分港澳台节目
在`服务`-`终端`中执行`docker run --name=4gtv -d -p 5020:5020 pixman/4gtv`
```shell
root@iStoreOS:~# docker run --name=4gtv -d -p 5020:5020 pixman/4gtv
Unable to find image 'pixman/4gtv:latest' locally
latest: Pulling from pixman/4gtv
4abcf2066143: Pull complete
c3cdf40b8bda: Pull complete
c82053526614: Pull complete
b4a226bd191c: Pull complete
7a544be84aa7: Pull complete
ea4406c13dfc: Pull complete
27d0786fe35c: Pull complete
dd59c4d714cb: Pull complete
9d269e740cf9: Pull complete
e8d864a8fcf0: Pull complete
Digest: sha256:3e2dabb482a2d4370bc9fe089a7833b6413b145407a337c739a60f1aae1c291d
Status: Downloaded newer image for pixman/4gtv:latest
6ea304b4da7dc8b0392db5160ebf5e3bfe9067bd053c14ea08f8e3ecba6d969a
```
后续将[http://192.168.100.1:5020/4gtv.m3u](http://192.168.100.1:5020/4gtv.m3u)添加至xTeVe的Playlist
再在xTeVe的Filter添加新闻资讯、体育等分组，最后按照xTeVe的Mapping配置直播源即可