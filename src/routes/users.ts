import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { authenticateUser } from '../middlewares/authenticate-users'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const body = createUserBodySchema.parse(request.body)

    // Verifique se o email já está cadastrado
    const existingUser = await knex('users').where('email', body.email).first()
    if (existingUser) {
      reply.status(400).send({ message: 'O email já está cadastrado' })
      return
    }

    // Criptografe a senha
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Insira o usuário no banco de dados
    await knex('users').insert({
      id: randomUUID(),
      name: body.name,
      email: body.email,
      password: hashedPassword,
    })

    reply.send({ message: 'Usuário registrado com sucesso' })
  })

  app.post('/login', async (request, reply) => {
    const loginUserSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginUserSchema.parse(request.body)

    const user = await knex('users').where('email', email).first()
    if (!user || !(await bcrypt.compare(password, user.password))) {
      reply.status(401).send({ message: 'Credenciais inválidas' })
      return
    }

    const token = app.jwt.sign({ userId: user.id })

    // Defina o token JWT nos cookies
    reply.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    reply.send({ message: 'Login bem-sucedido' })
  })

  app.get(
    '/summary',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const meals = await knex('meals')
        .where({
          userId: request.logged.id,
        })
        .select()

      const totalMeals = meals.length

      // Filtrar refeições dentro e fora da dieta
      const mealsInDiet = meals.filter((meal) => meal.diet)
      const mealsOutOfDiet = meals.filter((meal) => !meal.diet)

      // Quantidade total de refeições dentro da dieta
      const totalMealsInDiet = mealsInDiet.length

      // Quantidade total de refeições fora da dieta
      const totalMealsOutOfDiet = mealsOutOfDiet.length

      // Melhor sequência de refeições dentro da dieta
      const sortedMeals = meals.sort((meal1, meal2) => {
        return (
          new Date(meal1.datetime).getTime() -
          new Date(meal2.datetime).getTime()
        )
      })

      let currentStreak = {
        date: new Date(sortedMeals[0].datetime),
        amount: 0,
      }
      let maxStreak = 0

      for (let i = 0; i < sortedMeals.length; i++) {
        const mealDate = new Date(sortedMeals[i].datetime)

        if (isSameDay(mealDate, currentStreak.date) && sortedMeals[i].diet) {
          currentStreak.amount += 1
        } else {
          maxStreak = Math.max(maxStreak, currentStreak.amount)
          currentStreak = {
            date: mealDate,
            amount: sortedMeals[i].diet ? 1 : 0,
          }
        }
      }

      maxStreak = Math.max(maxStreak, currentStreak.amount)

      return {
        totalMeals,
        totalMealsInDiet,
        totalMealsOutOfDiet,
        maxStreak,
      }
    },
  )

  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }
}
