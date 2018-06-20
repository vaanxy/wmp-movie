// pages/comment-add/comment-add.js

const app = getApp();
const MAX_RECORD_TIME = 60000 // 最大录音时长(ms)
const MAX_RECORD_WIDTH = 500 // 录音条最大宽度(rpx)
const RECORD_OPTIONS = {
  duration: MAX_RECORD_TIME,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac',
  frameSize: 50
}
let innerAudioContext;
let recorderManager;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    containerHeight: 0,
    userInfo: null,
    commentType: 1, // 0: 文字; 1: 语音;
    movie: null,
    voice: null,
    text: '',
    textMaxLength: 255,
    recordBoundingRect: {},
    isRecording: false,
    isCancelRecording: false,
    isPlaying: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let commentType = +options.commentType;
    // commentType = 0;
    const movie = {
      id: +options.movieId,
      title: options.movieTitle,
      image: options.movieImage,
    };

    this.setData({
      movie,
      commentType
    });

    // 动态调整container的高度
    app.getWindowHeight({
      success: (windowHeight) => {
        this.setData({
          containerHeight: windowHeight - 320
        })
      }
    })

  },

  onInput(event) {
    // console.log(event);
    const text = event.detail.value;
    this.setData({
      text
    });
  },

  /**
   * 初始化录音器
   */
  initRecordManager() {
    if (this.data.commentType === 1) {
      wx.createSelectorQuery().in(this).select('#record').boundingClientRect((res) => {
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
      recorderManager = wx.getRecorderManager();
      recorderManager.onStart(() => {
        wx.vibrateShort()
        // 先停止当前正在播放的音频
        this.stop();
        this.setData({
          isRecording: true,
        });
      })
      recorderManager.onPause(() => {
        // console.log('recorder pause')
      })
      recorderManager.onStop((res) => {
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
   * 初始化音频播放控件
   */
  initInnerAudioContext() {
    if (!innerAudioContext) {
      innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.autoplay = false
      innerAudioContext.onPlay(() => {
        this.setData({
          isPlaying: true
        })
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      });

      innerAudioContext.onStop(() => {
        this.setData({
          isPlaying: false
        })
      });

      innerAudioContext.onEnded(() => {
        this.setData({
          isPlaying: false
        })
      });
    }
  },

  /**
   * 播放音频
   */
  play(src) {
    if (innerAudioContext) {
      innerAudioContext.src = src;
      innerAudioContext.play();
    }

  },

  /**
   * 停止播放音频
   */
  stop() {
    if (innerAudioContext) {
      innerAudioContext.stop();
    }
  },

  /**
   * 如果当前正在播放音频则停止，反之则播放
   */
  playOrStop(event) {
    const src = event.currentTarget.dataset.voice.tempFilePath;
    this.initInnerAudioContext();
    if (this.data.isPlaying) {
      this.stop();
    } else {
      this.play(src);
    }
  },



  addVoice(record) {
    // 计算录音条的长度，长度和时间的关系是圆的左上1/4弧的曲线
    record.width = Math.sqrt(1 - ((record.duration / MAX_RECORD_TIME) - 1) * ((record.duration / MAX_RECORD_TIME) - 1)) * MAX_RECORD_WIDTH;
    record.durationText = (record.duration / 1000).toFixed(0) + 's';
    this.setData({
      voice: record
    });
  },

  touchStart(event) {
    this.setData({
      voice: null
    });
    // console.log('start recording');
    const point = event.changedTouches[0];
    this.setData({
      isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
    });

    recorderManager.start(RECORD_OPTIONS)

  },

  touchCancel(event) {
    console.log('cancel')
    console.log(event)
    this.setData({
      isRecording: false
    })
  },

  touchEnd(event) {
    console.log('end recording')
    const point = event.changedTouches[0]
    this.setData({
      isRecording: false,
      isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
    })
    recorderManager.stop()

  },
  touchMove(event) {
    // console.log('move')
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

  preview() {
    let content = this.data.commentType ? JSON.stringify(this.data.voice) : this.data.text;
    wx.setStorage({
      key: 'comment-content',
      data: content,
      success: () => {
        wx.navigateTo({
          url: `/pages/comment-preview/comment-preview?commentType=${this.data.commentType}&movieId=${this.data.movie.id}&movieImage=${this.data.movie.image}&movieTitle=${this.data.movie.title}`,
        });
      },

    })
  },

  /**
   * 点击登录
   */
  onTapLogin() {
    wx.showLoading({
      title: '登陆中',
      mask: true
    });
    app.login({
      success: (userInfo) => {
        wx.hideLoading()
        wx.showToast({
          title: '登陆成功',
        })
        this.onLoginSuccess(userInfo);

      },
      error: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '登陆失败',
        })
        console.log(err);
      }
    })
  },

  /**
   * 登陆成功后设置userInfo, 并初始化录音管理器
   */
  onLoginSuccess(userInfo) {
    this.setData({
        userInfo
      },
      () => {
        this.initRecordManager();
      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.checkSession({
      success: (userInfo) => {
        this.onLoginSuccess(userInfo);
      },
      error: (err) => {
        console.log(err)
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if (innerAudioContext) {
      innerAudioContext.destroy();
      console.log(innerAudioContext);
    }
  },

})