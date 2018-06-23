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
    this.getMovieList()
  },
  searchMovie(event) {
    const { value, curor } = event.detail;
    console.log(value)
    const filteredMovieList = this.data.movieList.filter(movie => movie.title.toLowerCase().indexOf(value) >= 0);
    this.setData({
      filteredMovieList
    })
  },

  getMovieList() {
    wx.showLoading({
      title: '加载电影列表中',
    })
    qcloud.request({
      'url': config.service.movieList,
      success: res => {
        wx.hideLoading();
        if (!res.data.code) {
          let movieList = res.data.data
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
      }
    })
  }
})