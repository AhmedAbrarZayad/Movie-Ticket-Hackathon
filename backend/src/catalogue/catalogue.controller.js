import { catalogueService } from './catalogue.service.js'

export class CatalogueController {
  getMovies(req, res) {
    res.json({
      success: true,
      data: catalogueService.getMovies(),
    })
  }

  getMovie(req, res) {
    const { movieId } = req.params
    const movie = catalogueService.getMovieById(movieId)

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      })
    }

    return res.json({
      success: true,
      data: movie,
    })
  }

  getRooms(req, res) {
    res.json({
      success: true,
      data: catalogueService.getRooms(),
    })
  }

  getSeats(req, res) {
    res.json({
      success: true,
      data: catalogueService.getSeats(),
    })
  }

  getShowtimes(req, res) {
    res.json({
      success: true,
      data: catalogueService.getShowtimes(),
    })
  }

  getCatalogue(req, res) {
    res.json({
      success: true,
      data: catalogueService.getCatalogueSnapshot(),
    })
  }
}

export const catalogueController = new CatalogueController()
export default catalogueController
