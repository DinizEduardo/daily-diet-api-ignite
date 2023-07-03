import bcrypt from 'bcrypt'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

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

  // Middleware
  const authenticate = async (request, reply) => {
    try {
      // Obtenha o token JWT dos cookies da requisição
      const token = request.cookies.token

      // Verifique se o token está presente
      if (!token) {
        reply.status(401).send({ message: 'Token não fornecido' })
        throw new Error('Token não fornecido')
      }

      // Verifique e decodifique o token JWT
      const decodedToken = await app.jwt.verify(token)

      // Defina o objeto do usuário autenticado na requisição
      request.user = { userId: decodedToken.userId }
    } catch (error) {
      reply.status(401).send({ message: 'Token inválido' })
      throw new Error('Token inválido')
    }
  }

  // Rota protegida que requer autenticação via token JWT
  app.get(
    '/protected',
    { preHandler: authenticate },
    async (request, reply) => {
      // O usuário autenticado está disponível no objeto `request.user`
      const userId = request.user.userId

      // Recupere as informações do usuário no banco de dados
      const user = await knex('users').where('id', userId).first()

      // Faça algo com as informações do usuário
      reply.send({ message: `Olá, ${user.name}! Esta é uma rota protegida.` })
    },
  )
}
