import { cataloguePayload } from './catalogue.seed.js'

export class CatalogueService {
  getMovies() {
    return cataloguePayload.movies
  }

  getMovieById(movieId) {
    return cataloguePayload.movies.find((movie) => movie.id === movieId) ?? null
  }

  getRooms() {
    return cataloguePayload.rooms
  }

  getRoomById(roomId) {
    return cataloguePayload.rooms.find((room) => room.id === roomId) ?? null
  }

  getSeats() {
    return cataloguePayload.seats
  }

  getSeatsByRoom(roomId) {
    return cataloguePayload.seats.filter((seat) => seat.roomId === roomId)
  }

  getShowtimes() {
    return cataloguePayload.showtimes
  }

  getShowtimesByMovie(movieId) {
    return cataloguePayload.showtimes.filter((show) => show.movieId === movieId)
  }

  getCatalogueSnapshot() {
    return { ...cataloguePayload }
  }
}

export const catalogueService = new CatalogueService()
export default catalogueService
