import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import gameRoutes from './routes/gameRoutes';
import swaggerSpec from './config/swagger';

dotenv.config();

// Veritabanı bağlantısını başlat
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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

app.get('/', (req: Request, res: Response) => {
  res.send('Merhaba MatchPlay Backend! API dokümantasyonu için /api-docs adresini ziyaret edin.');
});

app.listen(PORT, () => {
  console.log(`Backend sunucusu başlatıldı: http://localhost:${PORT}`);
  console.log(`Swagger dokümantasyonu: http://localhost:${PORT}/api-docs`);
  console.log(`Başlangıç zamanı: ${new Date().toISOString()}`);
});
