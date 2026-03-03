import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  gameSessionId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId; // Şikayet eden kullanıcı
  reportedId: mongoose.Types.ObjectId; // Şikayet edilen kullanıcı
  message: string; // Şikayet mesajı
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt?: Date;
  updatedAt?: Date;
}

const ComplaintSchema: Schema = new Schema(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Bir kullanıcı aynı oyun için aynı kişiye sadece bir kez şikayet edebilir
ComplaintSchema.index({ gameSessionId: 1, reporterId: 1, reportedId: 1 }, { unique: true });

const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
