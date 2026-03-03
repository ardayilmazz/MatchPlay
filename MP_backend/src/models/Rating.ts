import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  gameSessionId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId; // Oy veren kullanıcı
  ratedId: mongoose.Types.ObjectId; // Oy alan kullanıcı
  rating: number; // 1-5 arası yıldız sayısı
  comment?: string; // Yorum
  createdAt?: Date;
  updatedAt?: Date;
}

const RatingSchema: Schema = new Schema(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
      index: true,
    },
    raterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ratedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Bir kullanıcı aynı oyun için aynı kişiye sadece bir kez oy verebilir
RatingSchema.index({ gameSessionId: 1, raterId: 1, ratedId: 1 }, { unique: true });

const Rating = mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;
