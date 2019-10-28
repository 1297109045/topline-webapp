<template>
  <div class="login">
      <van-nav-bar title="标题"/>
      <!-- 登录表单 -->
<ValidationObserver ref="loginForm">
<van-cell-group>
<ValidationProvider name="手机号" rules="required|photo" v-slot="{ errors }">
  <van-field
  v-model="user.mobile"
    required
    clearable
    label="手机号"
    placeholder="请输入手机号"
    :error-message="errors[0]"
  />
</ValidationProvider>
<ValidationProvider name="验证码" rules="required|max:6" v-slot="{ errors }">
  <van-field
  v-model="user.code"
    type="password"
    label="验证码"
    placeholder="请输入验证码"
    required
    :error-message="errors[0]"
  />
</ValidationProvider>
</van-cell-group>
</ValidationObserver>
<!-- 表单验证 -->
<div class="btn-wrap">
<van-button class="btn" type="info" @click="onLogin">登录</van-button>

</div>
  </div>
</template>

<script>

import { login } from '@/api/user'
import { setItem } from '@/utils/storage'

export default {
  name: 'LoginIndex',
  data () {
    return {
      user: {
        mobile: '15200000000',
        code: '246810'
      }
    }
  },
  methods: {
    async onLogin () {
      // 表单验证
      const isValid = await this.$refs.loginForm.validate()
      // 如果表单验证失败,阻止表单提交
      if (!isValid) {
        return
      }
      // 表单验证
      // 通过验证.loading,请求
      const toast = this.$toast.loading({
        duration: 0, // 持续展示toast
        forbidClick: true, // 禁用背景点击
        loadingType: 'spinner',
        message: '登陆中'
      })

      try {
        // 请求提交表单数据
        const { data } = await login(this.user)
        console.log(data)
        // 先清除loading
        toast.clear()
        // 在提示登录成功
        this.$toast.success('登录成功')
        // 登录成功
        this.$router.push(this.$route.query.redirect || '/')
        // 登录成功,将数据存储到容器中
        this.$store.commit('setUser', data.data)
        // 为了防止页面刷新数据丢失,将数据存储到本地存储
        setItem('user', data.data)
      } catch (err) {
        if (err.response && err.response.status === 400) {
          this.$toast.fail('登陆失败,手机号或验证码错误')
        }
      }
    }

  }
}
</script>

<style lang="less" scoped>
    .login{
        .btn-wrap{
            padding:20px;
             .btn{
                width:100%;
                background-color: #6db4fb;
                color:#fff;

        }

    }}
</style>
