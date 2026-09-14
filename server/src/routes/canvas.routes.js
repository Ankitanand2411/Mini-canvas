import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createCanvasSchema, updateCanvasSchema, idParamSchema } from '../validation/canvas.schema.js';
import {
  listCanvases,
  createCanvas,
  getCanvas,
  updateCanvas,
  deleteCanvas,
} from '../controllers/canvas.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCanvases);
router.post('/', validate({ body: createCanvasSchema }), createCanvas);
router.get('/:id', validate({ params: idParamSchema }), getCanvas);
router.put('/:id', validate({ params: idParamSchema, body: updateCanvasSchema }), updateCanvas);
router.delete('/:id', validate({ params: idParamSchema }), deleteCanvas);

export default router;
