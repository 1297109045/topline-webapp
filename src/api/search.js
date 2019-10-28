import request from '@/utils/request'
// 搜索接口相关请求模块
export function getSearchSuggestions (params) {
  return request({
    method: 'GET',
    url: '/app/v1_0/suggestion',
    params
  })
}
// 获取请求结果
export function getSearch (params) {
  return request({
    method: 'GET',
    url: '/app/v1_0/search',
    params
  })
}
