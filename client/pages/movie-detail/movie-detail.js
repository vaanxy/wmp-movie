// pages/movie-detail/movie-detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

const actionTexts = ["文字", "语音"];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: null
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
        console.log(res)
        if (!res.data.code) {
          const movie = res.data.data;
          this.setData({
            movie
          })
        } else {
          wx.showToast({
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
          title: '加载失败..',
        });
      }
    })
  },

  /**
   * 打开action sheet选择是语音影评还是文字影评
   */
  showActionSheet() {
    wx.showActionSheet({
      itemList: actionTexts,
      success: (res) => {
        // console.log(res.tapIndex)
        this.toAddComment(res.tapIndex);
      },
      fail: (res) => {
        console.log(res.errMsg);
        wx.showToast({
          title: '选择失败，请重试',
        })
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

  toCommentList() {
    if (!this.data.movie) return;
    const movieId = this.data.movie.id;
    wx.navigateTo({
      url: '/pages/comment-list/comment-list?movieId=' + movieId,
    });
  },


  /**
   * 生命周期函数--监听页面加载
   * 页面加载时根据传入参数id获取电影详情，
   * 若传入参数有误，则提示，并返回电影列表页面
   */
  onLoad: function (options) {
    const movieId = +options.id;
    if (!isNaN(movieId)) {
      this.getMovie(movieId);
    } else {
      wx.showToast({
        icon: 'none',
        title: '错误: 未知电影',
      })
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
    
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