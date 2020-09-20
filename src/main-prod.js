import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import '@/assets/css/global.css'
import '@/assets/css/iconfont.css'
import axios from './plugins/axios'
import '@/filters'
import './plugins/editor'

Vue.config.productionTip = false
Vue.prototype.$axios = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
