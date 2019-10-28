<template>
  <div class="article-container">
      <!-- 导航栏 -->
      <van-nav-bar
      fixed
      left-arrow
      @click-left="$router.back()"
      title="文章详情"
      ></van-nav-bar>
      <!-- 加载中 -->
      <van-loading class="article-loading" v-if="loading" />
      <!-- 文章详情 -->
    <div class="detail" v-else-if="article.title">
        <h3 class="title">{{article.title}}</h3>
        <div class="author">
            <van-image round width="2rem" height="2rem" fit="fill" :src="article.aut_photo" />
        <div class="text">
            <p class="name">{{article.aut_name}}</p>
            <p class="time">{{article.pubdate | relativeTime}}</p>
        </div>
        <van-button
        round
        size="small"
        type="info"
        @click="onFollow"
        >{{article.is_followed?'取消关注':'+关注'}}</van-button>
        </div>
        <div class="content" v-html="article.content"></div>
        <div class="zan">
            <van-button
            round
            size="small"
            hairline
            :type="article.attitude===1?'default':'primary'"
            plain
            icon="good-job-o"
            @click="onLike"
            >{{article.attitude===1?'取消点赞':'点赞'}}</van-button>
           &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            <van-button
            round
            size="small"
            hairline
            type="primary"
            plain icon="detele"
            @click="onDislike"
            >{{article.attitude===0?'取消不喜欢':'不喜欢'}}</van-button>
        </div>
    </div>
    <!-- 加载失败的消息提示 -->
    <div class="error" v-else>
        <p>网络超时,点击 <a href="#" @click.prevent="loadArticle">刷新</a>试一试.</p>
    </div>
    <!-- 文章评论 -->
    <article-comment :article-id="$route.params.articleId" />
    <!-- /文章评论 -->
  </div>
</template>

<script>
import { getArticle, likeArticle, unLikeArticle, addDislike, deleteDislike } from '@/api/article'
import { followUser, unFollowUser } from '@/api/user'
import ArticleComment from './components/article-comment'

export default {
  name: 'ArticleIndex',
  components: {
    ArticleComment
  },
  data () {
    return {
      loading: true, // 控制加载中的loading
      article: {// 文章详情
        // title: 'hello world',
        // content: '<p>hello world</p>',
        // aut_name: 'LPZ',
        // pubdate: '4天前',
        // aut_photo: 'http://toutiao.meiduo.site/FsyeQUotMscq-vji-2ZDiXrc44k5'

      }

    }
  },

  created () {
    this.loadArticle()
  },
  methods: {
    async loadArticle () {
      // 开启服务
      this.loading = true
      try {
        const { data } = await getArticle(this.$route.params.articleId)
        this.article = data.data
      } catch (err) {
        // 如果请求出错意味着获取数据失败了,我们这里可以提示用户加载失败
        console.log(err)
      }
      // 无论加载成功还是失败,loading都需要结束
      this.loading = false
    },
    onFollow () {
      // 如果已关注,则取消关注
      if (this.article.is_followed) {
        unFollowUser(this.article.aut_id)
      } else {
        // 如果没有关注,则关注
        followUser(this.article.aut_id)
      }
      this.article.is_followed = !this.article.is_followed
    },
    onLike () {
      const { attitude } = this.article
      const articleId = this.article.art_id.toString()
      // 如果已赞,则取消点赞
      if (attitude === 1) {
        unLikeArticle(articleId)
        this.article.attitude = -1
      } else {
        // 否则点赞
        likeArticle(articleId)
        this.article.attitude = 1
      }
    },
    onDislike () {
      const { attitude } = this.article
      const articleId = this.article.art_id.toString()
      // 如果不喜欢状态,则取消不喜欢
      if (attitude === 0) {
        deleteDislike(articleId)
        this.article.attitude = -1
      } else {
        // 否则,不喜欢
        addDislike(articleId)
        this.article.attitude = 0
      }
    }

  }
}
</script>

<style scoped lang="less">
.article-container{
    position: absolute;
    left:0;
    top:0;
    overflow-y: scroll;
    width:100%;
    height:100%;
}
.article-loading {
  padding-top: 100px;
  text-align: center;
}
.error{
  padding-top: 100px;
  text-align: center;
}
.detail {
  padding: 50px 10px;
  .title {
    font-size: 16px;
  }
  .zan{
    text-align: center;
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.3;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .content {
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
  }
}
</style>
