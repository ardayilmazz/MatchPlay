import { Request, Response } from 'express';
import Rating from '../models/Rating';
import GameSession from '../models/GameSession';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Oyun sonrası oylama yap
 * POST /api/ratings
 */
export const createRating = async (req: Request, res: Response) => {
  try {
    const { gameSessionId, ratedId, rating, comment } = req.body;
    const raterId = (req as any).user._id;

    console.log('[createRating] Oylama yapılıyor:', { gameSessionId, raterId, ratedId, rating });

    // Oyunu kontrol et
    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({ success: false, message: 'Oyun bulunamadı' });
    }

    // Oyun bitmiş mi kontrol et
    if (!gameSession.startDate || !gameSession.estimatedDuration) {
      return res.status(400).json({ success: false, message: 'Oyun zamanı bilgisi eksik' });
    }

    const endTime = new Date(
      gameSession.startDate.getTime() + gameSession.estimatedDuration * 60000
    );
    const now = new Date();

    if (endTime > now) {
      return res.status(400).json({
        success: false,
        message: 'Oyun henüz bitmedi. Oyun bittikten sonra oylama yapabilirsiniz.',
      });
    }

    // Kullanıcı bu oyunda mı kontrol et
    const isParticipant =
      gameSession.creatorId.toString() === raterId.toString() ||
      gameSession.acceptedPlayers?.some((p: any) => p.toString() === raterId.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Bu oyuna katılmadınız. Sadece katıldığınız oyunlar için oylama yapabilirsiniz.',
      });
    }

    // Oy verilen kullanıcı bu oyunda mı kontrol et
    const isRatedParticipant =
      gameSession.creatorId.toString() === ratedId.toString() ||
      gameSession.acceptedPlayers?.some((p: any) => p.toString() === ratedId.toString());

    if (!isRatedParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Oy verdiğiniz kullanıcı bu oyunda yer almıyor.',
      });
    }

    // Kendine oy veremez
    if (raterId.toString() === ratedId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinize oy veremezsiniz.',
      });
    }

    // Rating değeri kontrolü
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating değeri 1-5 arasında olmalıdır.',
      });
    }

    // Daha önce oy verilmiş mi kontrol et
    const existingRating = await Rating.findOne({
      gameSessionId,
      raterId,
      ratedId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcıya zaten oy verdiniz.',
      });
    }

    // Rating oluştur
    const newRating = await Rating.create({
      gameSessionId,
      raterId,
      ratedId,
      rating,
      comment: comment || undefined,
    });

    console.log('[createRating] Oylama oluşturuldu:', newRating._id);

    res.status(201).json({
      success: true,
      message: 'Oylama başarıyla gönderildi',
      data: newRating,
    });
  } catch (error: any) {
    console.error('[createRating] Hata:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcıya zaten oy verdiniz.',
      });
    }
    res.status(500).json({ success: false, message: 'Oylama yapılırken bir hata oluştu' });
  }
};

/**
 * Kullanıcının aldığı yorumları getir
 * GET /api/ratings/user/:userId
 */
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    console.log('[getUserRatings] Kullanıcı yorumları getiriliyor:', userId);

    const ratings = await Rating.find({ ratedId: userId })
      .populate('raterId', 'firstName lastName profilePhoto')
      .populate('gameSessionId', 'title gameTypeId')
      .populate('gameSessionId.gameTypeId', 'name')
      .sort({ createdAt: -1 });

    const formattedRatings = ratings.map((rating: any) => ({
      id: rating._id.toString(),
      rater: {
        id: rating.raterId._id.toString(),
        firstName: rating.raterId.firstName,
        lastName: rating.raterId.lastName,
        profilePhoto: rating.raterId.profilePhoto,
      },
      game: {
        id: rating.gameSessionId._id.toString(),
        title: rating.gameSessionId.title,
        sportName: rating.gameSessionId.gameTypeId?.name || 'Oyun',
      },
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedRatings,
    });
  } catch (error: any) {
    console.error('[getUserRatings] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Yorumlar getirilirken bir hata oluştu' });
  }
};

/**
 * Kullanıcının oy verebileceği oyunları getir (oyun bitmiş ve henüz oy verilmemiş)
 * GET /api/ratings/pending
 */
export const getPendingRatings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    console.log('[getPendingRatings] Bekleyen oylamalar getiriliyor:', userId);

    const now = new Date();

    // Kullanıcının katıldığı ve bitmiş oyunları bul
    // gameStatus kontrolü yapmıyoruz çünkü updateGameStatuses henüz çalışmamış olabilir
    // Sadece bitiş zamanı kontrolü yapıyoruz
    const completedGames = await GameSession.find({
      $or: [{ creatorId: userId }, { acceptedPlayers: userId }],
      status: { $ne: 'cancelled' }, // İptal edilmiş oyunlar hariç
      startDate: { $exists: true, $ne: null },
      estimatedDuration: { $exists: true, $ne: null },
      $expr: {
        $lte: [
          { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
          now,
        ],
      },
    });

    console.log(`[getPendingRatings] ${completedGames.length} bitmiş oyun bulundu`);

    const gameIds = completedGames.map((g) => g._id);

    // Bu oyunlarda kullanıcının oy verdiği kişileri bul
    const ratedUsers = await Rating.find({
      gameSessionId: { $in: gameIds },
      raterId: userId,
    }).distinct('ratedId');

    // Her oyun için oy verilebilecek kullanıcıları bul
    const pendingRatings: any[] = [];

    for (const game of completedGames) {
      const allParticipants = [
        game.creatorId,
        ...(game.acceptedPlayers || []),
      ].map((id: any) => id.toString());

      // Kendisi hariç, henüz oy verilmemiş kullanıcıları bul
      const usersToRate = allParticipants.filter(
        (participantId) =>
          participantId !== userId.toString() &&
          !ratedUsers.some((ratedId: any) => ratedId.toString() === participantId)
      );

      console.log(`[getPendingRatings] Oyun ${game.title}: ${usersToRate.length} kullanıcıya oy verilebilir`);

      if (usersToRate.length > 0) {
        // Kullanıcı bilgilerini getir
        const users = await User.find({
          _id: { $in: usersToRate },
        }).select('firstName lastName profilePhoto');

        pendingRatings.push({
          gameId: String(game._id),
          gameTitle: game.title,
          endTime: new Date(
            game.startDate!.getTime() + game.estimatedDuration! * 60000
          ).toISOString(),
          usersToRate: users.map((u: any) => ({
            id: String(u._id),
            firstName: u.firstName,
            lastName: u.lastName,
            profilePhoto: u.profilePhoto,
          })),
        });
      }
    }

    console.log(`[getPendingRatings] Toplam ${pendingRatings.length} bekleyen oylama bulundu`);

    res.status(200).json({
      success: true,
      data: pendingRatings,
    });
  } catch (error: any) {
    console.error('[getPendingRatings] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Bekleyen oylamalar getirilirken bir hata oluştu' });
  }
};
