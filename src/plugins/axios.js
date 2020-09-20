import axios from 'axios'
import NProgress from 'nprogress'
// 导入 NProgress 包对应的 js 和 css
import 'nprogress/nprogress.css'
// 创建一个 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API,
  timeout: 5000 // 请求超时时间
})

// axios 请求拦截 发起请求优先使用 use 回调
service.interceptors.request.use(config => {
  // 在 request 拦截器中，展示进度条
  NProgress.start()
  // config 是请求对象
  // 为请求头对象，添加 Token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('_tokenName')
  // 最后必须 return config
  return config
})

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 在 response 拦截器中，隐藏进度条
    NProgress.done()
    return response.data
  }
)

export default service
