import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'amfe-flexible/index.js'
import './style/index.less'
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import zhCN from 'vee-validate/dist/locale/zh_CN' // 加载验证插件的语言包
import * as rules from 'vee-validate/dist/rules'
// 按需注册 Vant 组件
import {
  NavBar,
  Field,
  Button,
  toast,
  CellGroup,
  Tabbar,
  TabbarItem,
  Tab,
  Tabs,
  PullRefresh, // 下拉
  List,
  Cell,
  Grid,
  GridItem,
  Icon,
  Image,
  Lazyload

} from 'vant'

Vue.config.productionTip = false
Vue
  .use(NavBar)
  .use(Field)
  .use(Button)
  .use(toast)
  .use(CellGroup)
  .use(Tabbar)
  .use(TabbarItem)
  .use(Tab)
  .use(Tabs)
  .use(PullRefresh)
  .use(List)
  .use(Cell)
  .use(Grid)
  .use(GridItem)
  .use(Icon)
  .use(Image)
  .use(Lazyload, Option)

// 配置使用中文语言
for (let rule in rules) {
  extend(rule, {
    ...rules[rule], // add the rule
    message: zhCN.messages[rule]// add its message
  })
}

// 扩展自定义校验规则
// extend('规则名称', 配置对象)
extend('photo', {
  // 验证方法,value是需要校验的数据,返回一个布尔值,表示验证是否成功
  validate: function (value) {
    return /^1\d{10}$/.test(value)
  },
  // 错误提示信息
  message: '请输入有效的手机号码'
})

// 注册为全局组件
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
