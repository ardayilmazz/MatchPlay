import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  sendJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
  getGameRequests,
  getMyRequestForGame,
  leaveGame,
} from '../controllers/joinRequestController';

const router = express.Router();

// Tüm route'lar korumalı (giriş gerekli)

/**
 * @swagger
 * /api/games/sessions/{id}/join:
 *   post:
 *     summary: Oyuna katılma isteği gönder
 *     tags: [Join Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: İstek gönderildi
 *       400:
 *         description: Hata (zaten katıldı, duplicate request, vb.)
 */
router.post('/sessions/:id/join', protect, sendJoinRequest);

/**
 * @swagger
 * /api/games/sessions/{id}/my-request:
 *   get:
 *     summary: Kullanıcının oyun için isteğini getir
 *     tags: [Join Requests]
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
 *         description: Kullanıcının isteği
 */
router.get('/sessions/:id/my-request', protect, getMyRequestForGame);

/**
 * @swagger
 * /api/games/sessions/{id}/requests:
 *   get:
 *     summary: Oyunun katılma isteklerini getir (sadece lobi kurucusu)
 *     tags: [Join Requests]
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
 *         description: İstekler listesi
 */
router.get('/sessions/:id/requests', protect, getGameRequests);

/**
 * @swagger
 * /api/games/requests/{id}/accept:
 *   post:
 *     summary: Katılma isteğini kabul et
 *     tags: [Join Requests]
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
 *         description: İstek kabul edildi
 */
router.post('/requests/:id/accept', protect, acceptJoinRequest);

/**
 * @swagger
 * /api/games/requests/{id}/reject:
 *   post:
 *     summary: Katılma isteğini reddet
 *     tags: [Join Requests]
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
 *         description: İstek reddedildi
 */
router.post('/requests/:id/reject', protect, rejectJoinRequest);

/**
 * @swagger
 * /api/games/requests/{id}/cancel:
 *   post:
 *     summary: Katılma isteğini iptal et (istek sahibi)
 *     tags: [Join Requests]
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
 *         description: İstek iptal edildi
 */
router.post('/requests/:id/cancel', protect, cancelJoinRequest);

/**
 * @swagger
 * /api/games/sessions/{id}/leave:
 *   post:
 *     summary: Oyundan ayrıl (kabul edilmiş oyuncu)
 *     tags: [Join Requests]
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
 *         description: Oyundan ayrıldı
 */
router.post('/sessions/:id/leave', protect, leaveGame);

export default router;
