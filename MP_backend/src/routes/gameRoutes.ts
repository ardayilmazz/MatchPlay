import express from 'express';
import {
  getGameTypes,
  createOrUpdateGameSession,
  getMyDraft,
  getMyGameSessions,
  getGameSessions,
  getGameSession,
  updateGameSession,
  deleteGameSession,
  getStatistics,
} from '../controllers/gameController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/games/types:
 *   get:
 *     summary: Tüm oyun tiplerini getir
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameType'
 */
router.get('/types', getGameTypes);

/**
 * @swagger
 * /api/games/statistics:
 *   get:
 *     summary: Ana sayfa istatistiklerini getir
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalGames:
 *                       type: number
 *                     activePlayers:
 *                       type: number
 *                     todayGames:
 *                       type: number
 *                     upcomingGames:
 *                       type: number
 */
router.get('/statistics', getStatistics);

/**
 * @swagger
 * /api/games/sessions:
 *   post:
 *     summary: Yeni oyun oturumu oluştur veya güncelle
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Güncellenecek oturum ID (varsa)
 *               gameTypeId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, open]
 *     responses:
 *       201:
 *         description: Oyun oluşturuldu
 *       200:
 *         description: Oyun güncellendi
 */
router.post('/sessions', protect, createOrUpdateGameSession);

/**
 * @swagger
 * /api/games/sessions/my-draft:
 *   get:
 *     summary: Kullanıcının taslak oyununu getir
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Taslak bulunamadı
 */
router.get('/sessions/my-draft', protect, getMyDraft);

/**
 * @swagger
 * /api/games/sessions/my:
 *   get:
 *     summary: Kullanıcının tüm oyunlarını getir
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/sessions/my', protect, getMyGameSessions);

/**
 * @swagger
 * /api/games/sessions:
 *   get:
 *     summary: Tüm açık oyunları listele
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: gameType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/sessions', getGameSessions);

/**
 * @swagger
 * /api/games/sessions/{id}:
 *   get:
 *     summary: Tek bir oyun oturumunu getir
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Oyun bulunamadı
 */
router.get('/sessions/:id', getGameSession);

/**
 * @swagger
 * /api/games/sessions/{id}:
 *   put:
 *     summary: Oyun oturumunu güncelle
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               totalPlayers:
 *                 type: number
 *     responses:
 *       200:
 *         description: Oyun güncellendi
 *       404:
 *         description: Oyun bulunamadı
 */
router.put('/sessions/:id', protect, updateGameSession);

/**
 * @swagger
 * /api/games/sessions/{id}:
 *   delete:
 *     summary: Oyun oturumunu sil
 *     tags: [Games]
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
 *         description: Oyun silindi
 *       404:
 *         description: Oyun bulunamadı
 */
router.delete('/sessions/:id', protect, deleteGameSession);

export default router;

