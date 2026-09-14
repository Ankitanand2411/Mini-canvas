import mongoose from 'mongoose';

// validation lives in validation/canvas.schema.js; this only mirrors types and defaults
const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['rect', 'circle', 'text'], required: true },
    name: String,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    fill: { type: String, required: true },
    stroke: String,
    strokeWidth: Number,
    opacity: { type: Number, default: 1 },
    cornerRadius: Number,
    text: String,
    fontSize: Number,
    fontFamily: String,
    fontStyle: String,
    align: String,
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
  },
  { _id: false },
);

const canvasSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: 'Untitled', maxlength: 120 },
    width: { type: Number, default: 1280, min: 100, max: 8000 },
    height: { type: Number, default: 800, min: 100, max: 8000 },
    background: { type: String, default: '#ffffff' },
    elements: { type: [elementSchema], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

export const Canvas = mongoose.model('Canvas', canvasSchema);
