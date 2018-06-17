// pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
/**
 * 主页用于显示精选影评
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieList: [],
    selectedMovie: null,
    swiperHeight: 0,
    pressedAnimation: {},
    isPressed: false
  },

  setSwiperHeight() {
    wx.getSystemInfo({
      success: (res) => {
        let swiperHeight = 750 / res.windowWidth * res.windowHeight;
        this.setData({
          swiperHeight
        });
      }
    })
    
  },

/**
 * 生命周期函数--监听页面加载
 */
onLoad: function (options) {
  this.setSwiperHeight();
  qcloud.request({
    'url': config.service.movieList,
    success: res => {
      let movieList = []
      if (!res.data.code) {
        movieList = res.data.data
        this.setData({
          movieList
        })
      }
      console.log(res)
    }
  })
},
  pressed() {
    console.log('pressed')
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
    })

    animation
      .scale(0.95).step()
    this.setData({
      pressedAnimation: animation.export(),
      isPressed: true
    });
  },

  touchMove() {
    console.log('touchMove')
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
    })

    animation
      .scale(1).step()
    
    this.setData({
      pressedAnimation: animation,
      isPressed: false
    });
  },
  
touchEnd() {
  if (this.data.isPressed) {
    console.log('animate')
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
    })

    animation
      .translateY(-300).scale(1.3).step()

    this.setData({
      pressedAnimation: animation.export(),
      isPressed: false
    });

    this.setData({
      selectedMovie: this.data.movieList[0]
    });
  }
  
  
},
close() {
  let animation = wx.createAnimation({
    duration: 300,
    timingFunction: 'ease-out',
  })
  animation
    .scale(1).translateY(0).step();

  this.setData({
    pressedAnimation: animation.export()
  });
  setTimeout(() => {
    this.setData({
      selectedMovie: null
    });
  }, 400)
  
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