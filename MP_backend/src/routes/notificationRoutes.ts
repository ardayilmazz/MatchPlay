import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getNotifications,
  markAsRead,
  getRequestUserDetails,
} from '../controllers/notificationController';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Kullanıcının bildirimlerini getir
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Bildirimler listesi
 */
router.get('/', protect, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Bildirimi okundu olarak işaretle
 *     tags: [Notifications]
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
 *         description: Bildirim güncellendi
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @swagger
 * /api/games/requests/{id}/user:
 *   get:
 *     summary: Katılma isteği sahibinin detaylı bilgilerini getir
 *     tags: [Notifications]
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
 *         description: Kullanıcı bilgileri
 */
router.get('/requests/:id/user', protect, getRequestUserDetails);

export default router;
