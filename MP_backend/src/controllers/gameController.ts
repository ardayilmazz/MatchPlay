import { Request, Response } from 'express';
import GameType from '../models/GameType';
import GameSession from '../models/GameSession';
import mongoose from 'mongoose';

// GET /api/games/types - Tüm oyun tiplerini getir
export const getGameTypes = async (req: Request, res: Response) => {
  try {
    console.log('[getGameTypes] Oyun tipleri isteniyor...');

    const gameTypes = await GameType.find({ isActive: true }).sort({
      category: 1,
      name: 1,
    });

    console.log(`[getGameTypes] ${gameTypes.length} oyun tipi bulundu`);

    res.status(200).json({
      success: true,
      data: gameTypes,
    });
  } catch (error: any) {
    console.error('[getGameTypes] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyun tipleri getirilirken bir hata oluştu.',
    });
  }
};

// POST /api/games/sessions - Yeni oyun oturumu oluştur veya güncelle (draft)
export const createOrUpdateGameSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const {
      sessionId, // Eğer varsa mevcut draft'ı güncelle
      gameTypeId,
      title,
      description,
      tags,
      cityId,
      cityName,
      districtId,
      districtName,
      venueId,
      venueName,
      venueAddress,
      paymentType,
      startDate,
      estimatedDuration,
      totalPlayers,
      neededPlayers,
      teamAssignment,
      skillLevel,
      hasEquipment,
      genderPreference,
      status,
    } = req.body;

    console.log('[createOrUpdateGameSession] İstek geldi:', {
      userId,
      sessionId,
      gameTypeId,
      status,
    });

    // GameType kontrolü
    if (gameTypeId) {
      console.log('[createOrUpdateGameSession] gameTypeId kontrolü:', gameTypeId);
      const gameType = await GameType.findById(gameTypeId);
      if (!gameType) {
        console.error('[createOrUpdateGameSession] Geçersiz gameTypeId:', gameTypeId);
        return res.status(404).json({
          success: false,
          message: `Geçersiz oyun tipi: ${gameTypeId}`,
        });
      }
      console.log('[createOrUpdateGameSession] GameType bulundu:', gameType.name);
    }

    let gameSession;

    if (sessionId) {
      // Mevcut draft'ı güncelle
      gameSession = await GameSession.findOneAndUpdate(
        {
          _id: sessionId,
          creatorId: userId,
          status: 'draft', // Sadece draft olanlar güncellenebilir
        },
        {
          gameTypeId,
          title,
          description,
          tags,
          cityId,
          cityName,
          districtId,
          districtName,
          venueId,
          venueName,
          venueAddress,
          paymentType,
          startDate,
          estimatedDuration,
          totalPlayers,
          neededPlayers,
          teamAssignment,
          skillLevel,
          hasEquipment,
          genderPreference,
          status,
        },
        { new: true, runValidators: true }
      ).populate('gameTypeId');

      if (!gameSession) {
        return res.status(404).json({
          success: false,
          message: 'Taslak oyun bulunamadı veya güncellenemez.',
        });
      }

      console.log('[createOrUpdateGameSession] Oyun güncellendi:', gameSession._id);
    } else {
      // Yeni draft oluştur
      gameSession = await GameSession.create({
        creatorId: userId,
        gameTypeId,
        title: title || 'Yeni Oyun',
        description,
        tags,
        cityId,
        cityName,
        districtId,
        districtName,
        venueId,
        venueName,
        venueAddress,
        paymentType,
        startDate,
        estimatedDuration,
        totalPlayers,
        neededPlayers,
        teamAssignment,
        skillLevel,
        hasEquipment,
        genderPreference,
        status: status || 'draft',
        currentPlayers: [userId], // Oluşturan kullanıcı otomatik katılır
        pendingRequests: [],
      });

      gameSession = await gameSession.populate('gameTypeId');

      console.log('[createOrUpdateGameSession] Yeni oyun oluşturuldu:', gameSession._id);
    }

    res.status(sessionId ? 200 : 201).json({
      success: true,
      data: gameSession,
    });
  } catch (error: any) {
    console.error('[createOrUpdateGameSession] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyun oluşturulurken bir hata oluştu.',
    });
  }
};

// GET /api/games/sessions/my-draft - Kullanıcının draft oyununu getir
export const getMyDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    console.log('[getMyDraft] Kullanıcının draft oyunu isteniyor:', userId);

    const draft = await GameSession.findOne({
      creatorId: userId,
      status: 'draft',
    }).populate('gameTypeId');

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Taslak oyun bulunamadı.',
      });
    }

    console.log('[getMyDraft] Draft bulundu:', draft._id);

    res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error: any) {
    console.error('[getMyDraft] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Taslak oyun getirilirken bir hata oluştu.',
    });
  }
};

