// components/comment-editor/comment-editor.js
const MAX_RECORD_TIME = 60000 // 最大录音时长(ms)
const RECORD_OPTIONS = {
  duration: MAX_RECORD_TIME,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50,
  authType: UNPROMPTED
}

const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;


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
      this.triggerEvent('rated', {
        rating: event.detail.score
      });
    },

    /**
     * 用户输入影评时的触发事件
     */
    onInput(event) {
      const text = event.detail.value;
      this.setData({
        text
      });
      this.triggerEvent('input', {
        text: text
      });
    },

    /**
     * 打开用户设置完成设置并关闭后执行的函数
     * 根据用户设置配置录音权限
     */
    openSetting(event) {
      console.log(event)
      let auth = event.detail.authSetting['scope.record'];
      const authType = auth ? AUTHORIZED : (auth === false ? UNAUTHORIZED : UNPROMPTED);
      this.setData({
        authType
      });
      if (authType === AUTHORIZED) {
        this.initRecordManager();
      }
    },

    /**
     * 获取录音权限
     */
    getRecordAuth() {
      wx.getSetting({
        success: res => {
          console.log(res);
          let auth = res.authSetting['scope.record'];
          if (!auth) {
            wx.authorize({
              scope: 'scope.record',
              success:() => {
                // 用户已经同意小程序使用录音功能，初始化录音器
                this.setData({
                  authType: AUTHORIZED
                });
                this.initRecordManager();
              },
              fail:() => {
                this.setData({
                  authType: UNAUTHORIZED
                });
              }
            })
          } else {
            const authType = auth ? AUTHORIZED : (auth === false ? UNAUTHORIZED : UNPROMPTED);
            this.setData({
              authType
            });
            if (authType === AUTHORIZED) {
              this.initRecordManager();
            }
          }
        }
      });
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

    /**
     * 添加录音结果，并抛出录音完成recorded的事件
     */
    addVoice(record) {
      console.log(record);
      record.src = record.tempFilePath;
      this.setData({
        voice: record
      });
      this.triggerEvent('recorded', {
        voice: record
      });
    },

    /**
     * 开始点击触摸按钮
     */
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

    /**
     * 触摸被打断取消时结束录音
     */
    touchCancel(event) {
      this.setData({
        isRecording: false
      })
    },

    /**
     * 触摸录音按钮结束时，若触摸点在录音按钮内，则完成录音，否则为取消录音
     */
    touchEnd(event) {
      const point = event.changedTouches[0]
      this.setData({
        isRecording: false,
        isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
      })
      this.recorderManager.stop()

    },

    /**
     * 点击录音按钮手指移动时
     * 如果触摸点不在录音按钮内则标记正在取消录音
     * 否则标记正在录音
     */
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

    /**
     * 电影音频条时，抛出audioContex可供父级组件控制音频播放
     */
    tapPlayer(event) {
      this.currentAudioContext = event.detail.audioContext;
    }
  },

  ready() {
    // 若为语音影评则首先要询问用户获取录音权限
    if (this.data.commentType === 1) {
      this.getRecordAuth();
    }
    
  }
})