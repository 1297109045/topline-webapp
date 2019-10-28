<template>
  <div class="article-comments">
    <!-- 导航栏 -->
    <van-nav-bar :title="comment.reply_count+'条回复'">
      <van-icon slot="left" name="cross" @click="$emit('close')" />
    </van-nav-bar>
    <!-- /导航栏 -->
    <!-- 当前评论 -->
    <van-cell title="当前评论">
      <van-image
        slot="icon"
        round
        width="30"
        height="30"
        style="margin-right:10px"
        :src="comment.aut_photo"
      />
      <span style="color:#466b9d;" slot="title">{{comment.aut_name}}</span>
      <div>
        <p style="color:#363636">{{comment.content}}</p>
        <p>
          <span style="margin-right:10px">{{comment.pubdate | relativeTime}}</span>
          <span size="main" type="defalte">回复{{comment.reply_count}}</span>
        </p>
      </div>
      <van-icon slot="right-icon" />
    </van-cell>
    <!-- 当前评论结束 -->
    <van-cell title="全部评论" />
    <!-- 回复列表 -->
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-cell v-for="(item,index) in list" :key="index" :title="item.aut_name">
        <van-image
          slot="icon"
          round
          width="30"
          height="30"
          style="margin-right:10px"
          :src="item.aut_photo"
        />
        <span style="color:#466b9d" slot="title">hello</span>
        <div slot="label">
          <p style="color:#363636">{{item.content}}</p>
          <p>
            <span style="margin-right:10px">{{item.pubdate | relativeTime}}</span>
            <van-button size="mini" type="default">回复 {{ item.reply_count }}</van-button>
          </p>
        </div>
        <van-icon
          slot="right-icon"
          :name="item.is_liking ? 'like' : 'like-o'"
          @click="onCommentLike(item)"
        />
      </van-cell>
    </van-list>
    <!-- 回复列表结束 -->
    <!-- 发布评论 -->
    <van-cell-group class="publish-wrap">
      <van-field v-model="commentText" clearable placeholder="请输入评论内容">
        <van-button slot="button" size="mini" type="info" @click="onAddComment">发布</van-button>
      </van-field>
    </van-cell-group>
  </div>
</template>

<script>
import {
  getComments,
  addComment,
  addCommentLike,
  deleteCommentLike
} from '@/api/comment'

export default {
  name: 'CommentRrply',
  props: ['comment'],
  data () {
    return {
      list: [],
      loading: false, // 上拉加载更多的loading
      finished: false, // 是否加载结束
      offset: null,
      commentText: '',
      seen: true
    }
  },
  created () {
    console.log('created')
  },
  methods: {
    async onLoad () {
      console.log('onLoad')
      // 1.请求获取数据
      const { data } = await getComments({
        type: 'c', // 评论类型，a-对文章(article)的评论，c-对评论(comment)的回复
        source: this.comment.com_id.toString(),
        offset: this.offset
      })
      // 2.将数据添加到数组中
      this.list.push(...data.data.results)
      // 3.结束loading
      this.loading = false
      // 4. 判断是否加载结束
      //    如果还有数据，则更新获取下一页数据的页码（offset）
      //    如果没有数据，则 finished = true
      if (data.data.results.length) {
        this.offset = data.data.last_id
      } else {
        this.finished = true
      }
    },
    // 发布评论
    async onAddComment () {
      // 获取评论内容
      const commentText = this.commentText.trim()
      if (!commentText) {
        return
      }
      // 请求提交
      const { data } = await addComment({
        target: this.comment.com_id.toString(),
        content: commentText,
        art_id: this.$route.params.articleId // 文章id，对评论内容发表回复时，需要传递此参数，表明所属文章id。对文章进行评论，不要传此参数。
      })
      // 将最新添加的评论数据放到顶部展示
      this.list.unshift(data.data.new_obj)
      // 清空文本框
      this.commentText = ''
    },
    /**
     * 评论点赞/取消评论点赞
     */
    async onCommentLike (comment) {
      const commentId = comment.com_id.toString()
      // 如果已点赞，则取消点赞
      if (comment.is_liking) {
        await deleteCommentLike(commentId)
      } else {
        // 否则，点赞
        await addCommentLike(commentId)
      }
      comment.is_liking = !comment.is_liking
    },

    /**
     * 展示回复弹层
     */
    onReplyShow () {
      this.isReplyShow = true
    }
  }
}
</script>

<style scoped lang='less'>
.publish-wrap {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}

.van-list {
  margin-bottom: 45px;
}
</style>
