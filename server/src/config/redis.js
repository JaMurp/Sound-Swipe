import { createClient } from 'redis';

const client = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6380,
  },
});

export default client;

