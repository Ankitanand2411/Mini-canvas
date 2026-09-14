import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../errors/ApiError.js';

export function notFound(req, res) {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    const body = { message: err.message };
    if (err.details) body.errors = err.details;
    return res.status(err.status).json(body);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value';
    return res.status(409).json({ message: `${field} already in use` });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
