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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    widthRatio: 1,
    durationText: '0s',
    isPlaying: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    tapPlayer() {
      if (this.data.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
      this.triggerEvent('tapplayer', { audioContext: this.audioContext });
    },

    /**
     * 初始化音频播放控件
     */
    initInnerAudioContext() {
      if (!this.audioContext) {
        this.audioContext = wx.createInnerAudioContext();
        this.audioContext.autoplay = false
        this.audioContext.onPlay(() => {
          this.setData({
            isPlaying: true
          })
        });

        this.audioContext.onError((res) => {
          console.log(res.errMsg)
          console.log(res.errCode)
          this.setData({
            isPlaying: false
          });
        });

        this.audioContext.onStop(() => {
          this.setData({
            isPlaying: false
          });
        });

        this.audioContext.onEnded(() => {
          this.setData({
            isPlaying: false
          })
        });
      }
    },

    /**
     * 播放音频
     */
    play() {
      if (this.audioContext) {
        if (this.data.audio) {
          this.audioContext.src = this.data.audio.src;
          this.audioContext.play();
        }
      }
    },

    /**
     * 停止播放音频
     */
    stop() {
      if (this.audioContext) {
        this.audioContext.stop();
      }
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
  },

  attached() {
    this.initInnerAudioContext();
  },
  
  detached() {
    if (this.audioContext) {
      this.audioContext.destroy();
    }
  }
})