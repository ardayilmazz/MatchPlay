import { Request, Response } from 'express';
import Waitlist from '../models/Waitlist';
import GameSession from '../models/GameSession';
import Notification from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Bekleme listesine ekle
 * POST /api/waitlist
 */
export const addToWaitlist = async (req: Request, res: Response) => {
  try {
    const { gameSessionId } = req.body;
    const userId = (req as any).user._id;

    console.log('[addToWaitlist] Bekleme listesine ekleniyor:', { gameSessionId, userId });

    // Oyunu kontrol et
    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({ success: false, message: 'Oyun bulunamadı' });
    }

    // Oyun dolu mu kontrol et
    if (gameSession.status !== 'full') {
      return res.status(400).json({
        success: false,
        message: 'Bu oyun dolu değil. Katılma isteği gönderebilirsiniz.',
      });
    }

    // Kullanıcı zaten bekleme listesinde mi?
    const existingEntry = await Waitlist.findOne({
      gameSessionId,
      userId,
      status: 'waiting',
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bu oyunun bekleme listesindesiniz.',
      });
    }

    // Kullanıcı oyun kurucusu mu?
    if (gameSession.creatorId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Oyun kurucusu bekleme listesine eklenemez.',
      });
    }

    // Kullanıcı zaten oyunda mı?
    const isParticipant = gameSession.acceptedPlayers?.some(
      (playerId: any) => playerId.toString() === userId.toString()
    );
    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bu oyunda yer alıyorsunuz.',
      });
    }

    // Bekleme listesindeki son pozisyonu bul
    const lastEntry = await Waitlist.findOne({
      gameSessionId,
      status: 'waiting',
    })
      .sort({ position: -1 })
      .limit(1);

    const newPosition = lastEntry ? lastEntry.position + 1 : 1;

    // Bekleme listesine ekle
    const waitlistEntry = await Waitlist.create({
      gameSessionId,
      userId,
      position: newPosition,
      status: 'waiting',
    });

    console.log('[addToWaitlist] Bekleme listesine eklendi:', waitlistEntry._id);

    // Oyun kurucusuna bildirim gönder
    const user = await User.findById(userId);
    if (user && gameSession.creatorId) {
      await Notification.create({
        userId: gameSession.creatorId,
        type: 'waitlist_joined',
        title: 'Bekleme Listesine Katılım',
        message: `"${gameSession.title}" için ${user.firstName} ${user.lastName} bekleme listesine katıldı.`,
        data: {
          gameSessionId: gameSessionId,
          waitlistId: String(waitlistEntry._id),
          userId: String(userId),
        },
        read: false,
      });
      console.log('[addToWaitlist] Oyun kurucusuna bildirim gönderildi');
    }

    res.status(201).json({
      success: true,
      message: 'Bekleme listesine eklendiniz',
      data: waitlistEntry,
    });
  } catch (error: any) {
    console.error('[addToWaitlist] Hata:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bu oyunun bekleme listesindesiniz.',
      });
    }
    res.status(500).json({ success: false, message: 'Bekleme listesine eklenirken bir hata oluştu' });
  }
};

/**
 * Bekleme listesinden çıkar
 * DELETE /api/waitlist/:id
 */
export const removeFromWaitlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    console.log('[removeFromWaitlist] Bekleme listesinden çıkarılıyor:', { id, userId });

    const waitlistEntry = await Waitlist.findOne({
      _id: id,
      userId,
    });

    if (!waitlistEntry) {
      return res.status(404).json({ success: false, message: 'Bekleme listesi kaydı bulunamadı' });
    }

    await Waitlist.findByIdAndUpdate(id, { status: 'cancelled' });

    // Pozisyonları yeniden düzenle (sıradan çıkan kişinin pozisyonunu diğerlerine dağıt)
    const gameSessionId = waitlistEntry.gameSessionId;
    const removedPosition = waitlistEntry.position;

    await Waitlist.updateMany(
      {
        gameSessionId,
        status: 'waiting',
        position: { $gt: removedPosition },
      },
      {
        $inc: { position: -1 },
      }
    );

    console.log('[removeFromWaitlist] Bekleme listesinden çıkarıldı:', id);

    res.status(200).json({
      success: true,
      message: 'Bekleme listesinden çıkarıldınız',
    });
  } catch (error: any) {
    console.error('[removeFromWaitlist] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Bekleme listesinden çıkarılırken bir hata oluştu' });
  }
};

