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

- Demo视频录取:
    - 可以找一些录制视频的工具, 录制一些教程.
    - 及其推荐 [Monosnap] 这款工具
- 视频分割:
    - 本系统, 将本地video文件, 很快的分割成为若干小的视频/音频/图片素材块 (由 [Video clipper] 完成)


[Monosnap]: [what's this](http://google.com)
[Video sharing server]: https://github.com/be-fe/befe-video-sharing-server
[Video clipper]: https://github.com/be-fe/video-clipper
[Demo player]: https://github.com/be-fe/demo-player