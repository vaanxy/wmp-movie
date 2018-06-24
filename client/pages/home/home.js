// pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

const app = getApp();
/**
 * 主页用于显示精选影评
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    recommendList: [],
    selectedMovie: null,
    swiperHeight: 0,
    pressedAnimation: {},
    isPressed: false
  },

  /**
   * 动态这是swiper的高度
   */
  setSwiperHeight() {
    app.getWindowHeight({
      success: (swiperHeight) => {
        this.setData({
          swiperHeight
        });
      }
    });
  },

  /**
   * 获取推荐影评信息
   */
  getRecommends(cb) {
    wx.showLoading({
      title: '推荐中...',
    });
    qcloud.request({
      'url': config.service.recommend,
      login: true,
      success: res => {
        wx.hideLoading();
        let recommendList = []
        if (!res.data.code) {
          recommendList = res.data.data
          this.setData({
            recommendList
          });
          wx.showToast({
            title: '推荐成功',
          });

        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '推荐失败',
          });
        }

      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          image: '../../images/error.png',
          title: '推荐失败',
        });
      },
      complete: () => {
        cb && cb();
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setSwiperHeight();
  },

  /**
   * 跳转至评论详情页
   */
  toCommentDetail(event) {
    const commentId = event.currentTarget.dataset.comment.id;
    const movieId = event.currentTarget.dataset.comment.movieId;
    wx.navigateTo({
      url: '/pages/comment-detail/comment-detail?commentId=' + commentId + '&movieId=' + movieId,
    });
  },

  /**
   * 跳转至电影详情页
   */
  toMovieDetail(event) {
    const movieId = event.currentTarget.dataset.comment.movieId;
    wx.navigateTo({
      url: '/pages/movie-detail/movie-detail?id=' + movieId,
    });
  },

  /**
   * 登陆成功后设置userInfo, 并初始化录音管理器
   */
  onLoginSuccess(userInfo) {
    this.getRecommends();
    this.setData({
      userInfo
    });
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
          image: '../../images/error.png',
          title: '登陆失败',
        })
        console.log(err);
      }
    })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getRecommends(() => wx.stopPullDownRefresh());
  }
})