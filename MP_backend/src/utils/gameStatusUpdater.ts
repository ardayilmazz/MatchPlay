import GameSession from '../models/GameSession';
import Notification from '../models/Notification';

/**
 * Oyun durumlarını (gameStatus) otomatik günceller
 * startDate ve estimatedDuration'a göre:
 * - Henüz başlamamış: not_started
 * - Oynanıyor: in_progress
 * - Tamamlandı: completed
 */
export const updateGameStatuses = async () => {
  try {
    const now = new Date();

    // 1. Başlamış ama henüz bitmemiş oyunları "in_progress" yap
    const inProgressGames = await GameSession.updateMany(
      {
        gameStatus: 'not_started',
        startDate: { $lte: now },
        $expr: {
          $gt: [
            { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
            now,
          ],
        },
      },
      { gameStatus: 'in_progress' }
    );

    // 2. Bitmiş oyunları "completed" yap
    const completedGames = await GameSession.updateMany(
      {
        gameStatus: { $in: ['not_started', 'in_progress'] },
        $expr: {
          $lte: [
            { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
            now,
          ],
        },
      },
      { gameStatus: 'completed' }
    );

    if (inProgressGames.modifiedCount > 0 || completedGames.modifiedCount > 0) {
      console.log(
        `[gameStatusUpdater] ${inProgressGames.modifiedCount} oyun "in_progress", ${completedGames.modifiedCount} oyun "completed" olarak güncellendi`
      );
    }
  } catch (error: any) {
    console.error('[gameStatusUpdater] Hata:', error.message);
  }
};

/**
 * Otomatik iptal kontrolü: Oyuna 2 saat kala kontenjan tamamlanmamışsa iptal et
 */
export const checkAndAutoCancelGames = async () => {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 saat sonra

    // Oyuna 2 saat kala olan ve autoCancelIfNotFull=true olan oyunları bul
    const gamesToCheck = await GameSession.find({
      autoCancelIfNotFull: true,
      status: { $in: ['open', 'full'] }, // Sadece açık veya dolu oyunlar
      startDate: {
        $gte: now,
        $lte: twoHoursFromNow,
      },
    })
      .populate('creatorId', 'firstName lastName')
      .populate('acceptedPlayers', 'firstName lastName');

    let cancelledCount = 0;

    for (const game of gamesToCheck) {
      if (!game.startDate || !game.totalPlayers) continue;

      // Kontenjan tamamlanmış mı kontrol et
      const totalAcceptedPlayers = game.acceptedPlayers?.length || 0;
      const currentPlayers = totalAcceptedPlayers + 1; // +1 creator
      const isFull = currentPlayers >= game.totalPlayers;

      // Eğer kontenjan tamamlanmamışsa iptal et
      if (!isFull) {
        game.status = 'cancelled';
        await game.save();

        console.log(`[checkAndAutoCancelGames] Oyun iptal edildi: ${game._id} - Kontenjan tamamlanmadı`);

        // Tüm katılımcılara ve kurucuya bildirim gönder
        const allUsers = [
          game.creatorId,
          ...(game.acceptedPlayers || []),
        ];

        const notificationPromises = allUsers.map((uid: any) =>
          Notification.create({
            userId: uid,
            type: 'game_cancelled',
            title: 'Oyun Otomatik İptal Edildi',
            message: `"${game.title}" oyunu kontenjan tamamlanmadığı için otomatik olarak iptal edildi.`,
            data: {
              gameSessionId: String(game._id),
              reason: 'auto_cancelled_not_full',
            },
            read: false,
          })
        );

        await Promise.all(notificationPromises);
        cancelledCount++;
      }
    }

    if (cancelledCount > 0) {
      console.log(`[checkAndAutoCancelGames] ${cancelledCount} oyun otomatik iptal edildi`);
    }
  } catch (error: any) {
    console.error('[checkAndAutoCancelGames] Hata:', error.message);
  }
};
