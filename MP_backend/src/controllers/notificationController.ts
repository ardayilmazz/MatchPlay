import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { calculateAge } from '../utils/userHelpers';

// GET /api/notifications - Kullanıcının bildirimlerini getir
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { unreadOnly } = req.query;

    console.log('[getNotifications] Bildirimler getiriliyor:', { userId, unreadOnly });

    const filter: any = { userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`[getNotifications] ${notifications.length} bildirim bulundu`);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error('[getNotifications] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu.',
    });
  }
};

// PUT /api/notifications/:id/read - Bildirimi okundu olarak işaretle
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('[markAsRead] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Bildirim güncellenirken bir hata oluştu.',
    });
  }
};

// GET /api/games/requests/:id/user - Katılma isteği sahibinin detaylı bilgilerini getir
export const getRequestUserDetails = async (req: Request, res: Response) => {
  try {
    const { id: requestId } = req.params;
    const userId = (req as any).user._id;

    console.log('[getRequestUserDetails] İstek sahibi bilgileri:', { requestId, userId });

    const JoinRequest = (await import('../models/JoinRequest')).default;
    const GameSession = (await import('../models/GameSession')).default;
    
    const joinRequest = await JoinRequest.findById(requestId)
      .populate({
        path: 'userId',
        select: 'firstName lastName profilePhoto bio university gender birthDate',
      })
      .populate('gameSessionId');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Katılma isteği bulunamadı.',
      });
    }

    const gameSession = joinRequest.gameSessionId as any;

    // Sadece lobi kurucusu görebilir
    if (gameSession.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu bilgileri görme yetkiniz yok.',
      });
    }

    const requestUser = joinRequest.userId as any;

    // Yaş hesapla
    const age = requestUser.birthDate ? calculateAge(requestUser.birthDate) : null;

    res.status(200).json({
      success: true,
      data: {
        requestId: joinRequest._id,
        user: {
          firstName: requestUser.firstName,
          lastName: requestUser.lastName,
          profilePhoto: requestUser.profilePhoto,
          bio: requestUser.bio,
          university: requestUser.university,
          gender: requestUser.gender,
          age: age,
        },
        message: joinRequest.message,
        createdAt: joinRequest.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[getRequestUserDetails] Hata:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri getirilirken bir hata oluştu.',
    });
  }
};
