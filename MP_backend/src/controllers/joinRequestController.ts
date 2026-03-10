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

    // Daha önce bekleyen istek var mı?
    const pendingRequest = await JoinRequest.findOne({
      gameSessionId,
      userId,
      status: 'pending',
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Bu oyuna zaten katılma isteği gönderdiniz.',
      });
    }

    // cancelled veya rejected istek varsa yeniden kullan (kullanıcı ayrıldıktan sonra tekrar katılmak isteyebilir)
    const closedRequest = await JoinRequest.findOne({
      gameSessionId,
      userId,
      status: { $in: ['cancelled', 'rejected'] },
    });

    let joinRequest: any = null;

    if (closedRequest) {
      // Mevcut kaydı güncelle (pending'e çevir)
      joinRequest = await JoinRequest.findByIdAndUpdate(
        closedRequest._id,
        { status: 'pending', message: message || '', respondedAt: null },
        { new: true }
      );
      console.log('[sendJoinRequest] Önceki istek yeniden aktif edildi:', joinRequest._id);
    } else {
      // Yeni katılma isteği oluştur
      joinRequest = await JoinRequest.create({
        gameSessionId,
        userId,
        message: message || '',
        status: 'pending',
      });
    }
    if (!joinRequest) {
      return res.status(500).json({
        success: false,
        message: 'Katılma isteği oluşturulamadı.',
      });
    }

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

    // Oyunda yer var mı? (acceptedPlayers + creator = totalPlayers)
    const acceptedPlayerCount = gameSession.acceptedPlayers?.length || 0;
    const sessionTotalPlayers = gameSession.totalPlayers || 0;
    const currentPlayers = acceptedPlayerCount + 1; // +1 = creator
    
    // Oyun dolmuş mu kontrol et
    if (currentPlayers >= sessionTotalPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Oyunda yer kalmadı.',
      });
    }

    // İsteği kabul et
    joinRequest.status = 'accepted';
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    // Oyuncuyu oyuna ekle (hem acceptedPlayers hem de currentPlayers - geriye dönük uyumluluk için)
    await GameSession.findByIdAndUpdate(gameSession._id, {
      $addToSet: { 
        acceptedPlayers: joinRequest.userId,
        currentPlayers: joinRequest.userId 
      },
    });

    // Oyun durumunu güncelle
    const updatedSession = await GameSession.findById(gameSession._id);
    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı.',
      });
    }

    const totalAcceptedPlayers = (updatedSession.acceptedPlayers?.length || 0);
    const totalPlayers = updatedSession.totalPlayers || 0;
    const currentNeededPlayers = Math.max(0, totalPlayers - (totalAcceptedPlayers + 1)); // +1 = creator
    
    // neededPlayers'ı güncelle ve oyun doldu mu kontrol et
    if (currentNeededPlayers === 0) {
      await GameSession.findByIdAndUpdate(gameSession._id, { 
        neededPlayers: 0,
        status: 'full' 
      });
      console.log('[acceptJoinRequest] Oyun doldu, status: full, neededPlayers: 0');
    } else {
      await GameSession.findByIdAndUpdate(gameSession._id, { 
        neededPlayers: currentNeededPlayers 
      });
      console.log('[acceptJoinRequest] neededPlayers güncellendi:', currentNeededPlayers);
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

// POST /api/games/sessions/:id/leave - Oyundan ayrıl (kabul edilmiş oyuncu)
export const leaveGame = async (req: Request, res: Response) => {
  try {
    const { id: gameSessionId } = req.params;
    const userId = (req as any).user._id;

    console.log('[leaveGame] Oyundan ayrılma:', { gameSessionId, userId });

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

    // Kullanıcı oyun kurucusu mu?
    if (gameSession.creatorId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Oyun kurucusu oyundan ayrılamaz. Oyunu iptal edebilirsiniz.',
      });
    }

    // Kullanıcı oyunda mı?
    const isInGame = gameSession.acceptedPlayers?.some((p) => p.toString() === userId.toString());
    if (!isInGame) {
      return res.status(400).json({
        success: false,
        message: 'Bu oyunda değilsiniz.',
      });
    }

    // Oyuncuyu oyundan çıkar
    await GameSession.findByIdAndUpdate(gameSessionId, {
      $pull: { 
        acceptedPlayers: userId,
        currentPlayers: userId 
      },
    });

    // Oyun durumunu güncelle
    const updatedSession = await GameSession.findById(gameSessionId);
    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı.',
      });
    }

    const totalAcceptedPlayers = (updatedSession.acceptedPlayers?.length || 0);
    const totalPlayers = updatedSession.totalPlayers || 0;
    const currentNeededPlayers = Math.max(0, totalPlayers - (totalAcceptedPlayers + 1)); // +1 = creator
    
    // Oyunun önceki durumunu kaydet (bekleme listesi bildirimi için)
    const wasFull = updatedSession.status === 'full';
    
    // neededPlayers'ı güncelle ve oyun durumunu kontrol et
    if (wasFull) {
      await GameSession.findByIdAndUpdate(gameSessionId, { 
        neededPlayers: currentNeededPlayers,
        status: 'open' 
      });
      console.log('[leaveGame] Oyun durumu full -> open, neededPlayers:', currentNeededPlayers);
    } else {
      await GameSession.findByIdAndUpdate(gameSessionId, { 
        neededPlayers: currentNeededPlayers 
      });
      console.log('[leaveGame] neededPlayers güncellendi:', currentNeededPlayers);
    }

    // Kabul edilmiş isteği iptal et
    await JoinRequest.findOneAndUpdate(
      { gameSessionId, userId, status: 'accepted' },
      { status: 'cancelled' }
    );

    // Lobi sahibine bildirim gönder
    const user = await User.findById(userId).select('firstName lastName');
    await Notification.create({
      userId: gameSession.creatorId,
      type: 'player_left',
      title: 'Oyuncu Ayrıldı',
      message: `${user?.firstName} ${user?.lastName} oyununuzdan ayrıldı.`,
      data: {
        gameSessionId: gameSessionId,
        userId: userId.toString(),
      },
      read: false,
    });

    // Eğer oyun dolu durumundan açık durumuna geçtiyse, bekleme listesindeki kullanıcılara bildirim gönder
    if (wasFull) {
      const Waitlist = require('../models/Waitlist').default;
      const waitlistEntries = await Waitlist.find({
        gameSessionId,
        status: 'waiting',
      }).populate('userId', '_id');

      console.log(`[leaveGame] Bekleme listesinde ${waitlistEntries.length} kullanıcı bulundu`);

      // Bekleme listesindeki kullanıcılara bildirim gönder
      if (waitlistEntries.length > 0) {
        const notificationPromises = waitlistEntries.map((entry: any) => {
          return Notification.create({
            userId: entry.userId._id,
            type: 'waitlist_slot_available',
            title: 'Kontenjan Açıldı',
            message: `"${gameSession.title}" oyununda kontenjan açıldı. Hemen katılma isteği gönderebilirsiniz!`,
            data: {
              gameSessionId: String(gameSessionId),
              waitlistId: String(entry._id),
            },
            read: false,
          });
        });

        await Promise.all(notificationPromises);
        console.log(`[leaveGame] ${waitlistEntries.length} bekleme listesi kullanıcısına bildirim gönderildi`);
      }
    }

    console.log('[leaveGame] Oyuncu oyundan ayrıldı:', userId);

    res.status(200).json({
      success: true,
      message: 'Oyundan ayrıldınız.',
    });
  } catch (error: any) {
    console.error('[leaveGame] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyundan ayrılırken bir hata oluştu.',
    });
  }
};

