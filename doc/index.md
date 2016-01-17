# 简易团队视频分享平台

## 为什么要做这套系统

- 视频Demo能极好的支持团队中传递知识与经验
- 现行没有合适的支持视频分享的机制与系统
- 现代浏览器对html video的支持, 使快速分享视频的条件已经具备

## 架构简介

### 涉及组件

- [Video sharing server]
- [Video clipper]
- [Demo player]

### 步骤

- Demo视频录取:
    - 可以找一些录制视频的工具, 录制一些教程.
    - 及其推荐 [Monosnap] 这款工具
- 视频分割:
    - 本系统, 将本地video文件, 很快的分割成为若干小的视频/音频/图片素材块 (由 [Video clipper] 完成)
- 视频上传:
    - 利用 [Video clipper], 设置服务器信息与tokenPass, 快捷地将Demo素材上传至服务器
- 服务器:
    - 服务器利用 `express` 的 `st` 中间件, 廉价的将素材当成静态资源提供出来 (方便浏览器, 中间层的缓存)
    - 使用 [Demo player] 将素材整合成单一视频进行播放
    - 提供一些视频方面的管理
    - 提供视频的永久链接, 方便在其他地方提及视频
    - (未来) 提供视频大纲管理与播放支持


[Monosnap]: http://www.monosnap.com/welcome
[Video sharing server]: https://github.com/be-fe/befe-video-sharing-server
[Video clipper]: https://github.com/be-fe/video-clipper
[Demo player]: https://github.com/be-fe/demo-player