import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import gameRoutes from './routes/gameRoutes';
import locationRoutes from './routes/locationRoutes';
import joinRequestRoutes from './routes/joinRequestRoutes';
import notificationRoutes from './routes/notificationRoutes';
import cancellationVoteRoutes from './routes/cancellationVoteRoutes';
import waitlistRoutes from './routes/waitlistRoutes';
import swaggerSpec from './config/swagger';
import { updateGameStatuses, checkAndAutoCancelGames } from './utils/gameStatusUpdater';

dotenv.config();

// Veritabanı bağlantısını başlat
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS ayarları - TÜM cihazlardan ve ağlardan erişime izin ver
app.use(cors({
  origin: '*', // Tüm origin'lere izin ver (development için)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // credentials: true için origin '*' kullanılamaz
  optionsSuccessStatus: 200
}));

app.use(express.json()); // Body parser for JSON requests

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Şifreleri loglamadan göster
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '***';
    console.log('Request Body:', JSON.stringify(logBody, null, 2));
  }
  next();
});

// Response logging middleware
app.use((req: Request, res: Response, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/games', joinRequestRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cancellation-votes', cancellationVoteRoutes);
app.use('/api/waitlist', waitlistRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Merhaba MatchPlay Backend! API dokümantasyonu için /api-docs adresini ziyaret edin.');
});

// Backend'i tüm network interface'lerinde dinle (0.0.0.0)
// Bu sayede localhost, yerel ağ IP'si ve diğer tüm interface'lerden erişilebilir
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend sunucusu başlatıldı: http://localhost:${PORT}`);
  console.log(`Yerel ağ erişimi: http://172.20.10.3:${PORT}`);
  console.log(`Swagger dokümantasyonu: http://localhost:${PORT}/api-docs`);
  console.log(`Başlangıç zamanı: ${new Date().toISOString()}`);
  
  // Oyun durumlarını güncelleme job'ını başlat (her 1 dakikada bir)
  updateGameStatuses(); // İlk çalıştırma
  setInterval(updateGameStatuses, 60000); // Her 1 dakikada bir
  console.log('Oyun durumu güncelleme job\'ı başlatıldı (1 dakika aralıklarla)');

  // Otomatik iptal kontrolü job'ını başlat (her 5 dakikada bir)
  checkAndAutoCancelGames(); // İlk çalıştırma
  setInterval(checkAndAutoCancelGames, 5 * 60000); // Her 5 dakikada bir
  console.log('Otomatik iptal kontrolü job\'ı başlatıldı (5 dakika aralıklarla)');
});

export default server;
