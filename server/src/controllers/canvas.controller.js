import { Canvas } from '../models/Canvas.js';
import { ApiError } from '../errors/ApiError.js';

export async function listCanvases(req, res) {
  const canvases = await Canvas.find({ owner: req.user.id }).sort({ updatedAt: -1 });
  res.json(canvases);
}

export async function createCanvas(req, res) {
  const canvas = await Canvas.create({ ...req.body, owner: req.user.id });
  res.status(201).json(canvas);
}

export async function getCanvas(req, res) {
  const canvas = await Canvas.findOne({ _id: req.params.id, owner: req.user.id });
  if (!canvas) throw ApiError.notFound('Canvas not found');
  res.json(canvas);
}

export async function updateCanvas(req, res) {
  const canvas = await Canvas.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true, runValidators: true },
  );
  if (!canvas) throw ApiError.notFound('Canvas not found');
  res.json(canvas);
}

export async function deleteCanvas(req, res) {
  const { deletedCount } = await Canvas.deleteOne({ _id: req.params.id, owner: req.user.id });
  if (!deletedCount) throw ApiError.notFound('Canvas not found');
  res.status(204).end();
}
