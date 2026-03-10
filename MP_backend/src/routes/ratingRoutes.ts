import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createRating,
  getUserRatings,
  getPendingRatings,
  getGameRatings,
  getUserAverageRating,
  getGameUserAverageRating,
} from '../controllers/ratingController';

const router = express.Router();

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Oyun sonrası oylama yap
 *     tags: [Rating]
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
 *               - ratedId
 *               - rating
 *             properties:
 *               gameSessionId:
 *                 type: string
 *               ratedId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Oylama başarıyla oluşturuldu
 */
router.post('/', protect, createRating);

/**
 * @swagger
 * /api/ratings/user/:userId:
 *   get:
 *     summary: Kullanıcının aldığı yorumları getir
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/user/:userId', getUserRatings);

/**
 * @swagger
 * /api/ratings/pending:
 *   get:
 *     summary: Kullanıcının oy verebileceği oyunları getir
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/pending', protect, getPendingRatings);

/**
 * @swagger
 * /api/ratings/game/:gameId:
 *   get:
 *     summary: Belirli bir oyun için tüm katılımcıları ve oy durumlarını getir
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/game/:gameId', protect, getGameRatings);

/**
 * @swagger
 * /api/ratings/user/:userId/average:
 *   get:
 *     summary: Kullanıcının ortalama değerlendirme puanını getir
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/user/:userId/average', getUserAverageRating);

/**
 * @swagger
 * /api/ratings/game/:gameId/user/:userId/average:
 *   get:
 *     summary: Belirli bir oyun için kullanıcının aldığı ortalama değerlendirme puanını getir
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/game/:gameId/user/:userId/average', getGameUserAverageRating);

export default router;
