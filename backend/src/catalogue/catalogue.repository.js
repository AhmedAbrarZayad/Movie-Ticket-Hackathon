import { getPool } from '../authentication/authentication.repository.js';

function mapMovie(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    posterUrl: row.posterUrl,
    backdropUrl: row.backdropUrl,
    trailerUrl: row.trailerUrl,
    durationMinutes: row.durationMinutes,
    genres: row.genre ? row.genre.split('|').filter(Boolean) : [],
    rating: Number(row.rating ?? 0),
    status: row.status,
    releaseDate: row.releaseDate,
  };
}

export function createCatalogueRepository(pool = getPool()) {
  return {
    async findMovies({ search, status } = {}) {
      const conditions = [];
      const values = [];
      if (search) {
        values.push(`%${search}%`);
        conditions.push(`(title ILIKE $${values.length} OR genre ILIKE $${values.length})`);
      }
      if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(
        `SELECT * FROM "Movie" ${where}
         ORDER BY CASE status WHEN 'now-showing' THEN 0 ELSE 1 END, title`,
        values,
      );
      return result.rows.map(mapMovie);
    },

    async findMovie(movieId) {
      const result = await pool.query(
        'SELECT * FROM "Movie" WHERE id::text = $1 OR slug = $1 LIMIT 1',
        [movieId],
      );
      return mapMovie(result.rows[0]);
    },

    async findTheatres() {
      const result = await pool.query(
        `SELECT t.id, t.name, t.address, t.city,
          COALESCE(array_agg(DISTINCT s."screenNumber") FILTER (WHERE s.id IS NOT NULL), '{}') AS screens
         FROM "Theatre" t LEFT JOIN "Seat" s ON s."theatreId" = t.id
         GROUP BY t.id ORDER BY t.name`,
      );
      return result.rows;
    },

    async findMovieShowtimes(movieId, date) {
      const result = await pool.query(
        `SELECT s.id, s."movieId", s."theatreId", t.name AS "theatreName",
          t.address AS "theatreAddress", s."screenNumber", s."screenName", s."startsAt",
          s."endsAt", s."priceCents",
          COUNT(ss.id) FILTER (WHERE ss.status = 'AVAILABLE')::int AS "availableSeatCount"
         FROM "Showtime" s
         JOIN "Theatre" t ON t.id = s."theatreId"
         LEFT JOIN "ShowtimeSeat" ss ON ss."showtimeId" = s.id
         WHERE s."movieId" = $1
           AND s."startsAt" >= ($2::date::timestamp AT TIME ZONE 'Asia/Dhaka')
           AND s."startsAt" < (($2::date + 1)::timestamp AT TIME ZONE 'Asia/Dhaka')
         GROUP BY s.id, t.id
         ORDER BY t.name, s."startsAt"`,
        [movieId, date],
      );
      return result.rows;
    },
  };
}
