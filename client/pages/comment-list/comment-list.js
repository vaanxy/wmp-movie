// pages/comment-list/comment-list.js
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
    movieId: 0,
    isPlaying: false,
    currentPlayingCommentId: null,
    commentList: [],
    isLikeList: [],
    isFaveList: []
  },

  /**
   * 根据movieId获取该id的所有影评信息
   */
  getCommentList(movieId) {
    qcloud.request({
      url: config.service.commentList + movieId,
      success: (res) => {
        console.log(res)
        if (!res.data.code) {
          const commentList = res.data.data.map((comment) => {
            let data = {};
            let date = new Date(comment.createTime);
            data.createTime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
            if (comment.commentType === 1) {
              data.content = JSON.parse(comment.content);
            }
            return Object.assign({}, comment, data);
          });
          this.setData({
            commentList
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.showToast({
          image: '../../images/error.png',
          title: '获取评论失败',
        })
      }
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

    const src = event.currentTarget.dataset.comment.content.src;
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
  setLikeList(movieId) {
    qcloud.request({
      url: config.service.likeList + movieId,
      login: true,
      success: (res) => {
        console.log(res.data)
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
    // console.log(event)
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
    this.setLikeList(this.data.movieId);
    this.setFaveList(this.data.movieId);
    this.setData({
      userInfo
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const movieId = +options.movieId;
    this.setData({
      movieId
    })
    this.getCommentList(movieId);
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