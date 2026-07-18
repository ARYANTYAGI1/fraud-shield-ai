import { Schema, model, Types } from 'mongoose';

const ScanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scanType: {
      type: String,
      enum: ['text', 'url', 'image', 'pdf', 'audio'],
      required: true,
    },
    inputData: {
      type: String,
      required: true,
    },
    result: {
      riskScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      category: {
        type: String,
        enum: ['Safe', 'Suspicious', 'Fraud', 'High Risk Scam', 'Critical'],
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      reasons: {
        type: [String],
        default: [],
      },
      recommendation: {
        type: String,
        required: true,
      },
      redFlags: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Scan = model('Scan', ScanSchema);
export default Scan;
