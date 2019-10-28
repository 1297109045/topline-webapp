<template>
  <div class="home">
    <!-- 导航栏 -->
    <van-nav-bar fixed>
      <van-button
      class="search-btn"
      slot="title"
      round
      type="info"
      size="small"
      @click="$router.push('/search')"
      >
      搜索
      </van-button>
    </van-nav-bar>
    <!-- 频道列表 -->
    <van-tabs v-model="active">
      <van-tab :title="channel.name" v-for="channel in channels" :key="channel.id">
        <van-pull-refresh v-model="channel.isPullDownLoading" @refresh="onRefresh">
          <van-list
            v-model="channel.loading"
            :finished="channel.finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-cell
              v-for="article in channel.articles"
              :key="article.art_id.toString()"
              :title="article.title"
              @click="$router.push({
                name:'article',
                params:{
                  articleId:article.art_id.toString()
                }
              })"
            >
            <div slot="label">
              <van-grid :border="false" :column-num="3">
                <van-grid-item v-for="(img, index) in (article.cover.images.length && article.cover.images)" :key="index">
                  <van-image
                  height="100px"
                  width="100px"
                  :src="img"
                  lazy-load/>
                </van-grid-item>
              </van-grid>
              <div class="article-info">
                <div class="meta">
                  <span>{{ article.aut_name }}</span>
                  <span>{{ article.comm_count }}评论</span>
                  <span>{{ article.pubdate | relativeTime}}</span>
                </div>
                <van-icon name="close" />
              </div>
            </div>
            </van-cell>
          </van-list>
        </van-pull-refresh>
        <!-- 文章列表 -->
      </van-tab>
      <!-- 面包按钮 -->
       <div slot="nav-right" class="wap-nav" @click="isChannelShow = true">
          <van-icon name="wap-nav" size="24" />
       </div>
  <!-- /面包按钮 -->
    </van-tabs>

    <!-- 编辑频道 -->
    <van-popup
      v-model="isChannelShow"
      position="bottom"
      :style="{ height: '95%' }"
      closeable
      close-icon-position="top-left"
      round>
      <div class="channel-container">
        <van-cell title="我的频道" :border="false">
          <van-button
           type="danger"
           size="mini"
           @click="isEditShow=!isEditShow">
          {{isEditShow ? '完成' :  '编辑'}}
          </van-button>
        </van-cell>
       <van-grid :gutter="10">
         <van-grid-item text="推荐" @click="switchChannel(0)"/>
          <van-grid-item
            v-for="(channel,index) in channels"
            :key="index"
            :text="channel.name"
            @click="onMyChannelClick(index)"
          >
           <van-icon v-show="isEditShow" class="close-icon" slot="icon" name="close" size="14px"/>
         </van-grid-item>
        </van-grid>

        <van-cell title="推荐频道" :border="false">
        </van-cell>
       <van-grid :gutter="10">
          <van-grid-item
            v-for="(channel,index) in remainingChannels"
            :key="index"
            :text="channel.name"
            @click="onAddChannel(channel)"
          />
        </van-grid>

      </div>
    </van-popup>
  </div>
