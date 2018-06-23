// pages/comment-detail/comment-detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentId: null,
    userInfo: null,
    movie: null,
    comment: null,
    commentUserInfo: null,
    isLike: false,
    isFave: false
  },

  /**
   * 获取评论详情
   */
  getComment(commentId) {
    wx.showLoading({
      title: '加载评论中',
    });
    qcloud.request({
      url: config.service.commentDetail + commentId,
      success: (res) => {
        wx.hideLoading();
        console.log(res);
        if (!res.data.code) {
          wx.showToast({
            title: '加载评论成功',
          });
          const comment = res.data.data;
          comment.content = comment.commentType === 0 ? comment.content : JSON.parse(comment.content);
          const movie = {
            title: comment.movieTitle,
            image: comment.movieImage
          };
          const commentUserInfo = {
            nickName: comment.username,
            avatarUrl: comment.avatar
          };

          this.setData({
            movie,
            comment,
            commentUserInfo
          });
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '加载评论失败',
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          image: '../../images/error.png',
          title: '加载评论失败',
        });
      }
    })
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
    const comment = this.data.comment;
    qcloud.request({
      url: config.service.toggleLike,
      method: 'PUT',
      login: true,
      data: {
        movieId: comment.movieId,
        commentId: comment.id
      },
      success: (res) => {
        if (!res.data.code) {
          const isLike = !this.data.isLike;
          let likeCount = this.data.comment.likeCount;
          if (isLike) {
            likeCount += 1;
          } else {
            likeCount -= 1;
          }
          let comment = Object.assign({}, this.data.comment, { likeCount: likeCount})
          this.setData({
            comment,
            isLike
          });
          wx.showToast({
            title: '操作成功',
          });
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '操作失败',
          });
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
    const comment = this.data.comment;
    qcloud.request({
      url: config.service.toggleFave,
      method: 'PUT',
      login: true,
      data: {
        movieId: comment.movieId,
        commentId: comment.id
      },
      success: (res) => {
        if (!res.data.code) {
          const isFave = !this.data.isFave
          this.setData({
            isFave
          });
          wx.showToast({
            title: '操作成功',
          });
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '操作失败',
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.showToast({
          image: '../../images/error.png',
          title: '操作失败',
        });
      }
    });

  },

  setIsLike(commentId) {
    qcloud.request({
      url: config.service.like + commentId,
      login: true,
      success: (res) => {
        if (!res.data.code) {
          console.log(res.data.data);
          if (res.data.data) {
            this.setData({
              isLike: true
            })
          }
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '获取点赞信息失败',
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.showToast({
          image: '../../images/error.png',
          title: '获取点赞信息失败',
        });
      }
    })
  },

  setIsFave(commentId) {
    qcloud.request({
      url: config.service.fave + commentId,
      login: true,
      success: (res) => {
        if (!res.data.code) {
          console.log(res.data.data);
          if (res.data.data) {
            this.setData({
              isFave: true
            })
          }
        } else {
          wx.showToast({
            image: '../../images/error.png',
            title: '获取收藏信息失败',
          });
        }
      },
      fail: (err) => {
        console.log(err);
        wx.showToast({
          image: '../../images/error.png',
          title: '获取收藏信息失败',
        });
      }
    })
  },

  /**
   * 登陆成功后获取用户点赞和收藏信息，并绑定显示
   */
  onLoginSuccess(userInfo) {
    this.setIsLike(this.data.commentId);
    this.setIsFave(this.data.commentId);
    this.setData({
      userInfo
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    const commentId = +options.commentId;
    this.setData({
      commentId
    });
    this.getComment(commentId);
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
  }
})