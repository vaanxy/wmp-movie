const DB = require('../utils/db')

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query('select * from movies');
  },

  detail: async ctx => {
    const movieId = +ctx.params.id;
    let movie = {};
    if (!isNaN(movieId)) {
      movie = (await DB.query('select * from movies where movies.id = ?', [movieId]))[0] || null;
    }
    ctx.state.data = movie;
  }
}