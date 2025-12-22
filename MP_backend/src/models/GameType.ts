import mongoose, { Schema, Document } from 'mongoose';

export interface IGameType extends Document {
  name: string;
  slug: string;
  category: 'masa_tas' | 'spor' | 'beceri' | 'kart';
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  hasTeams: boolean;
  teamAssignmentOptions?: ('manual' | 'random')[]; // Takım seçenekleri
  requiresEquipment: boolean;
  equipmentDescription?: string;
  venueType: 'indoor' | 'outdoor' | 'both';
  expectsFee: boolean;
  defaultDuration: number; // dakika
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const GameTypeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['masa_tas', 'spor', 'beceri', 'kart'],
    },
    icon: { type: String, required: true },
    minPlayers: { type: Number, required: true, min: 1 },
    maxPlayers: { type: Number, required: true, min: 1 },
    hasTeams: { type: Boolean, default: false },
    teamAssignmentOptions: {
      type: [String],
      enum: ['manual', 'random'],
      default: undefined,
    },
    requiresEquipment: { type: Boolean, default: false },
    equipmentDescription: { type: String },
    venueType: {
      type: String,
      required: true,
      enum: ['indoor', 'outdoor', 'both'],
    },
    expectsFee: { type: Boolean, default: false },
    defaultDuration: { type: Number, required: true, default: 60 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const GameType = mongoose.model<IGameType>('GameType', GameTypeSchema);

export default GameType;

