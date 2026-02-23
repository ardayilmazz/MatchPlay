import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  initiateCancellationVote,
  submitVote,
  getCancellationVote,
  getCancellationVoteById,
} from '../controllers/cancellationVoteController';

const router = express.Router();

/**
 * @swagger
 * /api/cancellation-votes/initiate:
 *   post:
 *     summary: Oyun iptali için oylama başlat
 *     tags: [CancellationVotes]
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
 *         description: Oylama başlatıldı
 *       400:
 *         description: Geçersiz istek
 *       403:
 *         description: Yetki yok
 *       404:
 *         description: Oyun bulunamadı
 */
router.post('/initiate', protect, initiateCancellationVote);

/**
 * @swagger
 * /api/cancellation-votes/{voteId}/vote:
 *   post:
 *     summary: Oyun iptali için oy kullan
 *     tags: [CancellationVotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vote
 *             properties:
 *               vote:
 *                 type: string
 *                 enum: [approve, reject]
 *     responses:
 *       200:
 *         description: Oy kaydedildi
 *       400:
 *         description: Geçersiz istek
 *       403:
 *         description: Yetki yok
 *       404:
 *         description: Oylama bulunamadı
 */
router.post('/:voteId/vote', protect, submitVote);

/**
 * @swagger
 * /api/cancellation-votes/game/{gameSessionId}:
 *   get:
 *     summary: Oyun için oylama durumunu getir
 *     tags: [CancellationVotes]
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
 *       404:
 *         description: Oylama bulunamadı
 */
router.get('/game/:gameSessionId', protect, getCancellationVote);

/**
 * @swagger
 * /api/cancellation-votes/{voteId}:
 *   get:
 *     summary: VoteId ile oylama durumunu getir
 *     tags: [CancellationVotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Oylama bulunamadı
 */
router.get('/:voteId', protect, getCancellationVoteById);

export default router;
