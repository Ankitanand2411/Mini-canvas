import { z } from 'zod';

const num = z.number().finite();
const hexColor = z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i, 'Must be a hex color like #rrggbb');

export const elementSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: z.enum(['rect', 'circle', 'text']),
    name: z.string().max(60).optional(),
    x: num,
    y: num,
    width: num.min(1),
    height: num.min(1),
    rotation: num.default(0),
    fill: hexColor,
    stroke: hexColor.optional(),
    strokeWidth: num.min(0).optional(),
    opacity: num.min(0).max(1).default(1),
    cornerRadius: num.min(0).optional(),
    text: z.string().max(2000).optional(),
    fontSize: num.min(4).max(400).optional(),
    fontFamily: z.string().max(60).optional(),
    fontStyle: z.enum(['normal', 'bold', 'italic', 'bold italic']).optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    visible: z.boolean().default(true),
    locked: z.boolean().default(false),
  })
  .strict();

export const createCanvasSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    width: num.min(100).max(8000).optional(),
    height: num.min(100).max(8000).optional(),
    background: hexColor.optional(),
    elements: z.array(elementSchema).max(500).optional(),
  })
  .strict();

export const updateCanvasSchema = createCanvasSchema.refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid id'),
});
