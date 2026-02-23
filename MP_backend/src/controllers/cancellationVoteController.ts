import { Request, Response } from 'express';
import CancellationVote from '../models/CancellationVote';
import GameSession from '../models/GameSession';
import Notification from '../models/Notification';
import User from '../models/User';

/**
 * Oyun iptali için oylama başlat
 * POST /api/cancellation-votes/initiate
 */
export const initiateCancellationVote = async (req: Request, res: Response) => {
  try {
    const { gameSessionId } = req.body;
    const userId = (req as any).user._id;

    console.log('[initiateCancellationVote] Oylama başlatılıyor:', { gameSessionId, userId });

    // Oyunu kontrol et
    const gameSession = await GameSession.findById(gameSessionId);
    if (!gameSession) {
      return res.status(404).json({ success: false, message: 'Oyun bulunamadı' });
    }

    // Kullanıcının oyun kurucusu olduğunu kontrol et
    if (gameSession.creatorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Bu işlemi sadece oyun kurucusu yapabilir' });
    }

    // Oyuna 3 saatten az kaldığını kontrol et
    const now = new Date();
    if (!gameSession.startDate) {
      return res.status(400).json({ success: false, message: 'Oyun başlangıç tarihi bulunamadı' });
    }
    const startDate = new Date(gameSession.startDate);
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Oyuna 3 saatten fazla kaldığı için oylama başlatmaya gerek yok. Oyunu doğrudan iptal edebilirsiniz.',
      });
    }

    // Katılımcı olup olmadığını kontrol et
    if (!gameSession.acceptedPlayers || gameSession.acceptedPlayers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Oyuna katılımcı olmadığı için oylama başlatmaya gerek yok. Oyunu doğrudan iptal edebilirsiniz.',
      });
    }

    // Daha önce oylama başlatılmış mı kontrol et
    const existingVote = await CancellationVote.findOne({ gameSessionId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'Bu oyun için zaten bir iptal oylaması başlatılmış',
        data: existingVote,
      });
    }

    // Yeni oylama oluştur
    const cancellationVote = await CancellationVote.create({
      gameSessionId,
      initiatorId: userId,
      votes: [],
      status: 'pending',
    });

    console.log('[initiateCancellationVote] Oylama oluşturuldu:', cancellationVote._id);

    // Tüm katılımcılara bildirim gönder
    const participants = gameSession.acceptedPlayers;
    const gameData = await GameSession.findById(gameSessionId)
      .populate('gameTypeId')
      .populate('creatorId', 'firstName lastName');

    const notificationPromises = participants.map((participantId: any) =>
      Notification.create({
        userId: participantId,
        type: 'cancellation_vote_request',
        title: 'Oyun İptal Oylaması',
        message: `Katıldığınız "${gameData?.title || 'oyun'}" için iptal oylaması başlatıldı. Oyunun iptal edilmesini kabul ediyor musunuz?`,
        data: {
          gameSessionId: gameSessionId,
          voteId: String(cancellationVote._id),
        },
        read: false,
      })
    );

    await Promise.all(notificationPromises);
    console.log(`[initiateCancellationVote] ${participants.length} katılımcıya bildirim gönderildi`);

    res.status(201).json({
      success: true,
      message: 'İptal oylaması başlatıldı',
      data: cancellationVote,
    });
  } catch (error: any) {
    console.error('[initiateCancellationVote] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Oylama başlatılırken bir hata oluştu' });
  }
};

/**
 * Oyun iptali için oy kullan
 * POST /api/cancellation-votes/:voteId/vote
 */
