# bytedance-charts
一个使用typescript开发的图表库

## 目录结构
    -build // 构建脚本
    -dist // 压缩版本
    -bytedance-render // 子项目 渲染引擎
    -lib // npm包的入口, 发布前生成commonjs模块和d.ts文件
    -src // 项目源码
      -components // 图表组件
      -charts // line, bar等图表
      -model // model基类
      -coord // 坐标系
      -core // 图表
      -scale // 比例尺
      -theme // 主题文件
      -utils // 工具函数
      -interface // 公共的types定义
    -test // 测试文件
      -static // dev-server的静态资源服务目录
      -templates // html模板
      -xxx.js 测试入口文件, 一个文件生成一个html
## 启动开发
```shell
npm run dev
```

