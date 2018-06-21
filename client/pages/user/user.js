// pages/user/user.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp()
let innerAudioContext;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    activedTab: 'published',
    currentPlayingCommentId: null,
    isPlaying: false,
    myFaveComments: [],
    myPublishedfaveComments: []
  },

  /**
   * 点击选项卡切换列表页
   */
  onTapTab(event) {
    const tab = event.currentTarget.dataset.tab;
    this.setData({
      activedTab: tab
    });
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
        console.log(res.errMsg);
        console.log(res.errCode);
        this.setData({
          isPlaying: false,
          currentPlayingCommentId: null
        });
      });

      innerAudioContext.onStop(() => {
        this.setData({
          isPlaying: false,
          currentPlayingCommentId: null
        })
      });

      innerAudioContext.onEnded(() => {
        this.setData({
          isPlaying: false,
          currentPlayingCommentId: null
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
    const src = event.detail.src;
    const commentId = event.currentTarget.dataset.comment.id;
    this.initInnerAudioContext();
    if (commentId !== this.data.currentPlayingCommentId) {
      this.play(src);
    } else {
      if (this.data.isPlaying) {
        this.stop();
      } else {
        this.play(src);
      }
    }
    this.setData({
      currentPlayingCommentId: commentId
    });


  },
  /**
   * 获取我发布的影评列表 
   */
  getMyPublishedComments() {
    qcloud.request({
      url: config.service.myPublishedComments,
      login: true,
      success: (res) => {
        if (!res.data.code) {
          const myPublishedComments = res.data.data;
          myPublishedComments.forEach(comment => {
            comment.content = comment.commentType === 0 ? comment.content : JSON.parse(comment.content);
          })
          this.setData({
            myPublishedComments
          })
        }
      },
      fail: (err) => {
        console.log(err);
      }
    });
  },

  /**
   * 获取我收藏的影评列表
   */
  getMyFaveComments() {
    qcloud.request({
      url: config.service.myFaveComments,
      login: true,
      success: (res) => {
        if (!res.data.code) {
          const myFaveComments = res.data.data;
          myFaveComments.forEach(comment => {
            comment.content = comment.commentType === 0 ? comment.content : JSON.parse(comment.content);
          })
          this.setData({
            myFaveComments
          })
        }
      },
      fail: (err) => {
        console.log(err);
      }
    });
  },

  /**
 * 用户点击登陆
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
          image: '../../images/error.png',
          title: '登陆失败',
        })
        console.log(err);
      }
    })
  },

  onLoginSuccess(userInfo) {
    this.setData({
      userInfo
    });
    this.getMyPublishedComments();
    this.getMyFaveComments();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
})