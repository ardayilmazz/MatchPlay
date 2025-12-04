import mongoose, { Schema, Document } from 'mongoose';

// IUser arayüzü, TypeScript'in User objesinin yapısını anlamasını sağlar.
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  university?: string;
  department?: string;
  bio?: string;
  sports?: string[];
  skillLevel?: string;
  birthDate?: Date;
  isProfileCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePhoto: { type: String, required: false },
  university: { type: String, required: false },
  department: { type: String, required: false },
  bio: { type: String, required: false },
  sports: [{ type: String }],
  skillLevel: { type: String },
  birthDate: {
    type: Date,
    required: false, // Şimdilik zorunlu değil, register fonksiyonu dolduracak
  },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Otomatik olarak createdAt ve updatedAt alanları ekler.
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
