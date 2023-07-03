import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    logged: {
      id: string | null
    }
  }
}
