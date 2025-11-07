import mongoose, { Schema, Document } from 'mongoose';

// IUser arayüzü, TypeScript'in User objesinin yapısını anlamasını sağlar.
export interface IUser extends Document {
  email: string;
  password?: string; // Şifre her zaman gönderilmeyebilir, bu yüzden opsiyonel.
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  university?: string;
  department?: string;
  bio?: string;
  sports?: string[];
  skillLevel?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePhoto: { type: String },
  university: { type: String },
  department: { type: String },
  bio: { type: String },
  sports: [{ type: String }],
  skillLevel: { type: String },
}, {
  timestamps: true // Otomatik olarak createdAt ve updatedAt alanları ekler.
});

export default mongoose.model<IUser>('User', UserSchema);
