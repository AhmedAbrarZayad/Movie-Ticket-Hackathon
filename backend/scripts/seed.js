import 'dotenv/config';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const MOVIE_DATA = [
  ['the-last-signal', 'The Last Signal', 'A radio astronomer follows a transmission that predicts disasters before they happen.', 132, 'Science Fiction|Thriller', '8.4', 'now-showing', '2026-07-18', 'interstellar.svg'],
  ['monsoon-run', 'Monsoon Run', 'Two estranged siblings race across a flooded city carrying evidence that could expose a conspiracy.', 118, 'Action|Drama', '7.9', 'now-showing', '2026-07-25', 'oppenheimer.svg'],
  ['kingdom-of-ash', 'Kingdom of Ash', 'A reluctant queen must unite rival clans before an ancient fire consumes their valley.', 146, 'Fantasy|Adventure', '8.1', 'now-showing', '2026-08-01', 'dune-part-two.svg'],
  ['midnight-platform', 'Midnight Platform', 'The final train stops at a station absent from every map, and its passengers cannot leave.', 104, 'Mystery|Horror', '7.7', 'now-showing', '2026-08-05', 'the-batman.svg'],
  ['paper-constellations', 'Paper Constellations', 'A young cartographer recreates her mother’s lost journeys through letters and hand-drawn stars.', 112, 'Drama|Romance', '8.0', 'now-showing', '2026-07-11', 'inception.svg'],
  ['velocity-zero', 'Velocity Zero', 'A rookie pilot must land a damaged orbital ferry after its navigation system is sabotaged.', 125, 'Action|Science Fiction', '8.2', 'now-showing', '2026-08-07', 'spider-man-brand-new-day.svg'],
  ['echoes-of-bengal', 'Echoes of Bengal', 'A musician discovers that an unfinished folk song preserves the memories of an entire village.', 121, 'Drama|Music', '7.8', 'coming-soon', '2026-09-04', 'oppenheimer.svg'],
  ['glass-horizon', 'Glass Horizon', 'Explorers cross a crystalline desert where every reflection reveals a different future.', 138, 'Adventure|Science Fiction', '8.3', 'coming-soon', '2026-10-02', 'dune-part-two.svg'],
];

export const MOCK_MOVIES = MOVIE_DATA.map(([slug, title, description, durationMinutes, genre, rating, status, date, asset]) => ({
  id: deterministicUuid(`movie:${slug}`), slug, title, description,
  posterUrl: `/public/catalogue/${asset}`, backdropUrl: `/public/catalogue/${asset}`,
  trailerUrl: null, durationMinutes, genre, rating, status, releaseDate: new Date(`${date}T00:00:00.000Z`),
}));

export const DEMO_THEATRES = [
  {
    key: 'gec', name: 'CinemaSeat GEC', address: 'GEC Circle, Chattogram', city: 'Chattogram',
    screens: [
      { number: 1, name: 'IMAX Hall', priceCents: 65000 },
      { number: 2, name: 'Premium Hall', priceCents: 50000 },
    ],
  },
  {
    key: 'agrabad', name: 'CinemaSeat Agrabad', address: 'Sheikh Mujib Road, Agrabad', city: 'Chattogram',
    screens: [
      { number: 1, name: 'Dolby Screen', priceCents: 55000 },
      { number: 2, name: 'Screen 2', priceCents: 40000 },
    ],
  },
  {
    key: 'jamal-khan', name: 'CinemaSeat Jamal Khan', address: 'Jamal Khan Road, Chattogram', city: 'Chattogram',
    screens: [
      { number: 1, name: 'Grand Hall', priceCents: 45000 },
      { number: 2, name: 'Screen 2', priceCents: 35000 },
    ],
  },
];

export function deterministicUuid(key) {
  const hex = createHash('sha256').update(key).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const value = hex.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}


function dhakaDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function dhakaTimeOnDay(baseDate, dayOffset, hour, minute) {
  const { year, month, day } = dhakaDateParts(baseDate);
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + dayOffset, hour - 6, minute));
}

