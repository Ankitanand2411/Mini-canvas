import app from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';

try {
  await connectDb();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}

const server = app.listen(env.PORT, () => {
  console.log(`Listening on :${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
  // give in-flight requests a chance, then bail
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
