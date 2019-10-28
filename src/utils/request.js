import axios from 'axios'
import jsonBig from 'json-bigint'
import store from '@/store'

// 非组件模块中使用容器就直接加载即可
import router from '@/router'
// axios.create 方法
// 建议使用 create 方式，我们可以拥有
// 说白了就是复制了一个 axios，拥有和 axios 完全一样的功能，但是配置可以不一样
// 例如我们可以创建多个请求对象，而不同的请求对象拥有不同的 baseURL
// 例如我们可以有 a 请求的拦截器，也可以专门定制 b 请求的拦截器
const request = axios.create({
  // 请求的基础路径
  baseURL: 'http://ttapi.research.itcast.cn'
})
/**
 * 配置处理后端返回数据中超出 js 安全整数范围问题
 */
request.defaults.transformResponse = [function (data) {
  return data ? jsonBig.parse(data) : {}// 换了一个转化方法 使得 计算更精确 保证id不失真
}]
/**
 * 请求拦截器
 */
request.interceptors.request.use(function (config) {
  // 在发起请求做一些业务处理
  // config是要发送请求的配置信息
  const user = store.state.user
  if (user) {
    // Authorization 是后端要求的名字，不能瞎写
    // 数据值 "Bearer空格token" 也是后端要求的数据格式，不能瞎写
    // 千万!千万!千万!注意，Bearer 和 token 之间的空格不能少
    // 什么意义？这是后端要求的，我们决定不了。
    config.headers['Authorization'] = `Bearer ${user.token}`// 统一注入token
  }
  return config
}, function (error) {
  // 对请求失败做处理
  return Promise.reject(error)
})
/**
* 响应拦截器
*/
request.interceptors.response.use(function (response) { // 400状态码进入这里
  return response
}, async function (error) { // 400
  console.dir(error)
  // 如果状态码是401
  if (error.response && error.response.status === 401) {
    const { user } = store.state
    if (!user) {
      // 直接跳转登录页
      router.push({
        name: 'login',
        query: {
          redirect: router.currentRouter.fullPath
        }
      })
    } else {
      try {
        // 请求获取更新的token
        const { data } = await axios({
          method: 'PUT',
          url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
          headers: {
            Authorization: `Bearer ${user.refresh_token}`
          }
        })
        // 将最新的token 替换原有token
        store.commit('setUser', {
          token: data.data.token, // 最新获取得
          refresh_token: user.refresh_token// 还是原来的
        })
        // 将原来失败的请求继续发出去
        return request(error.config)
      } catch (err) {
        console.log(err)
        // 刷新token也失败了,直接跳转到登录页面
        router.push({
          name: 'login',
          query: {
            redirect: router.currentRouter.fullPath
          }
        })
      }
    }
  }
  return Promise.reject(error)
})
// 导出这个请求对象，哪里需要发请求，哪里就加载使用
export default request