// GET /api/games/sessions/:id/my-request - Kullanıcının oyun için isteğini getir
export const getMyRequestForGame = async (req: Request, res: Response) => {
  try {
    const { id: gameSessionId } = req.params;
    const userId = (req as any).user._id;

    console.log('[getMyRequestForGame] İstek sorgulanıyor:', { gameSessionId, userId });

    if (!mongoose.Types.ObjectId.isValid(gameSessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oyun ID.',
      });
    }

    const joinRequest = await JoinRequest.findOne({
      gameSessionId,
      userId,
    }).sort({ createdAt: -1 }); // En son isteği al

    res.status(200).json({
      success: true,
      data: joinRequest,
    });
  } catch (error: any) {
    console.error('[getMyRequestForGame] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstek sorgulanırken bir hata oluştu.',
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

// POST /api/games/requests/:id/cancel - Katılma isteğini iptal et (istek sahibi)
export const cancelJoinRequest = async (req: Request, res: Response) => {
  try {
    const { id: requestId } = req.params;
    const userId = (req as any).user._id;

    console.log('[cancelJoinRequest] İstek iptal ediliyor:', { requestId, userId });

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz istek ID.',
      });
    }

    const joinRequest = await JoinRequest.findById(requestId)
      .populate('gameSessionId');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Katılma isteği bulunamadı.',
      });
    }

    // Sadece istek sahibi iptal edebilir
    if (joinRequest.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu isteği iptal etme yetkiniz yok.',
      });
    }

    // Sadece pending istekler iptal edilebilir
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu istek artık iptal edilemez.',
      });
    }

    // İsteği iptal et
    joinRequest.status = 'cancelled';
    await joinRequest.save();

    const gameSession = joinRequest.gameSessionId as any;
    const user = await User.findById(userId).select('firstName lastName');

    // Lobi sahibine bildirim gönder
    await Notification.create({
      userId: gameSession.creatorId,
      type: 'join_request_cancelled',
      title: 'Katılım İsteği İptal Edildi',
      message: `${user?.firstName} ${user?.lastName} katılım isteğini iptal etti.`,
      data: {
        gameSessionId: gameSession._id.toString(),
        requestId: String(joinRequest._id),
      },
      read: false,
    });

    console.log('[cancelJoinRequest] İstek iptal edildi:', joinRequest._id);

    res.status(200).json({
      success: true,
      message: 'Katılma isteği iptal edildi.',
    });
  } catch (error: any) {
    console.error('[cancelJoinRequest] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstek iptal edilirken bir hata oluştu.',
    });
  }
};

