import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI bulunamadı, lütfen .env dosyasını kontrol edin.');
      process.exit(1);
    }
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB bağlantısı başarılı.');
    console.log(`Veritabanı: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

export default connectDB;
