# 寒兮的小黑屋
寒兮的博客
使用的Hexo + NexT主题

## 特点
1. 所有内容开源
2. 使用Github Action自动部署 [.github/workflows/hexo.yml](https://github.com/IceSoulHanxi/IceSoulHanxi.github.io/blob/master/.github/workflows/hexo.yml)
3. 自定义脚本实现PDF电子书列表 [scripts/index.js](https://github.com/IceSoulHanxi/IceSoulHanxi.github.io/blob/master/scripts/index.js)

## 构建
```shell
git submodule update --init --recursive
npm install -g hexo-cli
npm install
hexo g
```