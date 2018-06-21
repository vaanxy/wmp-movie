// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tips: {
      type: String,
      value: '请先登陆'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapLogin() {
      this.triggerEvent('login')
    }

  }
})
