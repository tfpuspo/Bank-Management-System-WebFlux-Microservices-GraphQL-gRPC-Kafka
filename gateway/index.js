const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway')

// Forwards the caller's Authorization header through to each subgraph.
// Without this, JWTs never reach auth-service/authZ-service, and every
// permission check (e.g. SUPER_ADMIN on createAlkp) would silently fail.
class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.authorization) {
      request.http.headers.set('Authorization', context.authorization)
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'auth', url: 'http://localhost:8080/graphql' },
      { name: 'authZ', url: 'http://localhost:8081/graphql' },
      { name: 'account', url: 'http://localhost:8082/graphql' },
      { name: 'customer', url: 'http://localhost:8083/graphql' },
      { name: 'notification', url: 'http://localhost:8084/graphql' },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url })
  },
})

async function start() {
  const server = new ApolloServer({ gateway })
  await server.start()

  const app = express()
  app.use(
    '/graphql',
    cors({ origin: 'http://localhost:5173' }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ authorization: req.headers.authorization }),
    })
  )

  app.listen(4000, () => {
    console.log('Gateway ready at http://localhost:4000/graphql')
  })
}

start()
