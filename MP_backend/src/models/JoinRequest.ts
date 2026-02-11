import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  gameSessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string; // Kullanıcının opsiyonel mesajı
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const JoinRequestSchema: Schema = new Schema(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      required: true,
    },
    message: {
      type: String,
      maxlength: 200,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Aynı kullanıcı aynı oyuna birden fazla istek gönderemesin
JoinRequestSchema.index({ gameSessionId: 1, userId: 1 }, { unique: true });

const JoinRequest = mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);

export default JoinRequest;
