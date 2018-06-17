// pages/comment-list/comment-list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentList: [
      {
        id: 1,
        user: 'vaan',
        avator: '../../images/user-unlogin.png',
        content: '赞赞赞赞赞',
        commentType: 'text',
        date: '2018-6-16 10:32',
        like: true,
        likeCount: 10,
        fave: true
      },
      {
        id: 2,
        user: 'vaan',
        avator: '../../images/user-unlogin.png',
        content: '赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞',
        commentType: 'text',
        date: '2018-6-16 10:32',
        like: true,
        likeCount: 10,
        fave: true
      },
      {
        id: 3,
        user: 'vaan',
        avator: '../../images/user-unlogin.png',
        content: '赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞',
        commentType: 'text',
        date: '2018-6-16 10:32',
        like: false,
        likeCount: 2220,
        fave: true
      },
      {
        id: 4,
        user: 'vaan',
        avator: '../../images/user-unlogin.png',
        content: '赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞赞',
        commentType: 'text',
        date: '2018-6-16 10:32',
        like: false,
        likeCount: 0,
        fave: true
      }
    ],
  },

  like(event) {
    // console.log(event)
    const comment = event.currentTarget.dataset.comment;
    const isLike = comment.like;
    let commentList = [...this.data.commentList]
    commentList.forEach((c) => {
      if (c.id === comment.id) {
        c.like = !c.like;
        if (c.like) {
          c.likeCount += 1;
        } else {
          c.likeCount -= 1;
        }
        
      }
    });
    this.setData({
      commentList
    });
  },

  fave(event) {
    const comment = event.currentTarget.dataset.comment;
    const isFave = comment.fave;
    let commentList = [...this.data.commentList]
    commentList.forEach((c) => {
      if (c.id === comment.id) {
        c.fave = !c.fave;
      }
    });
    this.setData({
      commentList
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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