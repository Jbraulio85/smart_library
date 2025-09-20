import { Schema, model } from 'mongoose';

const documentSchema = Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  accessedBy: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      accessedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  versionKey: false
});

export default model('Document', documentSchema);
