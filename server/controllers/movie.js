const DB = require('../utils/db')

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query('select * from movie');
  },

  detail: async ctx => {
    const movieId = +ctx.params.id;
    let movie = {};
    if (!isNaN(movieId)) {
      movie = (await DB.query('select * from movie where movie.id = ?', [movieId]))[0] || null;
    }
    ctx.state.data = movie;
  }
}