export const submitVote = async (req: Request, res: Response) => {
  try {
    const { voteId } = req.params;
    const { vote } = req.body; // 'approve' veya 'reject'
    const userId = (req as any).user._id;

    console.log('[submitVote] Oy kullanılıyor:', { voteId, userId, vote });

    if (!['approve', 'reject'].includes(vote)) {
      return res.status(400).json({ success: false, message: 'Geçersiz oy değeri' });
    }

    // Oylama kaydını bul
    const cancellationVote = await CancellationVote.findById(voteId);
    if (!cancellationVote) {
      return res.status(404).json({ success: false, message: 'Oylama bulunamadı' });
    }

    // Oylamayı kontrol et
    if (cancellationVote.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Bu oylama tamamlanmış' });
    }

    // Oyunu kontrol et
    const gameSession = await GameSession.findById(cancellationVote.gameSessionId);
    if (!gameSession) {
      return res.status(404).json({ success: false, message: 'Oyun bulunamadı' });
    }

    // Kullanıcının katılımcı olduğunu kontrol et
    const isParticipant = gameSession.acceptedPlayers?.some(
      (playerId: any) => playerId.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Bu oylamaya katılma yetkiniz yok' });
    }

    // Kullanıcının daha önce oy kullanıp kullanmadığını kontrol et
    const existingVote = cancellationVote.votes.find(
      (v: any) => v.userId.toString() === userId.toString()
    );
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'Bu oylamada zaten oy kullandınız' });
    }

    // Oyu kaydet
    cancellationVote.votes.push({
      userId,
      vote: vote as 'approve' | 'reject',
      votedAt: new Date(),
    } as any);

    // Eğer red oyu varsa, oylamayı hemen reddet
    if (vote === 'reject') {
      cancellationVote.status = 'rejected';
      await cancellationVote.save();

      console.log('[submitVote] Oylama reddedildi (en az 1 red oyu)');

      // Tüm katılımcılara ve kurucuya bildirim gönder
      const allUsers = [
        gameSession.creatorId,
        ...(gameSession.acceptedPlayers || []),
      ];

      const notificationPromises = allUsers.map((uid: any) =>
        Notification.create({
          userId: uid,
          type: 'cancellation_vote_result',
          title: 'Oyun İptal Oylaması Sonuçlandı',
          message: `"${gameSession.title}" oyununun iptal oylaması reddedildi. Oyun devam edecek.`,
          data: {
            gameSessionId: String(gameSession._id),
            voteId: String(cancellationVote._id),
            result: 'rejected',
          },
          read: false,
        })
      );

      await Promise.all(notificationPromises);
      console.log('[submitVote] İptal reddedildi bildirimleri gönderildi');

      return res.status(200).json({
        success: true,
        message: 'Oyunuz kaydedildi. Oyun iptal edilmeyecek.',
        data: cancellationVote,
      });
    }

    // Tüm katılımcılar onayladı mı kontrol et
    const totalParticipants = gameSession.acceptedPlayers?.length || 0;
    const totalVotes = cancellationVote.votes.length;

    if (totalVotes === totalParticipants) {
      // Tüm katılımcılar oy kullandı, hepsi onay mı kontrol et
      const allApproved = cancellationVote.votes.every((v: any) => v.vote === 'approve');

      if (allApproved) {
        cancellationVote.status = 'approved';
        await cancellationVote.save();

        // Oyunu iptal et
        gameSession.status = 'cancelled';
        await gameSession.save();

        console.log('[submitVote] Oylama onaylandı, oyun iptal edildi');

        // Tüm katılımcılara ve kurucuya bildirim gönder
        const allUsers = [
          gameSession.creatorId,
          ...(gameSession.acceptedPlayers || []),
        ];

        const notificationPromises = allUsers.map((uid: any) =>
          Notification.create({
            userId: uid,
            type: 'game_cancelled',
            title: 'Oyun İptal Edildi',
            message: `"${gameSession.title}" oyunu tüm katılımcıların onayıyla iptal edildi.`,
            data: {
              gameSessionId: String(gameSession._id),
              voteId: String(cancellationVote._id),
              result: 'approved',
            },
            read: false,
          })
        );

        await Promise.all(notificationPromises);
        console.log('[submitVote] Oyun iptal edildi bildirimleri gönderildi');

        return res.status(200).json({
          success: true,
          message: 'Oyun iptal edildi',
          data: cancellationVote,
        });
      }
    }

    // Henüz tüm oylar toplanmadı
    await cancellationVote.save();
    console.log('[submitVote] Oy kaydedildi, bekleniyor:', { totalVotes: totalVotes, totalParticipants });

    res.status(200).json({
      success: true,
      message: 'Oyunuz kaydedildi',
      data: cancellationVote,
    });
  } catch (error: any) {
    console.error('[submitVote] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Oy kullanılırken bir hata oluştu' });
  }
};

/**
 * Oyun için oylama durumunu getir
 * GET /api/cancellation-votes/game/:gameSessionId
 */
export const getCancellationVote = async (req: Request, res: Response) => {
  try {
    const { gameSessionId } = req.params;

    const cancellationVote = await CancellationVote.findOne({ gameSessionId })
      .populate('initiatorId', 'firstName lastName')
      .populate('votes.userId', 'firstName lastName');

    if (!cancellationVote) {
      return res.status(404).json({ success: false, message: 'Oylama bulunamadı' });
    }

    res.status(200).json({ success: true, data: cancellationVote });
  } catch (error: any) {
    console.error('[getCancellationVote] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Oylama bilgisi getirilirken bir hata oluştu' });
  }
};

/**
 * VoteId ile oylama durumunu getir
 * GET /api/cancellation-votes/:voteId
 */
export const getCancellationVoteById = async (req: Request, res: Response) => {
  try {
    const { voteId } = req.params;

    const cancellationVote = await CancellationVote.findById(voteId)
      .populate('initiatorId', 'firstName lastName')
      .populate('votes.userId', 'firstName lastName');

    if (!cancellationVote) {
      return res.status(404).json({ success: false, message: 'Oylama bulunamadı' });
    }

    res.status(200).json({ success: true, data: cancellationVote });
  } catch (error: any) {
    console.error('[getCancellationVoteById] Hata:', error.message);
    res.status(500).json({ success: false, message: 'Oylama bilgisi getirilirken bir hata oluştu' });
  }
};
