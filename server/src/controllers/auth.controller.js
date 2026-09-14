import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../errors/ApiError.js';

const signToken = (user) => jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({ name, email, passwordHash: await User.hashPassword(password) });
  res.status(201).json({ token: signToken(user), user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json({ token: signToken(user), user });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user });
}