// GET /api/games/requests/my - Kullanıcının gönderdiği tüm katılma isteklerini getir
export const getUserRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    console.log('[getUserRequests] Kullanıcı istekleri getiriliyor:', { userId });

    // Önce bekleyen isteklerin oyun durumlarını kontrol et ve gerekirse iptal et
    const pendingRequests = await JoinRequest.find({ 
      userId, 
      status: 'pending' 
    }).populate('gameSessionId');

    const now = new Date();
    for (const request of pendingRequests) {
      const game = request.gameSessionId as any;
      if (!game) continue;

      // Oyun durumu kontrolü (in_progress veya completed ise iptal et)
      if (game.gameStatus === 'in_progress' || game.gameStatus === 'completed') {
        await JoinRequest.findByIdAndUpdate(request._id, {
          status: 'cancelled',
          respondedAt: now,
        });
        console.log(`[getUserRequests] Bekleyen istek otomatik iptal edildi: ${request._id} - Oyun durumu: ${game.gameStatus}`);
        continue;
      }

      // Oyun durumu güncellenmemişse, başlangıç zamanına göre kontrol et
      if (game.startDate && game.estimatedDuration) {
        const gameStartTime = new Date(game.startDate);
        
        // Oyun başlamışsa isteği iptal et
        if (now >= gameStartTime) {
          await JoinRequest.findByIdAndUpdate(request._id, {
            status: 'cancelled',
            respondedAt: now,
          });
          console.log(`[getUserRequests] Bekleyen istek otomatik iptal edildi: ${request._id} - Oyun başladı`);
        }
      }
    }

    const joinRequests = await JoinRequest.find({ userId })
      .populate({
        path: 'gameSessionId',
        populate: [
          { path: 'gameTypeId', select: 'name' },
          { path: 'creatorId', select: 'firstName lastName profilePhoto' },
        ],
      })
      .sort({ createdAt: -1 });

    // İstekleri frontend formatına dönüştür
    const formattedRequests = joinRequests.map((request: any) => {
      const game = request.gameSessionId;
      return {
        id: request._id.toString(),
        gameId: game?._id?.toString() || '',
        userId: request.userId.toString(),
        message: request.message || '',
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        game: game ? {
          id: game._id.toString(),
          sportName: game.gameTypeId?.name || 'Oyun',
          title: game.title || '',
          startTime: game.startDate,
          venueName: game.venueName || '',
          districtName: game.districtName || '',
          cityName: game.cityName || '',
        } : null,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRequests,
    });
  } catch (error: any) {
    console.error('[getUserRequests] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstekler getirilirken bir hata oluştu.',
    });
  }
};
