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
  console.log(`[sendVerificationCode] İstek alındı - Email: ${email}`);

  if (!email) {
    console.log('[sendVerificationCode] Hata: E-posta adresi eksik');
    return res.status(400).json({ message: 'E-posta adresi gereklidir.' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`[sendVerificationCode] Hata: E-posta zaten kayıtlı - ${email}`);
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
    console.log(`[sendVerificationCode] Doğrulama kodu oluşturuldu: ${code} (${email})`);
    await sendEmail({
      from: `MatchPlay Destek <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'MatchPlay Doğrulama Kodunuz',
      text: `MatchPlay hesabınızı doğrulamak için kodunuz: ${code}\nBu kod 10 dakika geçerlidir.`,
      html: `<p>MatchPlay hesabınızı doğrulamak için kodunuz: <strong>${code}</strong></p><p>Bu kod 10 dakika geçerlidir.</p>`,
    });

    console.log(`[sendVerificationCode] Başarılı - Kod gönderildi: ${email}`);
    res.status(200).json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });
  } catch (error) {
    console.error('[sendVerificationCode] Hata:', error);
    res.status(500).json({ message: 'Kod gönderilirken bir hata oluştu.' });
  }
};

// @desc    Verify the 6-digit code
// @route   POST /api/users/verify-code
// @access  Public
export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  console.log(`[verifyCode] İstek alındı - Email: ${email}, Code: ${code}`);

  if (!email || !code) {
    console.log('[verifyCode] Hata: E-posta veya kod eksik');
    return res.status(400).json({ message: 'E-posta ve kod gereklidir.' });
  }

  try {
    const verificationEntry = await VerificationCode.findOne({ email, code });

    if (!verificationEntry) {
      console.log(`[verifyCode] Hata: Geçersiz kod - Email: ${email}, Code: ${code}`);
      return res.status(400).json({ message: 'Geçersiz doğrulama kodu.' });
    }

    if (verificationEntry.expiresAt < new Date()) {
      console.log(`[verifyCode] Hata: Kodun süresi dolmuş - Email: ${email}`);
      await VerificationCode.deleteOne({ _id: verificationEntry._id });
      return res.status(400).json({ message: 'Doğrulama kodunun süresi dolmuş.' });
    }

    // Kod doğrulandı, veritabanından sil
    await VerificationCode.deleteOne({ _id: verificationEntry._id });
    console.log(`[verifyCode] Başarılı - E-posta doğrulandı: ${email}`);

    res.status(200).json({ message: 'E-posta başarıyla doğrulandı.' });
  } catch (error) {
    console.error('[verifyCode] Hata:', error);
    res.status(500).json({ message: 'Kod doğrulanırken bir hata oluştu.' });
  }
};


const generateToken = (id: any) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ id }, secret!, {
    expiresIn: '30d',
  });
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`[loginUser] İstek alındı - Email: ${email}`);

  if (!email || !password) {
    console.log('[loginUser] Hata: E-posta veya şifre eksik');
    return res.status(400).json({ message: 'E-posta ve şifre gereklidir.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`[loginUser] Hata: Kullanıcı bulunamadı - ${email}`);
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`[loginUser] Hata: Geçersiz şifre - ${email}`);
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    console.log(`[loginUser] Başarılı - Kullanıcı giriş yaptı: ${email} (ID: ${user._id})`);
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: user.university,
      department: user.department,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      sports: user.sports || [],
      points: user.points || 0,
      createdAt: user.createdAt?.toISOString(),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[loginUser] Hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      console.log('[getCurrentUser] Hata: Kullanıcı bulunamadı');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    console.log(`[getCurrentUser] Başarılı - Kullanıcı bilgileri alındı: ${user.email}`);
    res.status(200).json({
      id: user._id,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: user.university,
      department: user.department,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      sports: user.sports || [],
      skillLevel: user.skillLevel,
      points: user.points || 0,
      createdAt: user.createdAt?.toISOString(),
    });
  } catch (error) {
    console.error('[getCurrentUser] Hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('[updateUserProfile] Hata: Kullanıcı bulunamadı');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Güncellenebilir alanlar
    if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
    if (req.body.university !== undefined) user.university = req.body.university;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.profilePhoto !== undefined) user.profilePhoto = req.body.profilePhoto;
    if (req.body.sports !== undefined) user.sports = req.body.sports;
    if (req.body.skillLevel !== undefined) user.skillLevel = req.body.skillLevel;

    const updatedUser = await user.save();

    console.log(`[updateUserProfile] Başarılı - Kullanıcı güncellendi: ${user.email}`);
    
    res.status(200).json({
      id: updatedUser._id,
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      university: updatedUser.university,
      department: updatedUser.department,
      profilePhoto: updatedUser.profilePhoto,
      bio: updatedUser.bio,
      sports: updatedUser.sports || [],
      skillLevel: updatedUser.skillLevel,
      points: updatedUser.points || 0,
      createdAt: updatedUser.createdAt?.toISOString(),
    });
  } catch (error) {
    console.error('[updateUserProfile] Hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
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
    profilePhoto,
    bio,
  } = req.body;

  console.log(`[registerUser] İstek alındı - Email: ${email}, Name: ${firstName} ${lastName}`);

  // Temel alanların kontrolü
  if (!firstName || !lastName || !email || !password || !birthDate) {
    console.log('[registerUser] Hata: Zorunlu alanlar eksik');
    return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları doldurun.' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`[registerUser] Hata: E-posta zaten kayıtlı - ${email}`);
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
      profilePhoto: profilePhoto || '',
      bio: bio || '',
      isProfileCompleted: true, // Profilin tamamlandığını işaretliyoruz
    });

    if (user) {
      console.log(`[registerUser] Başarılı - Kullanıcı oluşturuldu: ${email} (ID: ${user._id})`);
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        university: user.university,
        department: user.department,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        sports: user.sports || [],
        points: user.points || 0,
        createdAt: user.createdAt?.toISOString(),
        token: generateToken(user._id),
      });
    } else {
      console.log('[registerUser] Hata: Geçersiz kullanıcı verisi');
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
    }
  } catch (error) {
    console.error('[registerUser] Hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
