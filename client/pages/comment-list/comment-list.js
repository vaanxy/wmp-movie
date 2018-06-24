// pages/comment-list/comment-list.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const util = require('../../utils/util')

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    movieId: 0,
    isPlaying: false,
    currentPlayingCommentId: null,
    commentList: [],
    isLikeList: [],
    isFaveList: []
  },

  /**
   * 根据movieId获取该id的所有影评信息
   * @param: movieId
   * @param:cb 调用接口成功后执行的回调函数
   */
  getCommentList(movieId, cb) {
    wx.showLoading({
      title: '加载评论列表',
    });
    qcloud.request({
      url: config.service.commentList + movieId,
      success: (res) => {
        wx.hideLoading();
        if (!res.data.code) {
          const commentList = res.data.data.map((comment) => {
            let data = {};
            let date = new Date(comment.createTime);
            data.createTime = util.formatTime(date);
            if (comment.commentType === 1) {
              data.content = JSON.parse(comment.content);
            }
            return Object.assign({}, comment, data);
          });
          this.setData({
            commentList
          });
          wx.showToast({
            title: '获取评论成功',
          })
          cb && cb();
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '获取评论失败',
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          image: '../../images/error.png',
          title: '获取评论失败',
        })
      }
    })
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
   * 当用户登录后获取该电影下所有评论用户是否收藏的信息
   * @param: movieId 电影id
   */
  setFaveList(movieId) {
    qcloud.request({
      url: config.service.faveList + movieId,
      login: true,
      success: (res) => {
        if (!res.data.code) {
          const faveList = res.data.data.map(d => d.commentId);
          let isFaveList = []
          this.data.commentList.forEach((comment) => {
            isFaveList[comment.id] = faveList.indexOf(comment.id) >= 0
          });
          this.setData({
            isFaveList
          })
        }
      },
      fail: (err) => {
        console.log(err);
      }

    });
  },

  /**
   * 当用户登录后获取该电影下所有评论用户是否"喜欢"的信息
   * @param: movieId 电影id
   */
  setLikeList(movieId) {
    qcloud.request({
      url: config.service.likeList + movieId,
      login: true,
      success: (res) => {
        if (!res.data.code) {
          const likeList = res.data.data.map(d => d.commentId);
          let isLikeList = []
          this.data.commentList.forEach((comment) => {
            isLikeList[comment.id] = likeList.indexOf(comment.id) >= 0
          });
          this.setData({
            isLikeList
          })
        }
      },
      fail: (err) => {
        console.log(err);
      }

    });
  },

  /**
   * 点赞表示喜欢
   */
  toggleLike(event) {
    if (!this.data.userInfo) {
      wx.showToast({
        image: '../../images/warning.png',
        title: '登录后才能点赞',
      })
      return;
    }
    const comment = event.currentTarget.dataset.comment;
    qcloud.request({
      url: config.service.toggleLike,
      method: 'PUT',
      login: true,
      data: {
        movieId: this.data.movieId,
        commentId: comment.id
      },
      success: (res) => {
        if (!res.data.code) {
          let isLikeList = [...this.data.isLikeList];
          let commentList = [...this.data.commentList];
          isLikeList[comment.id] = !isLikeList[comment.id];
          let isLike = isLikeList[comment.id]
          commentList.forEach((c) => {
            if (c.id === comment.id) {
              if (isLike) {
                c.likeCount += 1;
              } else {
                c.likeCount -= 1;
              }
            }
          });
          this.setData({ isLikeList, commentList  });
        }
      },
      fail: (err) => {
        console.log(err);
      }
    });
  },

  /**
   * 收藏表示以后可能会再次阅读
   */
  toggleFave(event) {
    if (!this.data.userInfo) {
      wx.showToast({
        image: '../../images/warning.png',
        title: '登录后才能收藏',
      })
      return;
    }
    const comment = event.currentTarget.dataset.comment;
    qcloud.request({
      url: config.service.toggleFave,
      method: 'PUT',
      login: true,
      data: {
        movieId: this.data.movieId,
        commentId: comment.id
      },
      success: (res) => {
        if (!res.data.code) {
          let isFaveList = [...this.data.isFaveList];
          let commentList = [...this.data.commentList];
          isFaveList[comment.id] = !isFaveList[comment.id];
          let isFave = isFaveList[comment.id]
          this.setData({ isFaveList });
        }
      },
      fail: (err) => {
        console.log(err);
      }
    });

  },

  /**
   * 跳转至评论详情页
   */
  toDetail(event) {
    const commentId = event.currentTarget.dataset.comment.id;
    wx.navigateTo({
      url: '/pages/comment-detail/comment-detail?commentId=' + commentId + '&movieId=' + this.data.movieId,
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

  /**
   * 登陆成功后获取用户点赞和收藏信息，并绑定显示
   */
  onLoginSuccess(userInfo) {
    this.setData({
      userInfo
    });
    this.setLikeList(this.data.movieId);
    this.setFaveList(this.data.movieId);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const movieId = +options.movieId;
    this.setData({
      movieId
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 将获取列表的函数放到onShow来执行是因为在评论详情页面可能会执行“收藏”和“点赞的操作”，
    // 返回列表页面后也要刷新相关信息
    this.getCommentList(this.data.movieId, () => {
      if (this.data.userInfo) {
        this.setLikeList(this.data.movieId);
        this.setFaveList(this.data.movieId);
      }
    });
    app.checkSession({
      success: (userInfo) => {
        this.setData({
          userInfo
        });
      },
      error: (err) => {
        console.log(err)
      }
    });
  },
  /**
   * 下拉刷新评论列表
   */
  onPullDownRefresh() {
    this.getCommentList(this.data.movieId, () => {
      if (this.data.userInfo) {
        this.setLikeList(this.data.movieId);
        this.setFaveList(this.data.movieId);
      }
      wx.stopPullDownRefresh()
    });
  }
})