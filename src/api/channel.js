// 频道相关接口模块
import request from '@/utils/request.js'
// 获取用户默认推荐的频道
export const getDefaultChannel = function () {
  return request({
    method: 'GET',
    url: '/app/v1_0/user/channels'
  })
}
