import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

const VerificationCodeSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const VerificationCode = mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);

export default VerificationCode;
