
const DB = require('../utils/db')

module.exports = {
  list: async ctx => {
    const movieId = +ctx.request.query.movieId;
    const user = ctx.state.$wxInfo.userinfo.openId;
    if (!isNaN(movieId)) {
      ctx.state.data = await DB.query('select comment_id as `commentId` from comment_fave where movie_id=? and user=?', [movieId, user]);
    } else {
      ctx.state.code = -1;
    }
  },
  toggleFave: async ctx => {
    const commentId = +ctx.request.body.commentId;
    const movieId = +ctx.request.body.movieId;
    const user = ctx.state.$wxInfo.userinfo.openId;
    if (!isNaN(commentId)) {
      const list = await DB.query('select * from comment_fave where comment_fave.user = ? AND comment_fave.comment_id = ?', [user, commentId]);

      if (!list.length) {
        // 收藏
        await DB.query('insert into comment_fave(movie_id, comment_id, user) values (?, ?, ?)', [movieId, commentId, user]);
      } else {
        // 取消收藏
        await DB.query('delete from comment_fave where user=? and comment_id=?', [user, commentId]);
      }
    } else {
      ctx.state.code = -1
    }
    ctx.state.data = {}

  },
}