import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '@/components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Login.vue')

// import Home from '@/components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Home.vue')

// import Welcome from '@/components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Welcome.vue')

// import Users from '@/components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/user/Users.vue')

// import Rights from '@/components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Rights.vue')

// import Roles from '@/components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Roles.vue')

// import Cate from '@/components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/goods/Cate.vue')

// import Params from '@/components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/goods/Params.vue')

// import List from '@/components/goods/List.vue'
const List = () => import(/* webpackChunkName: "List_Add" */ '@/components/goods/List.vue')

// import Add from '@/components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List_Add" */ '@/components/goods/Add.vue')

// import Order from '@/components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '@/components/order/Order.vue')

// import Report from '@/components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '@/components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        name: 'Add-Edit',
        component: Add,
        meta: {
          activeMenu: '/goods'
        }
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 为路由对象， 添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问的登录页面，直接放行
  if (to.path === '/login') return next()
  // 从 sessionStorage 中获取到 保存的 token 值
  const tokenStr = window.sessionStorage.getItem('_tokenName')
  // 没有token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  // 有 token 正常放行
  next()
})

export default router
