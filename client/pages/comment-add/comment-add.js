// pages/comment-add/comment-add.js
const recorderManager = wx.getRecorderManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    voiceList: [],
    recordBoundingRect: {},
    isRecording: false,
    isCancelRecording: false,
    isPlaying: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    recorderManager.onStart(() => {
      console.log('recorder start')
      wx.vibrateShort()
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
    })
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      if (this.data.isCancelRecording) {

      } else {
        this.addVoice(res)
      }
      
    })
    // recorderManager.onFrameRecorded((res) => {
    //   const { frameBuffer } = res
    //   console.log('frameBuffer', frameBuffer)
    //   const buffer = new Uint8Array(frameBuffer)
    //   // const hex = Array.prototype.map.call(new Uint8Array(frameBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    //   // console.log(a[0])
    //   console.log(buffer)
    //   let voice = 0;
    //   for (let i = 0; i < buffer.length; i++) {
    //     voice += buffer[i] * buffer[i];
    //   }
    // // 平方和除以数据总长度，得到音量大小。
    //   let mean = voice / buffer.length;
    //   let volume = 10 * Math.log10(mean);
    //   console.log("分贝值:" + volume);
    // })
  },

  play(event) {
    if (this.data.isPlaying) return
    const src = event.currentTarget.dataset.voice.tempFilePath
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = false
    innerAudioContext.src = src
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
      this.setData({
        isPlaying: true
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.play()
    innerAudioContext.onStop(() => {
      this.setData({
        isPlaying: false
      })
    })

    innerAudioContext.onEnded(() => {
      this.setData({
        isPlaying: false
      })
    })
  },

  addVoice(record) {
    record.width = Math.sqrt(1 - ((record.duration / 60000) - 1) * ((record.duration / 60000) - 1))
    this.setData({
      voiceList: [...this.data.voiceList, record]
    })
  },

  touchStart(event) {
    // wx.vibrateLong()
    console.log('start recording')
    const point = event.changedTouches[0]
    this.setData({
      isRecording: true,
      isCancelRecording: !this.isInBoundingRect(point.pageX, point.pageY)
    })
    const options = {
      duration: 600000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }

    recorderManager.start(options)
    
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

  isInBoundingRect(x, y) {
    let rect = this.data.recordBoundingRect;
    return (y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})