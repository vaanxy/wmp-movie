// pages/user/user.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    activedTab: 'published',
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
    if (tab === 'published') {
      this.getMyPublishedComments();
    } else {
      this.getMyFaveComments();
    }
  },

  /**
   * 点击音频播放后，先停止当前播放的audioContext，在将本次播放的audioContext设为当前audioContext
   */
  tapPlayer(event) {
    const audioContext = event.detail.audioContext;
    if (this.currentAudioContext && this.currentAudioContext !== audioContext) {
      this.currentAudioContext.stop()
    }
    this.currentAudioContext = audioContext;
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
   * 取消收藏
   */
  unFave(event) {
    const comment = event.currentTarget.dataset.comment;
    qcloud.request({
      url: config.service.toggleFave,
      login: true,
      method: 'PUT',
      data: {
        movieId: comment.movieId,
        commentId: comment.id
      },
      success: () => {
        wx.showToast({
          title: '取消收藏成功',
        });
        let myFaveComments = [...this.data.myFaveComments];
        myFaveComments = myFaveComments.filter(c => c.id !== comment.id);
        this.setData({
          myFaveComments: myFaveComments
        });
      },
      fail: (err) => {
        console.log(err);
        wx.showToast({
          title: '取消收藏失败',
        });
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
   * 跳转至评论详情页
   */
  toDetail(event) {
    const commentId = event.currentTarget.dataset.comment.id;
    const movieId = event.currentTarget.dataset.comment.movieId;
    wx.navigateTo({
      url: '/pages/comment-detail/comment-detail?commentId=' + commentId + '&movieId=' + movieId,
    });
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