// pages/movie-list/movie-list.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieList: [],
    filteredMovieList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 每次添加评论之后返回该页面，由于电影评分变了，所以得刷新电影列表，所以在onShow中调用获取电影列表的函数
   */
  onShow() {
    this.getMovieList();
  },

  searchMovie(event) {
    const { value, curor } = event.detail;
    const filteredMovieList = this.data.movieList.filter(movie => movie.title.toLowerCase().indexOf(value) >= 0);
    this.setData({
      filteredMovieList
    })
  },

  getMovieList(cb) {
    wx.showLoading({
      title: '加载电影列表中',
    })
    qcloud.request({
      'url': config.service.movieList,
      success: res => {
        wx.hideLoading();
        if (!res.data.code) {
          let movieList = res.data.data ? res.data.data : [];
          movieList = movieList.map((movie) => {
            return Object.assign({}, movie, {avgRating: movie.avgRating.toFixed(1)});
          });
          const filteredMovieList = [...movieList]
          this.setData({
            movieList,
            filteredMovieList
          })
          wx.showToast({
            title: '加载成功'
          });
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '加载失败'
          });
        }
        
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          image: '../../images/error.png',
          title: '加载失败'
        });
        console.log(err)
      },
      complete: () => {
        cb && cb();
      }
    })
  }
})