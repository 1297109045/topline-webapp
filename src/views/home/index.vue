<template>
  <div class="home">
      <van-nav-bar
  title="首页"
/>
<!-- 频道列表 -->
<van-tabs v-model="active">
  <van-tab
  :title='channel.name'
  v-for="channel in channels"
  :key="channel.id"
  >
  <!-- //使用下拉刷新组件包裹文章列表 -->
<van-pull-refresh v-model="channel.isPullDownLoading" @refresh="onRefresh">
      <!-- 文章列表 -->
      <van-list
  v-model="channel.loading"
  :finished="channel.finished"
  finished-text="没有更多了"
  @load="onLoad"
>
  <van-cell
    v-for="(article,index) in channel.articles"
    :key="index"
    :title="article.title"
  >
  <div solt="label">
    <van-grid :border="false" :column-num="3">
  <van-grid-item v-for="(img,index) in article.cover.images" :key="index" />
  <van-image  width="100" height="100" lazy-load src='https://img.yzcdn.cn/vant/cat.jpeg' />
</van-grid>
<div class="article-info">
  <div class="meta">
    <span>{{article.aut_name}}</span>
    <span>{{article.comm_count}}评论</span>
    <span>{{article.pubdate}}</span>
  </div>
  <van-icon name="close" />>
</div>
  </div>
  </van-cell>
</van-list>
<!-- 文章列表 -->
</van-pull-refresh>
  </van-tab>
  <!-- <van-tab title="标签 2">内容 2</van-tab>
  <van-tab title="标签 3">内容 3</van-tab>
  <van-tab title="标签 4">内容 4</van-tab> -->
</van-tabs>

  </div>
</template>

<script>
import { getDefaultChannel } from '@/api/channel'
import { getArticles } from '@/api/article'
export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 0,
      // list: [],
      channels: []
    }
  },

  methods: {
    async onLoad () {
      // 获取当期激活的频道对象
      const activeChannel = this.channels[this.active]

      // 1. 请求获取数据
      const { data } = await getArticles({
        // 注意：channel_id、timestamp、with_top 都是后端要求指定的数据字段名称，不能随便写
        channel_id: activeChannel.id, // 频道ID
        // a: 3 b: 2
        // 4    3
        // 这里的这个时间戳就好比当前频道下一页的页码
        timestamp: activeChannel.timestamp || Date.now(), // 时间戳，请求新的推荐数据传当前的时间戳，请求历史推荐传指定的时间戳
        with_top: 1 // 是否包含置顶，进入页面第一次请求时要包含置顶文章，1-包含置顶，0-不包含
      })

      // 2. 将数据添加到当前频道.articles中
      // activeChannel.articles = activeChannel.articles.concat(data.data.results)
      activeChannel.articles.push(...data.data.results)

      // 3. 结束当前频道.loging = false
      activeChannel.loading = false

      // 4. 如果还有下一页数据
      if (data.data.pre_timestamp) {
        // 更新获取下一页数据的页码时间戳
        activeChannel.timestamp = data.data.pre_timestamp
      } else {
        // 如果没有下一页数据了，就意味着后面没有数据了
        activeChannel.finished = true
      }
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          activeChannel.articles.push(activeChannel.articles.length + 1)
        }
        // 加载状态结束
        activeChannel.loading = false

        // 数据全部加载完成
        if (activeChannel.articles.length >= 40) {
          activeChannel.finished = true
        }
      }, 500)
    },
    // 下拉刷新
    async onRefresh () {
      // 获取当前激活的频道对象
      const activeChannel = this.channels[this.active]
      // 1.请求获取最新推荐文章列表
      const { data } = await getArticles({
        channel_id: activeChannel.id,
        timestamp: Date.now(), // 下拉刷新永远都是在获取最新推荐的文章,所以传递当前时间磋
        with_top: 1
      })
      // 2.将数据添加到文章列表头部
      activeChannel.articles.unshift(...data.data.results)
      // 3.关闭下拉刷新的loading状态
      activeChannel.isPullDownLoading = false
      // 4.提示
      this.$toast('刷新成功')
    },
    async loadChannels () {
      const { data } = await getDefaultChannel()
      const channels = data.data.channels
      channels.forEach(channel => {
        channel.articles = []// 存储频道的文章列表
        channel.finished = false// 存储频道的加载结束状态
        channel.loading = false// 存储频道的加载更多 loading状态
        channel.timestamp = null // 存储获取频道下一页的时间戳
        channel.isPullDownLoading = false// 存储频道的下拉刷新loading状态
      })
      this.channels = channels
    }
  },
  created () {
    this.loadChannels()
  }
}
</script>

<style lang='less' scoped>
.home {
  .article-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .meta span {
      margin-right: 10px;
    }
  }
}
</style>
