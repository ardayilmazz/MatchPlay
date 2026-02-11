import { Request, Response } from 'express';
import JoinRequest from '../models/JoinRequest';
import GameSession from '../models/GameSession';
import Notification from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';

// POST /api/games/sessions/:id/join - Oyuna katılma isteği gönder
export const sendJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id: gameSessionId } = req.params;
    const userId = (req as any).user._id;
    const { message } = req.body;

    console.log('[sendJoinRequest] Katılma isteği:', { gameSessionId, userId });

    // GameSession kontrolü
    if (!mongoose.Types.ObjectId.isValid(gameSessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oyun ID.',
      });
    }

    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı.',
      });
    }

    // Oyun durumu kontrolü
    if (gameSession.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Bu oyun artık katılıma açık değil.',
      });
    }

    // Kullanıcı zaten katılmış mı?
    if (gameSession.currentPlayers.some((p) => p.toString() === userId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Bu oyuna zaten katıldınız.',
      });
    }

    // Kullanıcı oyun kurucusu mu?
    if (gameSession.creatorId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendi oluşturduğunuz oyuna katılma isteği gönderemezsiniz.',
      });
    }

    // Daha önce istek gönderilmiş mi kontrol et
    const existingRequest = await JoinRequest.findOne({
      gameSessionId,
      userId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Bu oyuna zaten katılma isteği gönderdiniz.',
      });
    }

    // Katılma isteği oluştur
    const joinRequest = await JoinRequest.create({
      gameSessionId,
      userId,
      message: message || '',
      status: 'pending',
    });

    // Kullanıcı bilgilerini al
    const user = await User.findById(userId).select('firstName lastName');

    // Lobi sahibine bildirim gönder
    await Notification.create({
      userId: gameSession.creatorId,
      type: 'join_request_received',
      title: 'Yeni Katılım İsteği',
      message: `${user?.firstName} ${user?.lastName} oyununuza katılmak istiyor.`,
      data: {
        gameSessionId: gameSessionId,
        requestId: String(joinRequest._id),
        senderId: userId.toString(),
      },
      read: false,
    });

    console.log('[sendJoinRequest] İstek oluşturuldu:', joinRequest._id);

    res.status(201).json({
      success: true,
      message: 'Katılma isteği gönderildi.',
      data: joinRequest,
    });
  } catch (error: any) {
    console.error('[sendJoinRequest] Hata:', error.message);
    
    // Duplicate key error (aynı oyuna tekrar istek)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu oyuna zaten katılma isteği gönderdiniz.',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Katılma isteği gönderilirken bir hata oluştu.',
    });
  }
};

// POST /api/games/requests/:id/accept - Katılma isteğini kabul et
export const acceptJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id: requestId } = req.params;
    const userId = (req as any).user._id;

    console.log('[acceptJoinRequest] İstek kabul ediliyor:', { requestId, userId });

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz istek ID.',
      });
    }

    // İsteği bul
    const joinRequest = await JoinRequest.findById(requestId)
      .populate('userId', 'firstName lastName')
      .populate('gameSessionId');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Katılma isteği bulunamadı.',
      });
    }

    const gameSession = joinRequest.gameSessionId as any;

    // Sadece lobi kurucusu kabul edebilir
    if (gameSession.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok.',
      });
    }

    // İstek zaten işlenmiş mi?
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu istek zaten işlenmiş.',
      });
    }

    // Oyunda yer var mı?
    const currentPlayerCount = gameSession.currentPlayers.length;
    if (currentPlayerCount >= gameSession.totalPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Oyunda yer kalmadı.',
      });
    }

    // İsteği kabul et
    joinRequest.status = 'accepted';
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    // Oyuncuyu oyuna ekle
    await GameSession.findByIdAndUpdate(gameSession._id, {
      $addToSet: { currentPlayers: joinRequest.userId },
    });

    // Oyun doldu mu kontrol et
    const updatedSession = await GameSession.findById(gameSession._id);
    if (updatedSession && updatedSession.currentPlayers.length >= (updatedSession.totalPlayers || 0)) {
      await GameSession.findByIdAndUpdate(gameSession._id, { status: 'full' });
    }

    // İstek sahibine bildirim gönder
    const requestUser = joinRequest.userId as any;
    await Notification.create({
      userId: requestUser._id,
      type: 'join_request_accepted',
      title: 'Katılım İsteği Kabul Edildi',
      message: `"${gameSession.title}" oyununa katılım isteğiniz kabul edildi.`,
      data: {
        gameSessionId: gameSession._id.toString(),
        requestId: String(joinRequest._id),
      },
      read: false,
    });

    console.log('[acceptJoinRequest] İstek kabul edildi:', joinRequest._id);

    res.status(200).json({
      success: true,
      message: 'Katılma isteği kabul edildi.',
      data: joinRequest,
    });
  } catch (error: any) {
    console.error('[acceptJoinRequest] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstek kabul edilirken bir hata oluştu.',
    });
  }
};

// POST /api/games/requests/:id/reject - Katılma isteğini reddet
export const rejectJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id: requestId } = req.params;
    const userId = (req as any).user._id;

    console.log('[rejectJoinRequest] İstek reddediliyor:', { requestId, userId });

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz istek ID.',
      });
    }

    // İsteği bul
    const joinRequest = await JoinRequest.findById(requestId)
      .populate('userId', 'firstName lastName')
      .populate('gameSessionId');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Katılma isteği bulunamadı.',
      });
    }

    const gameSession = joinRequest.gameSessionId as any;

    // Sadece lobi kurucusu reddedebilir
    if (gameSession.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok.',
      });
    }

    // İstek zaten işlenmiş mi?
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu istek zaten işlenmiş.',
      });
    }

    // İsteği reddet
    joinRequest.status = 'rejected';
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    // İstek sahibine bildirim gönder
    const requestUser = joinRequest.userId as any;
    await Notification.create({
      userId: requestUser._id,
      type: 'join_request_rejected',
      title: 'Katılım İsteği Reddedildi',
      message: `"${gameSession.title}" oyununa katılım isteğiniz reddedildi.`,
      data: {
        gameSessionId: gameSession._id.toString(),
        requestId: String(joinRequest._id),
      },
      read: false,
    });

    console.log('[rejectJoinRequest] İstek reddedildi:', joinRequest._id);

    res.status(200).json({
      success: true,
      message: 'Katılma isteği reddedildi.',
      data: joinRequest,
    });
  } catch (error: any) {
    console.error('[rejectJoinRequest] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstek reddedilirken bir hata oluştu.',
    });
  }
};

// GET /api/games/sessions/:id/requests - Oyunun katılma isteklerini getir
export const getGameRequests = async (req: Request, res: Response) => {
  try {
    const { id: gameSessionId } = req.params;
    const userId = (req as any).user._id;

    console.log('[getGameRequests] İstekler getiriliyor:', { gameSessionId, userId });

    if (!mongoose.Types.ObjectId.isValid(gameSessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oyun ID.',
      });
    }

    // Oyun kontrolü ve yetki kontrolü
    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı.',
      });
    }

    // Sadece lobi kurucusu istekleri görebilir
    if (gameSession.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu istekleri görme yetkiniz yok.',
      });
    }

    // Pending istekleri getir
    const requests = await JoinRequest.find({
      gameSessionId,
      status: 'pending',
    })
      .populate('userId', 'firstName lastName profilePhoto bio university gender birthDate')
      .sort({ createdAt: -1 });

    console.log(`[getGameRequests] ${requests.length} istek bulundu`);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('[getGameRequests] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstekler getirilirken bir hata oluştu.',
    });
  }
};
