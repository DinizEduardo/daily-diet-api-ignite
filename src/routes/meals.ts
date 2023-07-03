import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { authenticateUser } from '../middlewares/authenticate-users'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: authenticateUser }, async (request) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().datetime(),
      diet: z.coerce.boolean(),
    })

    const body = createMealBodySchema.parse(request.body)

    const meal = await knex('meals')
      .insert({
        id: randomUUID(),
        name: body.name,
        description: body.description,
        datetime: body.date,
        diet: body.diet,
        userId: request.logged.id,
      })
      .returning('*')

    return { meal }
  })
}
