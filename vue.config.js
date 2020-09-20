module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer: {
    proxy: { // 配置跨域
      '/api': {
        target: 'http://localhost:8888', // 这里后台的地址模拟的;应该填写你们真实的后台接口
        changOrigin: true // 允许跨域
      }
    }
  },
  chainWebpack: config => {
    // 判断是否处于生产模式 (固定写法)
    config.when(process.env.NODE_ENV === 'production', config => {
      // 获得默认打包入口清除并添加
      config.entry('app').clear().add('./src/main-prod.js')
      // 通过 externals 加载外部 CDN 资源
      config.set('externals', {
        // key是包的名字，value是引入的全局对象，即 import 后面跟着的对象
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 首页内容定制
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 判断是否处于开发模式 (固定写法)
    config.when(process.env.NODE_ENV === 'development', config => {
      // 获得默认打包入口清除并添加
      config.entry('app').clear().add('./src/main-dev.js')
      // 首页内容定制
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
