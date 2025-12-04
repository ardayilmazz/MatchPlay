import { Router } from 'express';
import { registerUser, sendVerificationCode, verifyCode, loginUser, getCurrentUser, updateUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/users/send-verification-code:
 *   post:
 *     summary: E-posta doğrulama kodu gönder
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendVerificationCodeRequest'
 *     responses:
 *       200:
 *         description: Doğrulama kodu başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendVerificationCodeResponse'
 *       400:
 *         description: Geçersiz istek veya e-posta zaten kayıtlı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/send-verification-code', sendVerificationCode);

/**
 * @swagger
 * /api/users/verify-code:
 *   post:
 *     summary: E-posta doğrulama kodunu doğrula
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyCodeRequest'
 *     responses:
 *       200:
 *         description: Kod başarıyla doğrulandı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyCodeResponse'
 *       400:
 *         description: Geçersiz kod veya kodun süresi dolmuş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-code', verifyCode);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla kaydedildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUserResponse'
 *       400:
 *         description: Geçersiz veri veya e-posta zaten kayıtlı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@university.edu.tr
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Geçersiz e-posta veya şifre
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Mevcut kullanıcı bilgilerini getir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 university:
 *                   type: string
 *                 department:
 *                   type: string
 *       401:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get('/me', protect, getCurrentUser);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Kullanıcı profilini güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               university:
 *                 type: string
 *               department:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePhoto:
 *                 type: string
 *               sports:
 *                 type: array
 *                 items:
 *                   type: string
 *               skillLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/me', protect, updateUserProfile);

export default router;