/**
 * Kullanıcının bekleme listesini getir
 * GET /api/waitlist/my
 */
export const getUserWaitlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    console.log('[getUserWaitlist] Kullanıcı bekleme listesi getiriliyor:', userId);

    const waitlistEntries = await Waitlist.find({
      userId,
      status: 'waiting',
    })
      .populate({
        path: 'gameSessionId',
        populate: [
          { path: 'gameTypeId', select: 'name' },
          { path: 'creatorId', select: 'firstName lastName profilePhoto' },
        ],
      })
      .sort({ createdAt: 1 });

    // Frontend formatına dönüştür
    const formattedEntries = waitlistEntries.map((entry: any) => {
      const game = entry.gameSessionId;
      return {
        id: entry._id.toString(),
        gameId: game?._id?.toString() || '',
        userId: entry.userId.toString(),
        position: entry.position,
        status: entry.status,
        createdAt: entry.createdAt,
        game: game ? {
          id: game._id.toString(),
          title: game.title || game.gameTypeId?.name || 'Oyun',
          sportName: game.gameTypeId?.name || 'Oyun',
          startTime: game.startDate,
          endTime: game.startDate,
          venueName: game.venueName || '',
          districtName: game.districtName || '',
          cityName: game.cityName || '',
          totalPlayers: game.totalPlayers || 0,
          currentPlayers: (game.acceptedPlayers?.length || 0) + 1,
          status: game.status,
        } : null,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedEntries,
    });
  } catch (error: any) {
    console.error('[getUserWaitlist] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Bekleme listesi getirilirken bir hata oluştu' });
  }
};

/**
 * Oyun için bekleme listesini getir (oyun kurucusu için)
 * GET /api/waitlist/game/:gameSessionId
 */
export const getGameWaitlist = async (req: Request, res: Response) => {
  try {
    const { gameSessionId } = req.params;
    const userId = (req as any).user._id;

    console.log('[getGameWaitlist] Oyun bekleme listesi getiriliyor:', { gameSessionId, userId });

    // Oyunu kontrol et
    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({ success: false, message: 'Oyun bulunamadı' });
    }

    // Kullanıcı oyun kurucusu mu?
    if (gameSession.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Bu işlemi sadece oyun kurucusu yapabilir' });
    }

    const waitlistEntries = await Waitlist.find({
      gameSessionId,
      status: 'waiting',
    })
      .populate('userId', 'firstName lastName profilePhoto')
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: waitlistEntries,
    });
  } catch (error: any) {
    console.error('[getGameWaitlist] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Bekleme listesi getirilirken bir hata oluştu' });
  }
};

/**
 * Kullanıcının belirli bir oyun için bekleme listesi kaydını getir
 * GET /api/waitlist/game/:gameSessionId/my
 */
export const getWaitlistEntry = async (req: Request, res: Response) => {
  try {
    const { gameSessionId } = req.params;
    const userId = (req as any).user._id;

    console.log('[getWaitlistEntry] Bekleme listesi kaydı kontrol ediliyor:', { gameSessionId, userId });

    const waitlistEntry = await Waitlist.findOne({
      gameSessionId,
      userId,
      status: 'waiting',
    });

    if (!waitlistEntry) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(waitlistEntry._id),
        gameId: gameSessionId,
        userId: String(waitlistEntry.userId),
        position: waitlistEntry.position,
        status: waitlistEntry.status,
        createdAt: waitlistEntry.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[getWaitlistEntry] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Bekleme listesi kaydı getirilirken bir hata oluştu' });
  }
};
