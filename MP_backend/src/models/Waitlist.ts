import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlist extends Document {
  gameSessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  position: number; // Sıra numarası (1'den başlar)
  status: 'waiting' | 'invited' | 'expired' | 'cancelled';
  notifiedAt?: Date; // Kontenjan açıldığında bildirim gönderildi mi
  createdAt?: Date;
  updatedAt?: Date;
}

const WaitlistSchema: Schema = new Schema(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['waiting', 'invited', 'expired', 'cancelled'],
      default: 'waiting',
      required: true,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Bir kullanıcı bir oyun için sadece bir bekleme listesi kaydı olabilir
WaitlistSchema.index({ gameSessionId: 1, userId: 1 }, { unique: true });

const Waitlist = mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);

export default Waitlist;
