import { Router } from 'express';
import auth from './auth.routes.js';
import canvases from './canvas.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', auth);
router.use('/canvases', canvases);

export default router;
