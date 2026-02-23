import mongoose, { Schema, Document } from 'mongoose';

export interface ICancellationVote extends Document {
  gameSessionId: mongoose.Types.ObjectId;
  initiatorId: mongoose.Types.ObjectId; // Oyunu iptal etmek isteyen kullanıcı (creator)
  votes: {
    userId: mongoose.Types.ObjectId;
    vote: 'approve' | 'reject'; // approve = iptal etmeyi kabul ediyor, reject = iptal etmeyi reddediyor
    votedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected'; // pending = oylama devam ediyor, approved = herkes onayladı, rejected = en az 1 kişi reddetti
  createdAt?: Date;
  updatedAt?: Date;
}

const CancellationVoteSchema: Schema = new Schema(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'GameSession',
      required: true,
      unique: true, // Bir oyun için sadece bir oylama olabilir
    },
    initiatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    votes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        vote: {
          type: String,
          enum: ['approve', 'reject'],
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const CancellationVote = mongoose.model<ICancellationVote>('CancellationVote', CancellationVoteSchema);

export default CancellationVote;
