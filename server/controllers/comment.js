const DB = require('../utils/db')

module.exports = {
  /**
   * 获取指定movie id的所有评论
   */
  list: async ctx => {
    const movieId = +ctx.request.query.movieId;
    let comments = []
    if (!isNaN(movieId)) {
      comments = await DB.query(
        'select id, movie_comment.movie_id as `movieId`, comment_type as `commentType`, avatar, content, rating, movie_comment.user, username, movie_comment.create_time as `createTime`, count(comment_like.user) as `likeCount` from movie_comment left join comment_like on movie_comment.id = comment_like.comment_id left join comment_fave on movie_comment.id = comment_fave.comment_id where movie_comment.movie_id = ? group by movie_comment.id order by movie_comment.create_time desc', [movieId]);
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
      comment = (await DB.query('select movie_comment.id as `id`, movie.id as `movieId`, movie.title as `movieTitle`, movie.image as `movieImage`, comment_type as `commentType`, avatar, content, rating, movie_comment.user, username, movie_comment.create_time as `createTime`, count(comment_like.user) as `likeCount` from movie_comment join movie on movie.id = movie_comment.movie_id left join comment_like on movie_comment.id = comment_like.comment_id left join comment_fave on movie_comment.id = comment_fave.comment_id where movie_comment.id = ? group by movie_comment.id', [commentId]))[0] || null;
    }
    ctx.state.data = comment;
  },

  /**
   * 添加评论
   */
  add: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId;
    let username = ctx.state.$wxInfo.userinfo.nickName;
    let avatar = ctx.state.$wxInfo.userinfo.avatarUrl;
    let content = ctx.request.body.content;
    let movieId = +ctx.request.body.movieId;
    let rating = +ctx.request.body.rating;
    let commentType = +ctx.request.body.commentType;
    
    
    if (!isNaN(movieId)) {
      await DB.query('INSERT INTO movie_comment(movie_id, comment_type, rating, user, username, avatar, content) VALUES (?, ?, ?, ?, ?, ?, ?)', [movieId, commentType, rating, user, username, avatar, content]);
    }

    ctx.state.data = {}
  },

  /**
   * 获取推荐影评(不会推荐自己的影评和已收藏的影评给自己)
   * 随机推荐1部较新的影评
   * 随机推荐1条点赞数多的影评
   * 随机推荐1部评分高电影的影评
   */
  recommend: async ctx => {
    const me = ctx.state.$wxInfo.userinfo.openId;
    const recommends = []
    
    const newComment = (await DB.query('select movie.id as `movieId`, movie.title as `movieTitle`, movie.image as `movieImage`, movie_comment.id as `id`, movie_comment.username as `recommender`, movie_comment.avatar as `avatar` from movie_comment join movie on movie.id=movie_comment.movie_id left join comment_fave on movie_comment.id=comment_fave.comment_id where movie_comment.user <> ? and (comment_fave.user is null or comment_fave.user <> ?) order by movie_comment.create_time desc limit 3', [me, me])) || null;
    if (newComment) {
      recommends.push(newComment[Math.floor(Math.random() * newComment.length)]);
    }
    const highLikeComment = (await DB.query('select movie.id as `movieId`, movie.title as `movieTitle`, movie.image as `movieImage`, movie_comment.id as `id`, movie_comment.username as `recommender`, movie_comment.avatar as `avatar`, (select count(*) from comment_like where comment_like.comment_id = movie_comment.id group by movie_comment.id) as `likeCount` from movie_comment join movie on movie.id=movie_comment.movie_id left join comment_fave on movie_comment.id=comment_fave.comment_id where movie_comment.user <> ? and (comment_fave.user is null or comment_fave.user <> ?) order by `likeCount` desc limit 3', [me, me])) || null;
    if (highLikeComment) {
      recommends.push(highLikeComment[Math.floor(Math.random() * highLikeComment.length)]);
    }

    const highRatingComment = (await DB.query('select movie.id as `movieId`, movie.title as `movieTitle`, movie.image as `movieImage`, movie_comment.id as `id`, movie_comment.username as `recommender`, movie_comment.avatar as `avatar` from movie_comment join movie on movie.id=movie_comment.movie_id left join comment_fave on movie_comment.id=comment_fave.comment_id where movie_comment.user <> ? and (comment_fave.user is null or comment_fave.user <> ?) order by movie_comment.rating desc limit 3', [me, me])) || null;

    if (highRatingComment) {
      recommends.push(highRatingComment[Math.floor(Math.random() * highRatingComment.length)]);
    }
    ctx.state.data = recommends
  }
}
