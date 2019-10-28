<template>
  <div class="tabbar">

    <!-- 路由出口 -->
    <router-view />
    <van-tabbar route>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search">问答</van-tabbar-item>
      <van-tabbar-item icon="friends-o">视频</van-tabbar-item>
      <van-tabbar-item icon="setting-o" to="/my">{{$store.state.user ? '我的':'未登录'}}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: 'TabbatIndex',
  data () {
    return {
      active: 0
    }
  }
}
</script>

<style>
</style>
