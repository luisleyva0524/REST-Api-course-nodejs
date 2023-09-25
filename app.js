const movies = require('./movies.json')
const express = require('express')
const uuid = require('node:crypto')
const cors = require('cors')

const {
  validateMovie,
  validatePartialMovie
} = require('./schemas/movieSchema')

const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(express.static('web'))
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://movies.com',
        'https://luandev.dev'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
)

app.get('/movies/:id', (req, res) => {
  // path-to-regex
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)

  if (movie) return res.json(movie)
  res.status(404).json({ message: 'movie not found' })
})

app.get('/movies', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ message: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: uuid.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body) // validamos la pelicula

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params // recuperamos la id de la url
  const movieIndex = movies.findIndex((movie) => movie.id === id) // buscamos la pelicula por id

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  // actualizamos la pelicula
  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    res.status(404).json({ message: 'movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.status(204).json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