// GET /api/games/sessions/my - Kullanıcının kendi oyunlarını listele
export const getMyGameSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    console.log('[getMyGameSessions] Kullanıcının oyunları isteniyor:', userId);

    const gameSessions = await GameSession.find({
      creatorId: userId,
      status: { $in: ['draft', 'open', 'full'] },
    })
      .populate('gameTypeId')
      .sort({ createdAt: -1 });

    console.log(`[getMyGameSessions] ${gameSessions.length} oyun bulundu`);

    res.status(200).json({
      success: true,
      data: gameSessions,
    });
  } catch (error: any) {
    console.error('[getMyGameSessions] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyunlar getirilirken bir hata oluştu.',
    });
  }
};

// GET /api/games/sessions - Tüm açık oyunları listele
export const getGameSessions = async (req: Request, res: Response) => {
  try {
    console.log('[getGameSessions] Oyun oturumları isteniyor...');

    const { city, district, gameType, skillLevel, status } = req.query;

    const filter: any = {};

    // Sadece open ve full durumundaki oyunları göster (draft hariç)
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['open', 'full'] };
    }

    if (city) filter.cityId = city;
    if (district) filter.districtId = district;
    if (gameType) filter.gameTypeId = gameType;
    if (skillLevel) filter.skillLevel = skillLevel;

    const gameSessions = await GameSession.find(filter)
      .populate('gameTypeId')
      .populate('creatorId', 'firstName lastName profilePhoto')
      .sort({ startDate: 1 });

    console.log(`[getGameSessions] ${gameSessions.length} oyun oturumu bulundu`);

    res.status(200).json({
      success: true,
      data: gameSessions,
    });
  } catch (error: any) {
    console.error('[getGameSessions] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyun oturumları getirilirken bir hata oluştu.',
    });
  }
};

// GET /api/games/sessions/:id - Tek bir oyun oturumunu getir
export const getGameSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('[getGameSession] Oyun oturumu isteniyor:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oyun ID.',
      });
    }

    const gameSession = await GameSession.findById(id)
      .populate('gameTypeId')
      .populate('creatorId', 'firstName lastName profilePhoto bio')
      .populate('currentPlayers', 'firstName lastName profilePhoto');

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun oturumu bulunamadı.',
      });
    }

    console.log('[getGameSession] Oyun oturumu bulundu:', gameSession._id);

    res.status(200).json({
      success: true,
      data: gameSession,
    });
  } catch (error: any) {
    console.error('[getGameSession] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyun oturumu getirilirken bir hata oluştu.',
    });
  }
};

// PUT /api/games/sessions/:id - Oyun oturumunu güncelle
export const updateGameSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const updateData = req.body;

    console.log('[updateGameSession] Oyun güncelleme isteği:', { id, userId });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oyun ID.',
      });
    }

    // Güncellenemeyen alanları kaldır
    delete updateData._id;
    delete updateData.creatorId;
    delete updateData.createdAt;
    delete updateData.__v;

    const gameSession = await GameSession.findOneAndUpdate(
      {
        _id: id,
        creatorId: userId, // Sadece oluşturan kullanıcı güncelleyebilir
      },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('gameTypeId');

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı veya güncelleme yetkiniz yok.',
      });
    }

    console.log('[updateGameSession] Oyun güncellendi:', gameSession._id);

    res.status(200).json({
      success: true,
      message: 'Oyun başarıyla güncellendi.',
      data: gameSession,
    });
  } catch (error: any) {
    console.error('[updateGameSession] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyun güncellenirken bir hata oluştu.',
    });
  }
};

// DELETE /api/games/sessions/:id - Oyun oturumunu sil
export const deleteGameSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    console.log('[deleteGameSession] Oyun silme isteği:', { id, userId });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz oyun ID.',
      });
    }

    const gameSession = await GameSession.findOneAndDelete({
      _id: id,
      creatorId: userId, // Sadece oluşturan kullanıcı silebilir
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı veya silme yetkiniz yok.',
      });
    }

    console.log('[deleteGameSession] Oyun silindi:', gameSession._id);

    res.status(200).json({
      success: true,
      message: 'Oyun başarıyla silindi.',
    });
  } catch (error: any) {
    console.error('[deleteGameSession] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Oyun silinirken bir hata oluştu.',
    });
  }
};

// GET /api/games/statistics - Ana sayfa istatistikleri
export const getStatistics = async (req: Request, res: Response) => {
  try {
    console.log('[getStatistics] İstatistikler isteniyor...');

    const totalGames = await GameSession.countDocuments({ status: { $in: ['open', 'full'] } });
    const totalActivePlayers = await GameSession.aggregate([
      { $match: { status: { $in: ['open', 'full'] } } },
      { $unwind: '$currentPlayers' },
      { $group: { _id: '$currentPlayers' } },
      { $count: 'total' },
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayGames = await GameSession.countDocuments({
      status: { $in: ['open', 'full'] },
      startDate: { $gte: todayStart, $lte: todayEnd },
    });

    res.status(200).json({
      success: true,
      data: {
        totalGames,
        activePlayers: totalActivePlayers[0]?.total || 0,
        todayGames,
        upcomingGames: totalGames,
      },
    });
  } catch (error: any) {
    console.error('[getStatistics] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken bir hata oluştu.',
    });
  }
};

