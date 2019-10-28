<template>
  <div>
      <van-nav-bar
      title="个人信息"
      left-arrow
      right-text="保存"
      @click-right="onSave"
       />
    <van-cell-group>
        <van-cell title="头像" is_link @click="onChangePhoto">
            <van-image
            round
            width="30"
            height="30"
            :src="user.photo"/>
        </van-cell>
        <van-cell
        title="昵称"
        :value="user.name"
        is-like
        @click="isEditNameShow = true" />
        <van-cell
        title="性别"
        :value="user.gender === 0 ? '男' :'女'"
        is-like
        @click="isEitGenderShow=true" />
        <van-cell
        title="生日"
        :value="user.birthday"
        is-like
        @click="isEditBirthdayShow=true" />
    </van-cell-group>
<!-- 表单元素的hidden表示隐藏这个表单元素 -->
<input type="file" hidden ref="file" @change="onFileChange">
  <!-- 编辑用户昵称弹窗 -->
  <van-dialog
  v-model="isEditNameShow"
  title="用户昵称"
  show-cancel-button
  @confirm="onUserNameConfirm"
  >
<van-field
 placeholder="请输入用户名"
:value="user.name"
@input="onUserNameInput" />
  </van-dialog>
  <!-- 编辑用户昵称上拉菜单 -->
  <van-action-sheet
  v-model="isEitGenderShow"
  :actions="actions"
  cancel-text="取消"
  @select="onSelect" />
  <!-- 编辑用户生日 -->
  <van-popup
  v-model="isEditBirthdayShow"
  position="bottom"
  :style="{height:'30%'}">
  <van-datetime-picker
  type="date"
  @confirm="onUserBirthdayConfirm"
  @cancel="isEditBirthdayShow=false" />

  </van-popup>
  </div>
</template>

<script>
import { getProfile, updateUserPhoto, updateUserProfile } from '@/api/user'
import dayjs from 'dayjs'
export default {
  name: 'UserIndex',
  data () {
    return {
      user: {},
      isEditNameShow: false,
      inputUserName: '', // 存储编辑用户名字的输入框数据
      isEitGenderShow: false, // 控制编辑性别的上拉菜单的显示状态
      actions: [
        // 上拉菜单的数据
        // name会当成文本输出渲染
        // value是我自己自定义添加的
        { name: '男', value: 0 },
        { name: '女', value: 1 }
      ],
      isEditBirthdayShow: false //

    }
  },
  created () {
    this.loadUserProfile()
  },
  methods: {
    async loadUserProfile () {
      const { data } = await getProfile()
      this.user = data.data
    },
    onChangePhoto () {
      this.$refs.file.click()
    },
    onFileChange () {
      const fileObj = this.$refs.file.files[0]
      if (fileObj) {
        this.user.photo = window.URL.createObjectURL(fileObj)
      }
    },
    async onSave () {
      // 如果 Content-Type要求application/json data 传普通对象 {}
      // 如果 Content-Type 要求是multipart/form-data，则 data 传 FormData 对象
      // 纵观所有数据接口，你会发现大多数的接口都要求 Content-Type 要求是application/json
      // 一般只有涉及到文件上传的数据接口才要求Content-Type 要求是multipart/form-data
      // 这个时候传递一个 FormData 对象
      this.$toast.loading({
        duration: 0, // 持续展示toast
        forbidClick: true, // 禁止背景点击
        loadingType: 'spinner',
        message: '保存中'
      })
      try {
        const fileObj = this.$refs.file.files[0]
        // 如果用户选择了新的头像就更新
        if (fileObj) {
          const formData = new FormData()
          formData.append('photo', fileObj)
          await updateUserPhoto(formData)
        }
        // 更新用户其他文本信息
        await updateUserProfile({
          name: this.user.name,
          gender: this.user.gender,
          birthday: this.user.birthday
        })
        this.$toast.success('保存成功')
      } catch (err) {
        console.log(err)
        this.$toast.fail('保存失败')
      }
    },
    onUserNameConfirm () {
      this.user.name = this.inputUserName
    },
    onUserNameInput (value) {
      this.inputUserName = value
    },
    onSelect (item) {
      // 修改数据
      this.user.gender = item.value
      // 关闭上拉菜单
      this.isEitGenderShow = false
    },
    onUserBirthdayConfirm (value) {
      // 更新数据
      this.user.birthday = dayjs(value).format('YYYY-MM-DD')
      // 关闭弹层
      this.isEditBirthdayShow = false
    }
  }
}
</script>

<style>

</style>
