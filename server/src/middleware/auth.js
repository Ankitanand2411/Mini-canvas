import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../errors/ApiError.js';

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(ApiError.unauthorized(err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'));
  }
}
