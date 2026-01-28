import mongoose from 'mongoose';
import { City } from '../models/Location';
import dotenv from 'dotenv';

dotenv.config();

const locations = [
  {
    _id: 'istanbul',
    name: 'İstanbul',
    districts: [
      {
        _id: 'kadikoy',
        name: 'Kadıköy',
        cityId: 'istanbul',
        venues: [
          {
            _id: 'red-kafe',
            name: 'Red Kafe',
            address: 'Kadıköy, İstanbul',
            districtId: 'kadikoy',
          },
        ],
      },
    ],
  },
];

async function seedLocations() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchplay';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Mevcut lokasyonları temizle
    console.log('Clearing existing locations...');
    await City.deleteMany({});

    // Yeni lokasyonları ekle
    console.log('Adding locations...');
    await City.insertMany(locations);

    const count = await City.countDocuments();
    console.log(`✅ Successfully seeded ${count} cities with locations`);
    console.log('📍 Available: İstanbul > Kadıköy > Red Kafe');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    process.exit(1);
  }
}

seedLocations();
