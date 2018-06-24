// pages/movie-detail/movie-detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index');
const config = require('../../config');

const app = getApp();
const actionTexts = ["文字", "语音"];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieId: null,
    movie: null,
    userInfo: null,
    myCommentId: null //当前电影我所写的影评id，如果没有写过则为null
  },

  /**
   * 根据id获取电影详情信息
   */
  getMovie(id) {
    wx.showLoading({
      title: '加载电影信息中..',
    })
    qcloud.request({
      url: config.service.movieDetail + id,
      success: (res) => {
        wx.hideLoading();
        if (!res.data.code) {
          const movie = res.data.data;
          this.setData({
            movie
          })
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '加载失败..',
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 2000)
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err);
        wx.showToast({
          image: '../../images/error.png',
          title: '加载失败..'
        });
      }
    })
  },

  /**
   * 跳转至我的评论
   */
  toMyComment() {
    wx.navigateTo({
      url: '/pages/comment-detail/comment-detail?commentId=' + this.data.myCommentId + '&movieId=' + this.data.movieId,
    });
  },

  /**
   * 打开action sheet选择是语音影评还是文字影评
   */
  showActionSheet() {
    wx.showActionSheet({
      itemList: actionTexts,
      success: (res) => {
        this.toAddComment(res.tapIndex);
      },
      fail: (res) => {
        console.log(res.errMsg);
      }
    })
  },

  /**
   * 带参数commentType跳转至添加评论页面
   * @param commentType: 评论类型
   *  0: 文字;
   *  1: 语音;
   *  
   */
  toAddComment(commentType) {
    wx.navigateTo({
      url: `/pages/comment-add/comment-add?commentType=${commentType}&movieId=${this.data.movie.id}&movieImage=${this.data.movie.image}&movieTitle=${this.data.movie.title}`,
    });
  },

  /**
   * 前往影评列表
   */
  toCommentList() {
    if (!this.data.movie) return;
    const movieId = this.data.movie.id;
    wx.navigateTo({
      url: '/pages/comment-list/comment-list?movieId=' + movieId,
    });
  },

  /**
   * 获取当前用户是否为该电影写过影评的记录，
   * 若编写过影评则只能跳转至该用户所写的影评，而不能再次为该电影添加新的影评
   */
  getMyMovieComment(movieId) {
    qcloud.request({
      url: config.service.myComment + movieId,
      success: (res) => {
        if (!res.data.code) {
          const comment = res.data.data;
          if (comment) {
            this.setData({
              myCommentId: comment.id
            })
          }

        }
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   * 页面加载时根据传入参数id获取电影详情，
   * 若传入参数有误，则提示，并返回电影列表页面
   */
  onLoad: function(options) {
    const movieId = +options.id;
    this.setData({
      movieId
    });
    if (!isNaN(movieId)) {
      this.getMovie(movieId);
    } else {
      wx.showToast({
        image: '../../images/error.png',
        title: '错误: 未知电影',
      })
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
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

  /**
   * 登陆成功后获取用户点赞和收藏信息，并绑定显示
   */
  onLoginSuccess(userInfo) {
    this.setData({
      userInfo
    });
    this.getMyMovieComment(this.data.movieId);
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