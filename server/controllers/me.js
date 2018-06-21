const DB = require('../utils/db')

module.exports = {
  myPublishedComments: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = await DB.query('select movie_comment.id as `id`, movie_comment.content as `content`, movie_comment.create_time as `createTime`, movie_comment.comment_type as `commentType`, movie_comment.rating as `rating`, movie.title as `movieTitle`, movie.image as `movieImage`, movie_comment.username as `username`, movie_comment.avatar as `avatar` from movie_comment join movie on movie.id=movie_comment.movie_id where movie_comment.user=?', [user]);
  },

  myFaveComments: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = 
      await DB.query('select movie_comment.id as `id`, movie_comment.content as `content`, movie_comment.create_time as `createTime`, movie_comment.comment_type as `commentType`, movie_comment.rating as `rating`, movie.title as `movieTitle`, movie.image as `movieImage`, movie_comment.username as `username`, movie_comment.avatar as `avatar` from comment_fave join movie_comment on comment_fave.comment_id=movie_comment.id join movie on movie.id=comment_fave.movie_id where comment_fave.user=?', [user]);

  }
}