export function buildSeedData(movies, now = new Date()) {
  const theatres = DEMO_THEATRES.map((theatre) => ({
    id: deterministicUuid(`theatre:${theatre.key}`),
    name: theatre.name,
    address: theatre.address,
    city: theatre.city,
    screens: theatre.screens,
  }));
  const seats = [];
  for (const theatre of theatres) {
    for (const screen of theatre.screens) {
      for (const row of 'ABCDEFGH') {
        for (let col = 1; col <= 10; col += 1) {
          seats.push({
            id: deterministicUuid(`seat:${theatre.id}:${screen.number}:${row}:${col}`),
            theatreId: theatre.id,
            screenNumber: screen.number,
            row,
            col,
            seatLabel: `${row}${col}`,
            seatType: row === 'A' || row === 'B' ? 'PREMIUM' : 'REGULAR',
          });
        }
      }
    }
  }

  const activeMovies = movies.filter(({ status }) => status === 'now-showing');
  const showtimes = [];
  const slots = [[11, 0], [15, 30], [20, 0]];
  let sequence = 0;
  for (let day = 0; day < 7; day += 1) {
    for (const theatre of theatres) {
      for (const screen of theatre.screens) {
        for (const [hour, minute] of slots) {
          const movie = activeMovies[sequence % activeMovies.length];
          const startsAt = dhakaTimeOnDay(now, day, hour, minute);
          showtimes.push({
            id: deterministicUuid(`showtime:${day}:${theatre.id}:${screen.number}:${hour}:${minute}`),
            movieId: movie.id,
            theatreId: theatre.id,
            screenNumber: screen.number,
            screenName: screen.name,
            startsAt,
            endsAt: new Date(startsAt.getTime() + movie.durationMinutes * 60_000),
            priceCents: screen.priceCents,
          });
          sequence += 1;
        }
      }
    }
  }

  const seatsByScreen = new Map();
  for (const seat of seats) {
    const key = `${seat.theatreId}:${seat.screenNumber}`;
    seatsByScreen.set(key, [...(seatsByScreen.get(key) ?? []), seat]);
  }
  const showtimeSeats = showtimes.flatMap((showtime) =>
    seatsByScreen.get(`${showtime.theatreId}:${showtime.screenNumber}`).map((seat) => ({
      id: deterministicUuid(`showtime-seat:${showtime.id}:${seat.id}`),
      showtimeId: showtime.id,
      seatId: seat.id,
    })),
  );
  return { movies, theatres, seats, showtimes, showtimeSeats };
}

async function insertRows(client, table, columns, rows, chunkSize = 500) {
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const values = [];
    const tuples = chunk.map((row) => {
      const placeholders = columns.map((column) => `$${values.push(row[column])}`);
      return `(${placeholders.join(', ')})`;
    });
    const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
    await client.query(`INSERT INTO "${table}" (${quotedColumns}) VALUES ${tuples.join(', ')}`, values);
  }
}

export async function seedDatabase({ pool, now = new Date(), movies = MOCK_MOVIES } = {}) {
  const data = buildSeedData(movies, now);
  const ownedPool = pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await ownedPool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`TRUNCATE TABLE "WebhookEvent", "Payment", "ShowtimeSeat", "Booking", "SeatHold",
      "RefreshSession", "Seat", "Showtime", "Theatre", "Movie", "User" CASCADE`);
    await insertRows(client, 'Movie', [
      'id', 'slug', 'title', 'description', 'posterUrl', 'backdropUrl', 'trailerUrl',
      'durationMinutes', 'genre', 'rating', 'status', 'releaseDate',
    ], data.movies);
    await insertRows(client, 'Theatre', ['id', 'name', 'address', 'city'], data.theatres);
    await insertRows(client, 'Seat', ['id', 'theatreId', 'screenNumber', 'row', 'col', 'seatLabel', 'seatType'], data.seats);
    await insertRows(client, 'Showtime', [
      'id', 'movieId', 'theatreId', 'screenNumber', 'screenName', 'startsAt', 'endsAt', 'priceCents',
    ], data.showtimes);
    await insertRows(client, 'ShowtimeSeat', ['id', 'showtimeId', 'seatId'], data.showtimeSeats);
    await client.query('COMMIT');
    return {
      movies: data.movies.length,
      theatres: data.theatres.length,
      seats: data.seats.length,
      showtimes: data.showtimes.length,
      showtimeSeats: data.showtimeSeats.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    if (!pool) await ownedPool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.warn('WARNING: This command permanently deletes all CinemaSeat application data.');
  seedDatabase()
    .then((counts) => console.log('Database reseeded successfully:', counts))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
