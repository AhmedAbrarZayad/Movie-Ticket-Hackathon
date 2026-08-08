export interface Showtime {
  id: string
  startsAt: string
  endsAt: string
  priceCents: number
  availableSeatCount: number
}

export interface ShowtimeScreen {
  screenNumber: number
  screenName: string
  showtimes: Showtime[]
}

export interface TheatreShowtimes {
  theatreId: string
  theatreName: string
  theatreAddress: string
  screens: ShowtimeScreen[]
}

export interface MovieShowtimes {
  movieId: string
  date: string
  theatres: TheatreShowtimes[]
}

