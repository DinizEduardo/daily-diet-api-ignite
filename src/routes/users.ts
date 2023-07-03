import bcrypt from 'bcrypt'
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

    // Gere o token JWT com uma expiração de 1 hora
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

  // Rota protegida que requer autenticação via token JWT
  app.get(
    '/protected',
    { preHandler: authenticateUser },
    async (request, reply) => {
      // O usuário autenticado está disponível no objeto `request.user`
      const userId = request.logged.id

      // Recupere as informações do usuário no banco de dados
      const user = await knex('users').where('id', userId).first()

      // Faça algo com as informações do usuário
      reply.send({ message: `Olá, ${user.name}! Esta é uma rota protegida.` })
    },
  )
}
