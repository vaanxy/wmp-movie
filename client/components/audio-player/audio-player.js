// components/audio-player/audio-player.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    audio: {
      type: Object,
      value: null,
      observer: function(newData, oldData) {
        if (newData) {
          this._preprocess(newData, this.data.maxAudioDuration);
        }
      }
    },
    maxAudioDuration: {
      type: Number,
      value: 60000, // 单位ms
      observer: function(newData, oldData) {
        if (newData && this.data.audio) {
          this._preprocess(this.data.audio, newData);
        }
      }
    },
    isPlaying: {
      type: Boolean,
      value: false
    }

    // audioContext: {
    //   type: Object,
    //   value: null,
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    widthRatio: 1,
    durationText: '0s',
    // isPlaying: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tapPlayer() {
      this.triggerEvent('tapplayer', { src: this.data.audio.src });
    },
    /**
     * 计算音频时长宽度比
     * 格式化时长字符串
     */
    _preprocess(audio, maxAudioDuration) {
      // 为了使短时间之间的宽度有较明显的区别，因此计算录音条的长度时不采用线性函数 y = x
      // 长度和时间的关系是圆的左上1/4弧的曲线
      const widthRatio = Math.sqrt(1 - ((audio.duration / this.data.maxAudioDuration) - 1) * ((audio.duration / this.data.maxAudioDuration) - 1));
      const durationText = (audio.duration / 1000).toFixed(0) + 's';
      this.setData({
        widthRatio,
        durationText
      })
    }
  }
})