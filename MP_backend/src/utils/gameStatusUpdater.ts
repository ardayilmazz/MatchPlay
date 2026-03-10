import GameSession from '../models/GameSession';
import Notification from '../models/Notification';
import JoinRequest from '../models/JoinRequest';
import User from '../models/User';

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

    // 0. Başlama saatine gelmiş ama hiç katılımcı olmayan oyunları iptal et
    const gamesStartingNow = await GameSession.find({
      status: { $in: ['open', 'full'] },
      gameStatus: 'not_started',
      startDate: { $lte: now },
      $expr: {
        $gt: [
          { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
          now,
        ],
      },
    })
      .populate('creatorId', 'firstName lastName')
      .populate('acceptedPlayers', '_id');

    let autoCancelledCount = 0;
    for (const game of gamesStartingNow) {
      // Sadece creator varsa (acceptedPlayers boşsa) oyunu iptal et
      const acceptedPlayersCount = game.acceptedPlayers?.length || 0;
      if (acceptedPlayersCount === 0) {
        game.status = 'cancelled';
        // gameStatus'u değiştirmiyoruz, sadece status'u cancelled yapıyoruz
        await game.save();

        console.log(`[gameStatusUpdater] Oyun otomatik iptal edildi: ${game._id} - Hiç katılımcı yok`);

        // Creator'a bildirim gönder
        await Notification.create({
          userId: game.creatorId,
          type: 'game_cancelled',
          title: 'Oyun Otomatik İptal Edildi',
          message: `"${game.title || 'Oyununuz'}" oyunu başlama saatine kadar hiçbir katılımcı katılmadığı için otomatik olarak iptal edildi.`,
          data: {
            gameSessionId: String(game._id),
            reason: 'auto_cancelled_no_participants',
          },
          read: false,
        });

        // Bekleyen istekleri iptal et
        await JoinRequest.updateMany(
          {
            gameSessionId: game._id,
            status: 'pending',
          },
          {
            status: 'cancelled',
            respondedAt: now,
          }
        );

        autoCancelledCount++;
      }
    }

    if (autoCancelledCount > 0) {
      console.log(`[gameStatusUpdater] ${autoCancelledCount} oyun otomatik iptal edildi (hiç katılımcı yok)`);
    }

    // 1. Başlamış ama henüz bitmemiş oyunları "in_progress" yap (sadece katılımcısı olanlar)
    const inProgressGames = await GameSession.updateMany(
      {
        gameStatus: 'not_started',
        status: { $in: ['open', 'full'] }, // İptal edilmemiş oyunlar
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

    // Başlamış oyunlar için bekleyen istekleri iptal et
    if (inProgressGames.modifiedCount > 0) {
      const startedGameIds = await GameSession.find({
        gameStatus: 'in_progress',
        startDate: { $lte: now },
        $expr: {
          $gt: [
            { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
            now,
          ],
        },
      }).distinct('_id');

      if (startedGameIds.length > 0) {
        const cancelledRequests = await JoinRequest.updateMany(
          {
            gameSessionId: { $in: startedGameIds },
            status: 'pending',
          },
          {
            status: 'cancelled',
            respondedAt: now,
          }
        );

        if (cancelledRequests.modifiedCount > 0) {
          console.log(
            `[gameStatusUpdater] ${cancelledRequests.modifiedCount} bekleyen istek otomatik iptal edildi (oyun başladı)`
          );
        }
      }
    }

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

    // Bitmiş oyunlar için bekleyen istekleri iptal et
    if (completedGames.modifiedCount > 0) {
      const completedGameIds = await GameSession.find({
        gameStatus: 'completed',
        $expr: {
          $lte: [
            { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
            now,
          ],
        },
      }).distinct('_id');

      if (completedGameIds.length > 0) {
        const cancelledRequests = await JoinRequest.updateMany(
          {
            gameSessionId: { $in: completedGameIds },
            status: 'pending',
          },
          {
            status: 'cancelled',
            respondedAt: now,
          }
        );

        if (cancelledRequests.modifiedCount > 0) {
          console.log(
            `[gameStatusUpdater] ${cancelledRequests.modifiedCount} bekleyen istek otomatik iptal edildi (oyun bitti)`
          );
        }
      }
    }

    // 3. Yeni bitmiş oyunlar için puanları hesapla ve ver
    if (completedGames.modifiedCount > 0) {
      // Son 5 dakika içinde bitmiş oyunları bul (tekrar puan vermemek için)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const newlyCompletedGames = await GameSession.find({
        gameStatus: 'completed',
        status: { $ne: 'cancelled' }, // İptal edilmiş oyunlar için puan verme
        startDate: { $exists: true, $ne: null },
        estimatedDuration: { $exists: true, $ne: null },
        $expr: {
          $and: [
            {
              $lte: [
                { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
                now,
              ],
            },
            {
              $gte: [
                { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
                fiveMinutesAgo,
              ],
            },
          ],
        },
      }).populate('creatorId', '_id').populate('acceptedPlayers', '_id');

      // Puanları hesapla ve ver
      for (const game of newlyCompletedGames) {
        if (!game.creatorId || !game.acceptedPlayers) continue;

        const creatorId = (game.creatorId as any)._id || game.creatorId;
        const acceptedPlayers = (game.acceptedPlayers || []).map((p: any) => (p._id || p).toString());
        const totalParticipants = acceptedPlayers.length + 1; // creator + acceptedPlayers

        // Creator için puan: 100 + (katılımcı sayısı - 1) * 5
        const creatorPoints = 100 + (totalParticipants - 1) * 5;
        await User.findByIdAndUpdate(creatorId, {
          $inc: { points: creatorPoints },
        });
        console.log(`[gameStatusUpdater] Creator ${creatorId} için ${creatorPoints} puan eklendi (oyun: ${game._id})`);

        // Her katılımcı için puan: 80 + (toplam katılımcı sayısı - 1) * 3
        const participantPoints = 80 + (totalParticipants - 1) * 3;
        for (const playerId of acceptedPlayers) {
          await User.findByIdAndUpdate(playerId, {
            $inc: { points: participantPoints },
          });
          console.log(`[gameStatusUpdater] Katılımcı ${playerId} için ${participantPoints} puan eklendi (oyun: ${game._id})`);
        }
      }
    }

    // 4. Yeni bitmiş oyunlar için oylama bildirimi gönder
    if (completedGames.modifiedCount > 0) {
      // Son 5 dakika içinde bitmiş oyunları bul (tekrar bildirim göndermemek için)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const newlyCompletedGames = await GameSession.find({
        gameStatus: 'completed',
        startDate: { $exists: true, $ne: null },
        estimatedDuration: { $exists: true, $ne: null },
        $expr: {
          $and: [
            {
              $lte: [
                { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
                now,
              ],
            },
            {
              $gte: [
                { $add: ['$startDate', { $multiply: ['$estimatedDuration', 60000] }] },
                fiveMinutesAgo,
              ],
            },
          ],
        },
      }).populate('creatorId', '_id').populate('acceptedPlayers', '_id');

      const Rating = (await import('../models/Rating')).default;

      for (const game of newlyCompletedGames) {
        if (!game.startDate || !game.estimatedDuration) continue;

        const allParticipants = [
          game.creatorId,
          ...(game.acceptedPlayers || []),
        ].map((p: any) => p._id || p);

        // Her katılımcıya bildirim gönder
        for (const participantId of allParticipants) {
          // Bu kullanıcının bu oyun için daha önce bildirim alıp almadığını kontrol et
          const existingNotification = await Notification.findOne({
            userId: participantId,
            type: 'rating_pending',
            'data.gameSessionId': String(game._id),
          });

          if (!existingNotification) {
            // Bu oyunda oy verebileceği kişileri kontrol et
            const ratedUsers = await Rating.find({
              gameSessionId: game._id,
              raterId: participantId,
            }).distinct('ratedId');

            const usersToRate = allParticipants.filter(
              (pId: any) =>
                String(pId) !== String(participantId) &&
                !ratedUsers.some((ratedId: any) => String(ratedId) === String(pId))
            );

            // Eğer oy verebileceği kişi varsa bildirim gönder
            if (usersToRate.length > 0) {
              await Notification.create({
                userId: participantId,
                type: 'rating_pending',
                title: 'Oyun Sonrası Oylama',
                message: `"${game.title}" oyunu sona erdi. Katılımcıları oylamak ister misiniz?`,
                data: {
                  gameSessionId: String(game._id),
                },
                read: false,
              });
            }
          }
        }
      }
    }

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
