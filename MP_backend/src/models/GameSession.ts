import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  creatorId: mongoose.Types.ObjectId;
  gameTypeId: mongoose.Types.ObjectId;

  // Aşama 2: Açıklama
  title: string;
  description?: string;
  tags?: string[];

  // Aşama 3: Konum ve Zaman
  cityId?: string;
  cityName?: string;
  districtId?: string;
  districtName?: string;
  venueId?: string;
  venueName?: string;
  venueAddress?: string;
  feeAmount?: number; // Oyun ücreti (TL)
  startDate?: Date;
  estimatedDuration?: number; // dakika

  // Aşama 4: Ekip
  totalPlayers?: number;
  neededPlayers?: number;
  teamAssignment?: 'manual' | 'random' | null;
  skillLevel?: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel';
  hasEquipment?: boolean;

  // Aşama 5: Oyuncu Kriterleri
  genderPreference?: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli';

  // Oyun Durumu
  status: 'draft' | 'open' | 'full' | 'cancelled' | 'completed';
  gameStatus: 'not_started' | 'in_progress' | 'completed';
  currentPlayers: mongoose.Types.ObjectId[]; // Deprecated - acceptedPlayers kullanın
  acceptedPlayers: mongoose.Types.ObjectId[]; // Oyuna kabul edilen oyuncular (creator hariç)
  pendingRequests: mongoose.Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

const GameSessionSchema: Schema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'GameType',
      required: true,
    },

    // Aşama 2: Açıklama
    title: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],

    // Aşama 3: Konum ve Zaman
    cityId: { type: String },
    cityName: { type: String },
    districtId: { type: String },
    districtName: { type: String },
    venueId: { type: String },
    venueName: { type: String },
    venueAddress: { type: String },
    feeAmount: { type: Number, default: 0 }, // Oyun ücreti (TL), 0 = ücretsiz
    startDate: { type: Date },
    estimatedDuration: { type: Number }, // dakika

    // Aşama 4: Ekip
    totalPlayers: { type: Number },
    neededPlayers: { type: Number },
    teamAssignment: {
      type: String,
      enum: ['manual', 'random', null],
      default: null,
    },
    skillLevel: {
      type: String,
      enum: ['ilk_defa', 'az_bilenler', 'orta', 'iyi', 'profesyonel'],
    },
    hasEquipment: { type: Boolean },

    // Aşama 5: Oyuncu Kriterleri
    genderPreference: {
      type: String,
      enum: ['herkes', 'kizlar', 'erkekler', 'karma_dengeli'],
      default: 'herkes',
    },

    // Oyun Durumu
    status: {
      type: String,
      enum: ['draft', 'open', 'full', 'cancelled', 'completed'],
      default: 'draft',
      required: true,
    },
    gameStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      required: true,
    },
    currentPlayers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    acceptedPlayers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        // gameTypeId populate edildiyse gameType olarak da döndür
        if (ret.gameTypeId && typeof ret.gameTypeId === 'object') {
          ret.gameType = ret.gameTypeId;
        }
        return ret;
      },
    },
  }
);

const GameSession = mongoose.model<IGameSession>(
  'GameSession',
  GameSessionSchema
);

export default GameSession;

