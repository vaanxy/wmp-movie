// pages/comment-preview/comment-preview.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

const app = getApp();
let innerAudioContext;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    content: null,
    movie: null,
    isPlaying: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let commentType = +options.commentType;
    const movie = {
      id: +options.movieId,
      title: options.movieTitle,
      image: options.movieImage,
    };
    // commentType = 0;
    let content = wx.getStorage({
      key: 'comment-content',
      success: (res) => {
        console.log(res);
        content = commentType ? JSON.parse(res.data) : res.data;
        this.setData({
          movie,
          content,
          commentType
        });
      },
    })
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
        this.setData({
          isPlaying: false
        })
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

  /**
   * 返回编辑页面
   */
  backToEdit() {
    wx.navigateBack();
  },

  uploadVoice(cb) {
    if (this.data.commentType === 1) {
      wx.uploadFile({
        url: config.service.uploadUrl,
        filePath: this.data.content.tempFilePath,
        name: 'file',
        success: res => {
          let data = JSON.parse(res.data)
          console.log(data)

          if (!data.code) {
            const voice = {
              duration: this.data.content.duration,
              durationText: this.data.content.durationText,
              width: this.data.content.width,
              src: data.data.imgUrl
            }
            const content = JSON.stringify(voice);
            cb && cb(content);
          } else {
            wx.showToast({
              title: '发布失败',
            });
          }
        },
        fail: (err) => {
          console.log(err)
          wx.showToast({
            title: '发布失败',
          });
        }
      })
    } else {
      cb && cb(this.data.content);
    }
  },

  publish() {
    wx.showLoading({
      title: '正在发布...',
    });
    this.uploadVoice((content) => {
      qcloud.request({
        url: config.service.commentAdd,
        isLogin: true,
        method: 'POST',
        data: {
          movieId: this.data.movie.id,
          content: content,
          rating: 5,
          commentType: this.data.commentType
        },
        success: (res) => {
          console.log(res);
          wx.showToast({
            title: '发布成功',
          });
        },
        fail: (err) => {
          console.log(err);
          wx.showToast({
            title: '发布失败',
          });
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    });
    // 此处使用redirectTo是为了防止用户点击返回，又返回了预览页面
    // wx,wx.redirectTo({
    //   url: '/pages/comment-list/comment-list',
    // })
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
   * 登陆成功后设置userInfo
   */
  onLoginSuccess(userInfo) {
    console.log(userInfo)
    this.setData({
      userInfo
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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