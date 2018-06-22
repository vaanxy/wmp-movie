// components/comment-editor/comment-editor.js
const MAX_RECORD_TIME = 60000 // 最大录音时长(ms)
const RECORD_OPTIONS = {
  duration: MAX_RECORD_TIME,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac',
  frameSize: 50
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    commentType: {
      type: Number,
      value: 0 // 0: 文字; 1: 语音;
    },
    voice: null,
    rating: {
      type: Number,
      value: 0
    },
    text: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    textMaxLength: 255,
    recordBoundingRect: {},
    isRecording: false,
    isCancelRecording: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
 * 用户打分的触发事件
 */
    onRating(event) {
      this.setData({
        rating: event.detail.score
      });
      this.triggerEvent('rated', { rating: event.detail.score });
    },

    /**
     * 用户输入影评时的触发事件
     */
    onInput(event) {
      const text = event.detail.value;
      this.setData({
        text
      });
      this.triggerEvent('input', {text: text});
    },

    /**
     * 初始化录音器
     */
    initRecordManager() {
      if (this.data.commentType === 1) {
        wx.createSelectorQuery().in(this).select('.recorder').boundingClientRect((res) => {
          console.log(res)
          this.setData({
            recordBoundingRect: {
              top: res.top,
              left: res.left,
              right: res.right,
              bottom: res.bottom
            }
          })
        }).exec();
        this.recorderManager = wx.getRecorderManager();
        this.recorderManager.onStart(() => {
          wx.vibrateShort()
          // 先停止当前正在播放的音频
          // this.stop();
          if (this.currentAudioContext) {
            this.currentAudioContext.stop();
          }
          this.setData({
            isRecording: true,
          });
        })
        this.recorderManager.onPause(() => {
          console.log('recorder pause')
        })
        this.recorderManager.onStop((res) => {
          this.setData({
            isRecording: false,
          });
          if (!this.data.isCancelRecording) {
            this.addVoice(res)
          }
        })
      }
    },

    addVoice(record) {
      console.log(record);
      record.src = record.tempFilePath;
      this.setData({
        voice: record
      });
      this.triggerEvent('recorded', { voice: record });
    },

    touchStart(event) {
      this.setData({
        voice: null
      });
      const point = event.changedTouches[0];
      this.setData({
        isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
      });

      this.recorderManager.start(RECORD_OPTIONS)

    },

    touchCancel(event) {
      console.log('cancel')
      console.log(event)
      this.setData({
        isRecording: false
      })
    },

    touchEnd(event) {
      // console.log('end recording')
      const point = event.changedTouches[0]
      this.setData({
        isRecording: false,
        isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
      })
      this.recorderManager.stop()

    },

    touchMove(event) {
      const point = event.changedTouches[0]
      this.setData({
        isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
      })
    },

    /**
     * 判断当前手指触摸位置是否在录音按钮内部
     */
    isInBoundingRect(x, y) {
      let rect = this.data.recordBoundingRect;
      return (y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right)
    },

    tapPlayer(event) {
      this.currentAudioContext = event.detail.audioContext;
    }
  },
  ready() {
    this.initRecordManager();
  }
})
