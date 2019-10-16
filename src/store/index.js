import Vue from 'vue'
import Vuex from 'vuex'
import { getItem } from '@/utils/storage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 初始化的时候从本地存储获取数据，没有就是 null
    user: getItem('user')

  },
  mutations: {
    setUser (state, user) {
      state.user = user
    }
  },
  actions: {

  }

})
