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
    console.log(event)
    const { value, curor } = event.detail;
    console.log(value)
    const filteredMovieList = this.data.movieList.filter(movie => movie.title.toLowerCase().indexOf(value) >= 0);
    this.setData({
      filteredMovieList
    })
  },

  getMovieList() {
    qcloud.request({
      'url': config.service.movieList,
      success: res => {
        if (!res.data.code) {
          let movieList = res.data.data
          console.log(movieList);
          movieList = movieList.map((movie) => {
            return Object.assign({}, movie, {avgRating: movie.avgRating.toFixed(2)});
          });
          console.log(movieList);
          const filteredMovieList = [...movieList]
          this.setData({
            movieList,
            filteredMovieList
          })
        }
        console.log(res)
      }
    })
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