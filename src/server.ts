import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { env } from './DTO/env';
import { transactionsRoutes } from './routes/transactions';

const app = fastify()

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`);
});

app.register(cookie);

app.register(transactionsRoutes, {
  prefix: 'transactions',
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
