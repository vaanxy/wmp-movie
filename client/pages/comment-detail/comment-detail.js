// pages/comment-detail/comment-detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

const app = getApp();
const actionTexts = ["文字", "语音"];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieId: null,
    commentId: null,
    userInfo: null,
    movie: null,
    comment: null,
    commentUserInfo: null,
    isLike: false,
    isFave: false,
    myCommentId: null, //当前电影我所写的影评id，如果没有写过则为null
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
        if (!res.data.code) {
          wx.showToast({
            title: '加载评论成功',
          });
          const comment = res.data.data;
          comment.content = comment.commentType === 0 ? comment.content : JSON.parse(comment.content);
          const movie = {
            id: comment.movieId,
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

  /**
   * 用户登录后获取其是否点赞该影评的信息并设置
   */
  setIsLike(commentId) {
    qcloud.request({
      url: config.service.like + commentId,
      login: true,
      success: (res) => {
        if (!res.data.code) {
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

  /**
   * 用户登录后获取其是否收藏该影评的信息并设置
   */
  setIsFave(commentId) {
    qcloud.request({
      url: config.service.fave + commentId,
      login: true,
      success: (res) => {
        if (!res.data.code) {
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
   * 如果这部电影该用户也写过影评则不能再次添加影评，而是跳转至该用户为此电影所写的影评详情页面
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
      url: `/pages/comment-add/comment-add?commentType=${commentType}&movieId=${this.data.movieId}&movieImage=${this.data.movie.image}&movieTitle=${this.data.movie.title}`,
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
    });
  },

  /**
   * 登陆成功后获取用户点赞、收藏信息及是否为该电影写过影评的信息，并绑定显示
   */
  onLoginSuccess(userInfo) {
    this.setData({
      userInfo
    });
    this.getMyMovieComment(this.data.movieId);
    this.setIsLike(this.data.commentId);
    this.setIsFave(this.data.commentId);

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const commentId = +options.commentId;
    const movieId = +options.movieId;
    this.setData({
      commentId,
      movieId
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