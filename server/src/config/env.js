import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  CLIENT_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  NODE_ENV: z.string().default('development'),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment:');
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = Object.freeze(result.data);
