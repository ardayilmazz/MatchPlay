import mongoose from 'mongoose';
import { City } from '../models/Location';
import dotenv from 'dotenv';

dotenv.config();

// Önceden ObjectId oluştur - referanslar için
const cityId = new mongoose.Types.ObjectId();
const bagcilarId = new mongoose.Types.ObjectId();
const bakirkoyId = new mongoose.Types.ObjectId();
const avcilarId = new mongoose.Types.ObjectId();
const kadikoyId = new mongoose.Types.ObjectId();

const locations = [
  {
    _id: cityId,
    name: 'İstanbul',
    districts: [
      {
        _id: bagcilarId,
        name: 'Bağcılar',
        cityId: cityId.toString(),
        venues: [
          {
            name: 'Starbucks',
            address: 'Bağcılar, İstanbul',
            districtId: bagcilarId.toString(),
          },
        ],
      },
      {
        _id: bakirkoyId,
        name: 'Bakırköy',
        cityId: cityId.toString(),
        venues: [
          {
            name: 'Lost',
            address: 'Bakırköy, İstanbul',
            districtId: bakirkoyId.toString(),
          },
        ],
      },
      {
        _id: avcilarId,
        name: 'Avcılar',
        cityId: cityId.toString(),
        venues: [
          {
            name: 'RedKafe',
            address: 'Avcılar, İstanbul',
            districtId: avcilarId.toString(),
          },
        ],
      },
      {
        _id: kadikoyId,
        name: 'Kadıköy',
        cityId: cityId.toString(),
        venues: [
          {
            name: 'Coffy',
            address: 'Kadıköy, İstanbul',
            districtId: kadikoyId.toString(),
          },
        ],
      },
    ],
  },
];

async function seedLocations() {
  try {
    // Ana uygulama MONGO_URI kullanıyor - aynı veritabanına (Atlas) bağlanmalıyız
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/matchplay';
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/matchplay') {
      console.warn('⚠️ MONGO_URI tanımlı değil. .env dosyasında MONGO_URI=... olduğundan emin olun (MongoDB Atlas bağlantı string).');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB (DB: ${mongoose.connection.name})`);

    // Mevcut lokasyonları temizle
    console.log('Clearing existing locations...');
    await City.deleteMany({});

    // Yeni lokasyonları ekle
    console.log('Adding locations...');
    await City.insertMany(locations);

    const count = await City.countDocuments();
    console.log(`✅ Successfully seeded ${count} cities with locations`);
    console.log('📍 Available: İstanbul > Bağcılar (Starbucks), Bakırköy (Lost), Avcılar (RedKafe), Kadıköy (Coffy)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    process.exit(1);
  }
}

seedLocations();
