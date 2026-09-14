import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, passwordHash, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
