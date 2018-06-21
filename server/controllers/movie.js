const DB = require('../utils/db')

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query('select movie.id as `id`, movie.title as `title` , movie.image as `image`, movie.category as `category`, movie.description as `description`, movie.create_time as `createTime`, ifnull(avg(movie_comment.rating), 0) as `avgRating` from movie left join movie_comment on movie.id = movie_comment.movie_id group by movie.id');
  },

  detail: async ctx => {
    const movieId = +ctx.params.id;
    let movie = {};
    if (!isNaN(movieId)) {
      let movieRatings = await DB.query('select movie.id as `id`, movie.title as `title` , movie.image as `image`, movie.category as `category`, movie.description as `description`, movie.create_time as `createTime`, movie_comment.rating as `rating`, count(*) as ratingCount from movie left join movie_comment on movie.id = movie_comment.movie_id  where movie.id = ? group by movie.id, movie_comment.rating order by movie_comment.rating desc', [movieId]);
      if (movieRatings.length > 0) {
        movie.id = movieRatings[0].id;
        movie.title = movieRatings[0].title;
        movie.image = movieRatings[0].image;
        movie.category = movieRatings[0].category;
        movie.description = movieRatings[0].description;
        movie.createTime = movieRatings[0].createTime;

        let allRatings = [1, 2, 3, 4, 5];
        let ratings = [];
        let totalCount = 0;
        let avgRating = 0;
        movieRatings.forEach((rating) => {
          if (rating.rating !== null) {
            ratings.push({
              score: rating.rating,
              count: rating.ratingCount,
              ratio: 0
            });
            totalCount += rating.ratingCount;
            let idx = allRatings.indexOf(rating.rating);
            if (idx >= 0) {
              allRatings.splice(idx, 1)
            }
          }

        });
        allRatings.forEach(score => {
          ratings.push({
            score: score,
            count: 0,
            ratio: 0
          });
        });
        ratings = ratings.sort((a, b) => b.score - a.score);
        if (totalCount === 0) {
          avgRating = 0;

        } else {
          ratings.forEach((rating) => {
            avgRating += rating.score * rating.count / totalCount;
            rating.ratio = (rating.count / totalCount * 100).toFixed(1);

          });
        }

        movie.ratings = ratings;
        movie.avgRating = avgRating.toFixed(1);
        movie.totalCount = totalCount;
      }
      

    }
    ctx.state.data = movie;
  }
}