import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.register(fastifyJwt, {
  secret: 'seu-segredo-jwt',
})

app.register(fastifyCookie)

app.register(usersRoutes, {
  prefix: 'users',
})
