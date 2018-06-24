// components/rating.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    score: {
      type: Number,
      value: 0
    },
    disabled: {
      type: Boolean,
      value: false
    },
    size: {
      type: String,
      value: 'md' //sm md lg
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
    /**
     * 记录打分结果，如果是disabled则不记录打分结果
     */
    rating($event) {
      if (this.data.disabled) return;
      let score = +$event.currentTarget.dataset.score
      this.setData({
        score
      });
      this.triggerEvent("rating", { score: score });
    }
  }
})
