import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    maxlength: 240,
    default: '',
  },
}, { _id: false });

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'employer'],
  },
  companyProfile: {
    type: companySchema,
    default: undefined,
  },
}, {
  timestamps: true,
  collection: 'users',
});

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export default model('User', userSchema);