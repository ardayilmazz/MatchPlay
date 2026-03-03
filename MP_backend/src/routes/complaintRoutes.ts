import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createComplaint,
  getMyComplaints,
} from '../controllers/complaintController';

const router = express.Router();

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Şikayet oluştur
 *     tags: [Complaint]
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
 *               - reportedId
 *               - message
 *             properties:
 *               gameSessionId:
 *                 type: string
 *               reportedId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Şikayet başarıyla oluşturuldu
 */
router.post('/', protect, createComplaint);

/**
 * @swagger
 * /api/complaints/my:
 *   get:
 *     summary: Kullanıcının şikayetlerini getir
 *     tags: [Complaint]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/my', protect, getMyComplaints);

export default router;
