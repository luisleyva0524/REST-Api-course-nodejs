const zod = require('zod')

const movieSchema = zod.object({
  title: zod.string({
    invalid_type_error: 'title must be a string',
    required_error: 'title is required'
  }),
  year: zod.number().int().min(1900).max(2024),
  director: zod.string(),
  duration: zod.number().int().positive(),
  poster: zod.string().url(),
  genre: zod.array(zod.enum(['Action', 'Drama', 'Terror']))
})

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
