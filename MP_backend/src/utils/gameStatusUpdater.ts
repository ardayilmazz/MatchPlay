import GameSession from '../models/GameSession';

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
