import { Router } from 'express'
import { catalogueController } from './catalogue.controller.js'
import { catalogueService } from './catalogue.service.js'

export const catalogueRouter = Router()

catalogueRouter.get('/movies', catalogueController.getMovies)
catalogueRouter.get('/movies/:movieId', catalogueController.getMovie)
catalogueRouter.get('/rooms', catalogueController.getRooms)
catalogueRouter.get('/rooms/:roomId/seats', (req, res) => {
  const { roomId } = req.params
  const seats = catalogueService.getSeatsByRoom(roomId)

  res.json({
    success: true,
    data: seats,
  })
})
catalogueRouter.get('/seats', catalogueController.getSeats)
catalogueRouter.get('/showtimes', catalogueController.getShowtimes)
catalogueRouter.get('/showtimes/:movieId', (req, res) => {
  const { movieId } = req.params
  const showtimes = catalogueService.getShowtimesByMovie(movieId)

  res.json({
    success: true,
    data: showtimes,
  })
})
catalogueRouter.get('/catalogue', catalogueController.getCatalogue)
