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

  /**
   * 用户输入时, 存储用户输入的信息
   */
  onInput(event) {
    this.setData({
      content: event.detail.text
    });
  },

  /**
   * 录音完成时, 存储录音的结果
   */
  onRecorded(event) {
    this.setData({
      content: event.detail.voice
    });
  },

  /**
   * 用户打分时, 存储用户打分结果
   */
  onRated(event) {
    this.setData({
      rating: event.detail.rating
    });
  },

  /**
   * 切换至预览模式
   */
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

  /**
   * 切换至编辑模式
   */
  toEdit() {
    this.setData({
      isEditing: true
    });
  },

  /**
   * 上传录音文件
   * @param: cb 上传录音文件成功时执行的回调函数
   */
  uploadVoice(cb) {
    if (this.data.commentType === 1) {
      wx.uploadFile({
        url: config.service.uploadUrl,
        filePath: this.data.content.tempFilePath,
        name: 'file',
        success: res => {
          let data = JSON.parse(res.data)

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
            console.log(res);
            wx.showToast({
              image: '../../image/error.png',
              title: '上传失败',
            });
          }
        },
        fail: (err) => {
          console.log(err)
          wx.showToast({
            image: '../../image/error.png',
            title: '上传失败',
          });
        }
      })
    } else {
      cb && cb(this.data.content);
    }
  },

  /**
   * 上传影评信息
   * @param: content 影评内容
   */
  publishMetaData(content) {
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
        // 此处使用redirectTo是为了防止用户点击返回，又返回了预览页面
        setTimeout(() => {
          wx, wx.redirectTo({
            url: '/pages/comment-list/comment-list?movieId=' + this.data.movie.id,
          })
        }, 1000);
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
  },

  /**
   * 发布影评，
   * 文字影评直接上传影评信息
   * 录音影评，先上传录音文件，成功后再上传影评信息
   * 发布成功后自动跳转至该电影的评论列表页面
   */
  publish() {
    wx.showLoading({
      mask: true,
      title: '正在发布...',
    });
    if (this.commentType === 0) {
      this.publishMetaData(content);
    } else {
      this.uploadVoice((content) => {
        this.publishMetaData(content);
      });
    }
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