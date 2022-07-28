<p align="center">
    <img alt="logo" src="https://freely.vercel.app/favicon.ico" width="120" height="120" style="margin-bottom: 10px;">
</p>
<h1 align="center">小依助手 头像制作</h1>

<p align="center">制作微信头像、抖音头像、中国红国旗、头像海报等</p>

<p align="center">
🔥 <a target="_blank" href="./images/icon/mini.png">在线 访问</a>
&nbsp;
🌈 <a target="_blank" href="https://juejin.cn/post/7070402652948922381">文档</a>
</p>

## 功能

- 🚀 小程序原生框架、canvas开发
- 💪 支持获取微信头像进行制作
- 💪 支持本地图片导入进行裁剪
- 💪 支持插入国旗等贴纸
- 💪 支持生成朋友圈节日海报图
- 💪 支持预览制作后的头像，并保存到本地相册

## 大致流程

1. 初始化一个canvas头像画图
2. 获取微信用户信息授权，并保存到本地
3. 提示用户选择 头像贴纸
4. 点击预览，从canvas获取图片信息，并显示制作后的图片
5. 点击节日海报，把制作后的头像，放到海报上面，生成朋友圈海报
6. 抖音本地图片，选择图片后，对图片进行裁剪，然后才进入头像制作流程

## 部署注意

1. 贴纸、头像图片信息都存储在一台服务器上，需支持https
2. 开发环境，可打开不校验https正式配置
3. 正式环境，需要配置request域名、downloadFile合法域名

`注 ：示例中的接口、图片地址，仅为临时测试地址，正式环境使用时，请务必更换！！！`