</template>
<script>
import { getUserOrDefaultChannels, getAllChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { setItem, getItem } from '@/utils/storage'

// import { async } from 'q'
export default {
  name: 'HomeIndex',
  data () {
    return {
      isChannelShow: true, // 频道的显示状态
      isEditShow: false, // 频道的编辑状态
      active: 0,
      list: [],
      loading: false,
      finished: false,
      channels: [], // 频道列表
      allChannels: []// 存储所有频道列表

    }
  },
  watch: {
    // 函数名就是要坚挺的数据成员名称
    channels (newValue) {
      setItem('channels', newValue)
    }
  },
  computed: {
    remainingChannels () {
      const channels = []
      this.allChannels.forEach(channel => {
        const index = this.channels.findIndex(item => item.id === channel.id)
        if (index === -1) {
          channels.push(channel)
        }
      })
      return channels
    }

  },
  created () {
    this.loadChannels()
    this.loadAllChannels()
  },

  methods: {
    // 下拉刷新
    async onRefresh () {
      const activeChannel = this.channels[this.active]
      const { data } = await getArticles({
        // 注意：channel_id、timestamp、with_top 都是后端要求指定的数据字段名称，不能随便写
        channel_id: activeChannel.id, // 频道ID
        timestamp: Date.now(), // 时间戳，请求新的推荐数据传当前的时间戳，请求历史推荐传指定的时间戳
        with_top: 1
      })
      // 2.将数据添加文章顶部
      activeChannel.articles.unshift(...data.data.results)
      // 3.关闭下拉刷新的状态
      activeChannel.isPullDownLoading = false
      // 4.提示
      this.$toast('刷新成功')
    },

    async onLoad () {
      // 当前激活的频道对象
      const activeChannel = this.channels[this.active]
      // 1. 请求数据
      const { data } = await getArticles({
        // 注意：channel_id、timestamp、with_top 都是后端要求指定的数据字段名称，不能随便写
        channel_id: activeChannel.id, // 频道ID
        // a: 3 b: 2
        // 4    3
        // 这里的这个时间戳就好比当前频道下一页的页码
        timestamp: activeChannel.timestamp || Date.now(), // 时间戳，请求新的推荐数据传当前的时间戳，请求历史推荐传指定的时间戳
        with_top: 1 // 是否包含置顶，进入页面第一次请求时要包含置顶文章，1-包含置顶，0-不包含
      })
      // 2.将数据添加到当前频道.articles中
      activeChannel.articles.push(...data.data.results)
      // 3.结束当前.loging=false
      activeChannel.loading = false
      // 4.如果还有下一页数据
      if (data.data.pre_timestamp) {
        // 更新获取下一页数据的时间戳
        activeChannel.timestamp = data.data.pre_timestamp
      } else {
        // 如果没有下一页，就没数据了
        activeChannel.finished = true
      }
      // 异步更新数据
      // setTimeout(() => {
      //   for (let i = 0; i < 10; i++) {
      //     activeChannel.articles.push(activeChannel.articles.length + 1)
      //   }
      //   console.log(activeChannel, 9)
      //   // 加载状态结束
      //   activeChannel.loading = false

      //   // 数据全部加载完成
      //   if (activeChannel.articles.length >= 40) {
      //     activeChannel.finished = true
      //   }
      // }, 500)
    },
    async loadChannels () {
      let channels = []
      // 获取本地存储中的频道列表
      const loadChannels = getItem('channels')
      // 如果有本地存储的频道列表就用本地存储的频道列表
      if (loadChannels) {
        channels = loadChannels
      } else {
        // 如果没有就请求获取后台推荐的频道列表
        const { data } = await getUserOrDefaultChannels()
        channels = data.data.channels
      }
      this.extendData(channels)
      // channels.forEach(channel => {
      //   channel.articles = [] // 存储频道的文章列表
      //   channel.finished = false // 存储频道的加载结束状态
      //   channel.loading = false // 存储频道的加载更多 loading状态
      //   channel.timestamp = null // 存储获取频道下一页的时间戳
      //   channel.isPullDownLoading = false // 存储频道的下拉刷新 loading状态
      // })
      this.channels = channels
    },
    // 获取所有频道数据
    async loadAllChannels () {
      const { data } = await getAllChannels()
      const channels = data.data.channels
      this.extendData(channels)
      this.allChannels = channels
      // channels.forEach(channel => {
      //   const extendData = this.extendChannelData()
      //   Object.assign(channel, extendData)
      // })
      // this.allChannels = channels
    },
    // 添加频道
    onAddChannel (channel) {
      this.channels.push(channel)
    },
    // 我的频道点击处理事件
    onMyChannelClick (index) {
      if (this.isEditShow) {
        // 如果是编辑状态  删除频道
        this.channels.splice(index, 1)
      } else {
        // 如果不是编辑状态 切换频道展示
        this.switchChannel(index + 1)
      }
    },
    // 切换频道
    switchChannel (index) {
      // 切换当前激活的频道
      this.active = index
      // 关闭频道弹层
      this.isChannelShow = false
    },
    extendData (channels) {
      channels.forEach(channel => {
        channel.articles = [] // 存储频道的文章列表
        channel.finished = false // 存储频道的加载结束状态
        channel.loading = false // 存储频道的加载更多 loading状态
        channel.timestamp = null // 存储获取频道下一页的时间戳
        channel.isPullDownLoading = false // 存储频道的下拉刷新 loading状态
      })
    }
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
  .search-btn{
    width:100%;
    background:#5babfb;
  }
  .wap-nav{
  position: sticky;
  right:0;
  display: flex;
  align-items: center;
  background-color: #fff;
  opacity:0.8;

}
  .channel-container{
    padding-top:30px
  }
  .close-icon{
    position:absolute;
    top:-5px;
    right:-5px
  }
}

</style>
