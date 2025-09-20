import { Schema, model } from 'mongoose';

const degreeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  versionKey: false,
  timestamps: true
});

export default model('Degree', degreeSchema);
