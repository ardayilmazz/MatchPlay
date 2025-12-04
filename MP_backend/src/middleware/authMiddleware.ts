import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('[authMiddleware] Hata: Kullanıcı bulunamadı');
        return res.status(401).json({ message: 'Yetkisiz erişim, kullanıcı bulunamadı.' });
      }

      console.log(`[authMiddleware] Token doğrulandı - User ID: ${decoded.id}`);
      next();
    } catch (error) {
      console.error('[authMiddleware] Hata: Token doğrulanamadı', error);
      return res.status(401).json({ message: 'Yetkisiz erişim, token geçersiz.' });
    }
  } else {
    console.log('[authMiddleware] Hata: Token bulunamadı');
    return res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı.' });
  }
};

