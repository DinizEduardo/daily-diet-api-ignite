import { FastifyReply, FastifyRequest } from 'fastify'
import { app } from '../app'

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Obtenha o token JWT dos cookies da requisição
    const token = request.cookies.token

    // Verifique se o token está presente
    if (!token) {
      reply.status(401).send({ message: 'Token não fornecido' })
      throw new Error('Token não fornecido')
    }

    // Verifique e decodifique o token JWT
    const decodedToken: { userId: string } = await app.jwt.verify(token)

    // Defina o objeto do usuário autenticado na requisição
    request.logged = { id: decodedToken.userId }
  } catch (error) {
    reply.status(401).send({ message: 'Token inválido' })
    throw new Error('Token inválido')
  }
}
