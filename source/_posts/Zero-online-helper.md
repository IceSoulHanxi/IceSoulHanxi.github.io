---
title: 基于OpenCV与Tesserect的2.5D游戏挂机脚本
date: 2023-09-23 12:00:00
tags:
 - C#
 - OpenCV
 - Tesserect
 - OCR
 - 游戏脚本
---
最近在技术群讨论的时候, 回想起了10年前玩过的一款2.5D倾斜视角机甲风类"传奇"——机战
发现游戏依然在运营, 并且官网公告竟然有超过万人预览, 于是想着回坑耍一耍
在玩了几天后, 游戏内容开始变得重复, 主要内容就是通过一些简单低调的任务或者挂机刷怪攒资源
然后利用资源再去提升战斗力, 作为一名开发者, 这些非常简单且重复的内容当然是用脚本来解决
于是决定实现自动化完成部分游戏内容

<!--more-->

## 技术方案选择
在使用Spy++与一个另不错的老工具[彗星小助手](https://it608.com/Item/ca.html)查看窗口信息后
确认游戏窗口使用MFC, 游戏内容渲染使用DX9

最开始, 想着以我最熟悉的编程语言Java来实现脚本
Java要调用Win32, 最通用且方便的手段是使用JNA已经封装的Platform库
在尝试实现一部分功能后发现Java还是不够方便

既然是要做在Windows游戏的脚本, 当然可以试试与Java十分类似但是更适合Windows的C#
而C#所处的平台.Net已经更新到.Net7, 是.Net framework与.Net core整合后的产物
网上大量资料都是使用.Net framework来进行Win32 API的操作, 但是学习新内容更能拓宽我的视野
于是选择.Net7作为开发平台, 通过搜索引擎了解到C#使用PInvoke可以调用Native方法
而Win32 API有PInvoke.NET这个预封装库, 在找到PInvoke.NET的[github地址](https://github.com/dotnet/pinvoke)后
发现PInvoke.NET已经在2023年7月26日归档, 官方推荐使用[CsWin32](https://github.com/microsoft/CsWin32)来代替这个项目
于是确定了CsWin32作为调用Win32 API的封装
CsWin32和PInvoke.NET相比是采用了源码生成, 按照Github仓库中的说明只需要引入库
```shell
dotnet add package Microsoft.Windows.CsWin32 --prerelease
```
然后再在`NativeMethod.txt`文件中写入所需的Win32 API函数名即可在命名空间`Windows.Win32`下找到类`PInvoke`
我日常使用Jetbrains家的IDEA作为开发IDE, 而开发C#则是选择了Rider
按照Readme一通操作后发现Rider并没有提供按照预期工作, 而官方使用的VisualStudio
在谷歌搜索结果中也有部分消息透露出Rider不支持源码生成器功能
最后甚至找到了Rider的Git仓库, 发现一条Issue说已经支持了源码生成器功能, 最后了解到Rider得先进行`Build Solution`才会生成

## 截图功能实现
在解决完最基础功能所需环境后, 该实现的第一个功能是对窗口进行截图
之前在使用Java尝试中了解到Win32 API中通过GDI可以进行截图, 而GDI中使用BitBlt可以直接复制窗口视图缓存
也使用Java将图片截取出来了, 但是到C#中按照之前的逻辑复刻后却是一片黑
经过不断的排除与尝试后发现是屏幕缩放率导致的问题, Java应用取到的系统缩放率是100%而C#取到的是正常值125%
在使用125%的缩放率计算正确的窗口视图大小后, 就搞定了窗口的截图功能

## 游戏任务目标定位
要完成游戏的任务得先要找到游戏任务目标的位置, 而找到游戏目标的位置则需要对特征进行提取
所有的游戏目标都有近似的外形, 于是想着通过游戏内容截图来查找例子小图来查找位置
在谷歌搜索后确认使用OpenCV来进行操作, OpenCV的C#封装中OpenCVSharp是使用率最高的

```CSharp
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 读取大图和小图
        Mat largeImage = new Mat("large_image.jpg", ImreadModes.Color);
        Mat smallImage = new Mat("small_image.jpg", ImreadModes.Color);

        // 创建结果矩阵
        Mat result = new Mat();
        Cv2.MatchTemplate(largeImage, smallImage, result, TemplateMatchModes.CCoeffNormed);

        // 寻找最佳匹配位置
        double minVal, maxVal;
        Point minLoc, maxLoc;
        Cv2.MinMaxLoc(result, out minVal, out maxVal, out minLoc, out maxLoc);

        // 绘制匹配结果的矩形框
        Rect matchRect = new Rect(maxLoc, new Size(smallImage.Width, smallImage.Height));
        Cv2.Rectangle(largeImage, matchRect, Scalar.Red, 2);

        // 显示结果
        Cv2.ImShow("Result", largeImage);
        Cv2.WaitKey(0);
    }
}
```
根据上述OpenCVSharp例子解决了查找坐标后, 发现存在问题, 虽然是找到了目标的窗口坐标
但是游戏任务目标有4种, 除开颜色和名字不一样以外其他外观几乎一致
如果将4种目标都大图找小图, 那效率和准确率都会非常低, 然后将注意力转移到了名字上
任务目标的名字是最优先渲染, 所以不会被同层级的其他游戏内容遮挡, 并且是绿色的, 特征非常明显
并且可以通过目标的名字来判断是4种中的那种目标, 通过下述代码就能将绿色区域提取出来
```CSharp
Cv2.InRange(screenShot, Scalar.Lime, Scalar.Lime, greenMask);
```

为了从图片中获取任务目标的文本信息, 需要使用OCR技术, 而作为一个小脚本则不可能使用在线OCR接口
再了解后选择了Tesserect来进行OCR提取文本信息
```CSharp
using Tesseract;

class Program
{
    static void Main()
    {
        // 创建Tesseract引擎实例
        using var engine = new TesseractEngine(@"tessdataPath", "eng", EngineMode.Default)
        // 读取图像
        using var image = Pix.LoadFromFile("image.jpg")
        // 将图像传递给Tesseract引擎进行文本识别
        using var page = engine.Process(image)
        // 提取识别到的文本
        string extractedText = page.GetText();
        // 输出提取的文本
        Console.WriteLine(extractedText);
    }
}
```
根据上述Tesserect提取文本的例子, Tesserect需要使用Pix来读写图片, 而OpenCVSharp则使用的Mat
Pix可以使用BMP等格式来读取, 于是实现了以下代码
```CSharp
public static unsafe Pix Mat2Pix(Mat mat)
{
    var encodeResult = Cv2.ImEncode(".bmp", mat, out var data);
    if (encodeResult == false)
        throw new Exception("格式转换失败");
    return Pix.LoadFromMemory(data);
}
```
在Debug运行后, Rider提示`Cv2.ImEncode`分配了大量的堆内存, 该方法代码如下
```CSharp
public static bool ImEncode(string ext, InputArray img, out byte[] buf, int[]? prms = null)
{
    if (string.IsNullOrEmpty(ext))
        throw new ArgumentNullException(nameof(ext));
    if (img is null)
        throw new ArgumentNullException(nameof(img));
    if (prms is null)
        prms = Array.Empty<int>();
    img.ThrowIfDisposed();
    using var bufVec = new VectorOfByte();
    NativeMethods.HandleException(
        NativeMethods.imgcodecs_imencode_vector(ext, img.CvPtr, bufVec.CvPtr, prms, prms.Length, out var ret));
    GC.KeepAlive(img);
    buf = bufVec.ToArray();
    return ret != 0;
}
```
在`bufVec.ToArray`是将Native内存拷贝到C#的托管内存中, `Pix.LoadFromMemory`代码如下
```CSharp
public static unsafe Pix LoadFromMemory(byte[] bytes)
{
  IntPtr handle;
  fixed (byte* data = bytes)
    handle = LeptonicaApi.Native.pixReadMem(data, bytes.Length);
  return !(handle == IntPtr.Zero) ? Pix.Create(handle) : throw new IOException("Failed to load image from memory.");
}
```
这2个方法都是Native操作, 操作的目标都是指针, 于是将两者整合直接传递指针以绕开内存拷贝到C#的托管内存中
其中有个点需要注意`Pix.LoadFromMemory`中使用的`LeptonicaApi`是internal访问级别, 需要通过反射调用, 结果如下
```CSharp
private static readonly Lazy<ILeptonicaApiSignatures> Leptonica = new(() =>
    (typeof(TesseractEngine).Assembly.GetType("Tesseract.Interop.LeptonicaApi")?.GetProperty("Native")?
        .GetValue(null)! as ILeptonicaApiSignatures)!);

public static unsafe Pix Mat2Pix(Mat mat)
{
    using InputArray inputArray = mat;
    const string ext = ".BMP";
    using var vectorOfByte = new VectorOfByte();
    NativeMethods.HandleException(NativeMethods.imgcodecs_imencode_vector(ext, inputArray.CvPtr, vectorOfByte.CvPtr, Array.Empty<int>(), 0, out _));
    var handle = Leptonica.Value.pixReadMem((byte*)vectorOfByte.ElemPtr, vectorOfByte.Size);
    return handle != IntPtr.Zero ? Pix.Create(handle) : throw new IOException("Failed to load image from memory.");
}
```
直接将过滤出来的绿色文字蒙版转为Pix塞入Tesserect进行OCR后
一张1366×768的游戏画面需要800ms, 并且文本识别准确率比较低
在资料中了解到, 文字像素太低会导致Tesserect无法识别文字
可以将图片放大后再进行识别, 用以下代码将截图放大2倍后, 准确率达到可用水平
```CSharp
Cv2.Resize(mat, mat, new Size(mat.Width * 2, mat.Height * 2));
```
但是由于长宽都放大两倍, 图片大小整体变大了4倍, 速度变得更加慢了
可以使用[OpenCV提取文字区域](https://blog.csdn.net/huobanjishijian/article/details/63685503)后再将文本区域内容进行OCR
经过处理后从1-2秒识别一次游戏画面中文本内容优化到了25-30ms识别一次

## 获取脚本所需游戏信息
任务的交付点与任务的目标是不同的2张地图, 并且需要使用坐标与游戏自带的导航功能
游戏的小地图组件在右上角, 小地图包含了当前地图名称、当前坐标、导航菜单按钮
使用Spy++检测后, 可以直接在Spy++中读取到地图名与坐标, 于是通过Win32 API来进行读取
发现使用`GetWindowText`哪怕在管理员权限下也读取不到内容, 但是Spy++可以正常读取
才了解到MFC中的`Static`组件无法跨进程使用`GetWindowText`读取内容
必须使用`SendMessage`发送`WM_GETTEXT`来读取内容, 封装工具方法如下
```CSharp
public static string GetTextMfc(IntPtr hwnd)
{
    if (hwnd == HWND.Null) return "";
    const uint WM_GETTEXTLENGTH = 0x000E;
    const uint WM_GETTEXT = 0x000D;
    var lengthPtr = PInvoke.SendMessage((HWND)hwnd, WM_GETTEXTLENGTH, 0, 0).Value;
    var length = lengthPtr.ToInt32();
    if (length < 1) return "";
    unsafe
    {
        fixed (char* textPtr = new char[length + 1])
        {
            PInvoke.SendMessage((HWND)hwnd, WM_GETTEXT, (nuint)((length + 1) * Marshal.SizeOf<char>()),(IntPtr)textPtr);
            return new string(textPtr, 0, length);
        }
    }
}
```

## 游戏坐标与屏幕坐标换算
获取了游戏角色的当前坐标, 要操作角色移动到指定坐标, 则需要将游戏坐标与屏幕做坐标进行换算
在搜索后找到了知乎上的这篇文章: [从零开始的2.5D游戏开发](https://zhuanlan.zhihu.com/p/133818038)
文章中介绍了2.5D斜45度视角游戏的矩阵变换
而该游戏主角在视角与地图边缘没有碰撞的情况下会保持在游戏画面中央
通过以下代码实现获取相对于当前角色45度角坐标偏移的屏幕坐标
```CSharp
private const double MatrixAngle = Math.PI / 180 * 30;
private static readonly double PointPerPixel = 36;
private static readonly double MatrixSin = Math.Sin(MatrixAngle);
private static readonly double MatrixCos = Math.Cos(MatrixAngle);

public Point RelativeGameCoord(int x, int y)
{
    return new Point((int)((x - y) * MatrixCos * PointPerPixel + GameRectangle.Width / 2D),
        (int)((x + y) * MatrixSin * PointPerPixel + GameRectangle.Height / 2D));
}
```

## 模拟鼠标点击
最开始实现脚本功能, 直接选择了`PostMessage`发送点击事件给游戏画面渲染组件, 结果没有反应
有的内部窗口和按钮也并没有全部都在Win32 API中读取到, 明判断为自绘组件内容
并且游戏使用了DirectX9进行画面渲染, 故认为游戏渲染的操作使用的DirectInput
先尝试用`SendInput`直接操作桌面的鼠标来实现功能, 虽然可以操作, 但是只能独占鼠标
于是尝试HOOK DirectInput实现后台操作, 在过程中发现并不是游戏画面渲染组件负责响应
而是更外一层包裹的`#Dialog`组件, 通过`PostMessage`最终实现了非前台模拟鼠标点击操作

## 完成功能
该任务有4种任务目标, 需要将4种目标按4种规则组合1234、2413、3142、4321
每次重新领取任务后, 规则都会重置, 每次任务中选择错误会将进度重置
在整合了以上功能与经验后, 最终完成了该游戏任务的非前台自动化操作
并且在这个过程中学习且使用了OpenCV与Tesserect等技术, 故水此博客进行记录