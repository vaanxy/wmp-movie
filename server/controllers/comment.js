const DB = require('../utils/db')

module.exports = {
  /**
   * 获取指定movie id的所有评论
   */
  list: async ctx => {
    const movieId = +ctx.params.id;
    let comments = []
    if (!isNaN(movieId)) {
      comments = await DB.query('select * from movie_comment where movie_comment.movie_id = ?', [movieId]);
    }
    ctx.state.data = comments;

  },

  /**
   * 获取指定comment id的评论详情
   */
  detail: async ctx => {
    const commentId = +ctx.params.id;
    let comment = {};
    if (!isNaN(commentId)) {
      movie = (await DB.query('select * from movie_comment where movie_comment.id = ?', [commentId]))[0] || null;
    }
    ctx.state.data = comment;
  },

  /**
   * 添加评论
   */
  add: async ctx => {
    let comment = ctx.body.comment;
    
  } 

  
}