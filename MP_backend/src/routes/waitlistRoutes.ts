import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  addToWaitlist,
  removeFromWaitlist,
  getUserWaitlist,
  getGameWaitlist,
  getWaitlistEntry,
} from '../controllers/waitlistController';

const router = express.Router();

/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     summary: Bekleme listesine ekle
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameSessionId
 *             properties:
 *               gameSessionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bekleme listesine eklendi
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Oyun bulunamadı
 */
router.post('/', protect, addToWaitlist);

/**
 * @swagger
 * /api/waitlist/my:
 *   get:
 *     summary: Kullanıcının bekleme listesini getir
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/my', protect, getUserWaitlist);

/**
 * @swagger
 * /api/waitlist/game/:gameSessionId:
 *   get:
 *     summary: Oyun için bekleme listesini getir (oyun kurucusu için)
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameSessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       403:
 *         description: Yetki yok
 */
router.get('/game/:gameSessionId', protect, getGameWaitlist);

/**
 * @swagger
 * /api/waitlist/game/:gameSessionId/my:
 *   get:
 *     summary: Kullanıcının belirli bir oyun için bekleme listesi kaydını getir
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameSessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/game/:gameSessionId/my', protect, getWaitlistEntry);

/**
 * @swagger
 * /api/waitlist/:id:
 *   delete:
 *     summary: Bekleme listesinden çıkar
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bekleme listesinden çıkarıldı
 *       404:
 *         description: Kayıt bulunamadı
 */
router.delete('/:id', protect, removeFromWaitlist);

export default router;
