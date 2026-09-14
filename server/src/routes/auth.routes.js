import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validation/auth.schema.js';
import { register, login, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.get('/me', requireAuth, me);

export default router;
