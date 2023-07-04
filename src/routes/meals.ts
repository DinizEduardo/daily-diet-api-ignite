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

  app.get('/', { preHandler: authenticateUser }, async (request) => {
    const meals = await knex('meals')
      .where({
        userId: request.logged.id,
      })
      .select()

    return { meals }
  })

  app.get('/:id', { preHandler: authenticateUser }, async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        userId: request.logged.id,
        id,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Refeição não encontrada' })
    }

    return { meal }
  })

  app.delete(
    '/:id',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          userId: request.logged.id,
          id,
        })
        .first()

      if (!meal) {
        return reply.status(404).send({ message: 'Refeição não encontrada' })
      }

      await knex('meals')
        .where({
          userId: request.logged.id,
          id,
        })
        .delete()

      return reply
        .status(200)
        .send({ message: 'Refeição excluida com sucesso.' })
    },
  )

  app.put('/:id', { preHandler: authenticateUser }, async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().datetime(),
      diet: z.coerce.boolean(),
    })

    const body = updateMealBodySchema.parse(request.body)

    const meal = await knex('meals')
      .where({
        userId: request.logged.id,
        id,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Refeição não encontrada' })
    }

    const mealUpdated = await knex('meals')
      .update({
        name: body.name,
        description: body.description,
        datetime: body.date,
        diet: body.diet,
      })
      .returning('*')

    return { meal: mealUpdated[0] }
  })
}
