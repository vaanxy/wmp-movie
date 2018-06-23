// pages/comment-add/comment-add.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    containerHeight: 0,
    userInfo: null,
    commentType: 1, // 0: 文字; 1: 语音;
    movie: null,
    content: null,
    rating: 0,
    isEditing: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let commentType = +options.commentType;

    const movie = {
      id: +options.movieId,
      title: options.movieTitle,
      image: options.movieImage,
    };

    this.setData({
      movie,
      commentType
    });
  },

  onInput(event) {
    this.setData({
      content: event.detail.text
    });
  },

  onRecorded(event) {
    this.setData({
      content: event.detail.voice
    });
  },

  onRated(event) {
    this.setData({
      rating: event.detail.rating
    });
  },

  preview() {
    if (this.data.rating === 0) {
      wx.showToast({
        image: '../../images/warning.png',
        title: '记得打分哟',
      })
      return;
    }
    this.setData({
      isEditing: false
    });
  },

  toEdit() {
    this.setData({
      isEditing: true
    });
  },

  uploadVoice(cb) {
    if (this.data.commentType === 1) {
      wx.uploadFile({
        url: config.service.uploadUrl,
        filePath: this.data.content.tempFilePath,
        name: 'file',
        success: res => {
          let data = JSON.parse(res.data)
          console.log(data)

          if (!data.code) {
            const voice = {
              duration: this.data.content.duration,
              durationText: this.data.content.durationText,
              width: this.data.content.width,
              src: data.data.imgUrl
            }
            const content = JSON.stringify(voice);
            cb && cb(content);
          } else {
            wx.showToast({
              title: '发布失败',
            });
          }
        },
        fail: (err) => {
          console.log(err)
          wx.showToast({
            title: '发布失败',
          });
        }
      })
    } else {
      cb && cb(this.data.content);
    }
  },

  /**
   * 发布影评，发布成功后自动跳转至该电影的评论列表页面
   */
  publish() {
    wx.showLoading({
      title: '正在发布...',
    });
    this.uploadVoice((content) => {
      qcloud.request({
        url: config.service.commentAdd,
        isLogin: true,
        method: 'POST',
        data: {
          movieId: this.data.movie.id,
          content: content,
          rating: this.data.rating,
          commentType: this.data.commentType
        },
        success: (res) => {
          console.log(res);
          wx.showToast({
            title: '发布成功',
          });
        },
        fail: (err) => {
          console.log(err);
          wx.showToast({
            title: '发布失败',
          });
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    });
    // 此处使用redirectTo是为了防止用户点击返回，又返回了预览页面
    setTimeout(() => {
      wx, wx.redirectTo({
        url: '/pages/comment-list/comment-list?movieId=' + this.data.movie.id,
      })
    }, 1000);

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
   * 登陆成功后设置userInfo, 并初始化录音管理器
   */
  onLoginSuccess(userInfo) {
    this.setData({
        userInfo
      });
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