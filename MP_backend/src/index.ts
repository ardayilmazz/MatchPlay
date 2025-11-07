import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';

dotenv.config();

// Veritabanı bağlantısını başlat
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Body parser for JSON requests

app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Merhaba MatchPlay Backend!');
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
