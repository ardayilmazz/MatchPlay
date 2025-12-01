import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import VerificationCode from '../models/VerificationCode'; // Yeni modeli import et
import sendEmail from '../utils/sendEmail'; // E-posta gönderim fonksiyonunu import et
import dotenv from 'dotenv';

dotenv.config(); // .env değişkenlerini yükle

// @desc    Send verification code to user's email
// @route   POST /api/users/send-verification-code
// @access  Public
export const sendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'E-posta adresi gereklidir.' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    // Bu e-postaya ait eski kodları temizle
    await VerificationCode.deleteMany({ email });

    // Yeni bir doğrulama kodu oluştur
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli kod
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika geçerlilik süresi

    await VerificationCode.create({
      email,
      code,
      expiresAt,
    });

    // E-postayı gönder
    await sendEmail({
      from: `MatchPlay Destek <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'MatchPlay Doğrulama Kodunuz',
      text: `MatchPlay hesabınızı doğrulamak için kodunuz: ${code}\nBu kod 10 dakika geçerlidir.`,
      html: `<p>MatchPlay hesabınızı doğrulamak için kodunuz: <strong>${code}</strong></p><p>Bu kod 10 dakika geçerlidir.</p>`,
    });

    res.status(200).json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Kod gönderilirken bir hata oluştu.' });
  }
};

// @desc    Verify the 6-digit code
// @route   POST /api/users/verify-code
// @access  Public
export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'E-posta ve kod gereklidir.' });
  }

  try {
    const verificationEntry = await VerificationCode.findOne({ email, code });

    if (!verificationEntry) {
      return res.status(400).json({ message: 'Geçersiz doğrulama kodu.' });
    }

    if (verificationEntry.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: verificationEntry._id });
      return res.status(400).json({ message: 'Doğrulama kodunun süresi dolmuş.' });
    }

    // Kod doğrulandı, veritabanından sil
    await VerificationCode.deleteOne({ _id: verificationEntry._id });

    res.status(200).json({ message: 'E-posta başarıyla doğrulandı.' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Kod doğrulanırken bir hata oluştu.' });
  }
};


const generateToken = (id: any) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ id }, secret!, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user after all steps are completed
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { 
    firstName, 
    lastName, 
    email, 
    password, 
    birthDate, 
    university, 
    department,
    // profilePhoto ve bio daha sonra eklenebilir veya isteğe bağlı olabilir.
  } = req.body;

  // Temel alanların kontrolü
  if (!firstName || !lastName || !email || !password || !birthDate) {
    return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları doldurun.' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user: IUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthDate: new Date(birthDate),
      university,
      department,
      isProfileCompleted: true, // Profilin tamamlandığını işaretliyoruz
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
