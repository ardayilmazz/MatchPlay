import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'join_request_received'     // Lobi sahibine: X katılmak istiyor
  | 'join_request_accepted'     // İstek sahibine: Katılım isteğiniz kabul edildi
  | 'join_request_rejected'     // İstek sahibine: Katılım isteğiniz reddedildi
  | 'join_request_cancelled'    // Lobi sahibine: X katılım isteğini iptal etti
  | 'game_cancelled'            // Tüm oyunculara: Oyun iptal edildi
  | 'game_full'                 // İlgilenen herkese: Oyun doldu
  | 'game_reminder'             // Katılanlara: Oyun 1 saat içinde başlayacak
  | 'player_left'               // Lobi sahibine: Bir oyuncu ayrıldı
  | 'cancellation_vote_request' // Katılımcılara: Oyunun iptal edilmesi için oy kullanın
  | 'cancellation_vote_result' // Tüm oyunculara: Oylama sonucu (iptal edildi veya devam ediyor)
  | 'waitlist_joined'           // Oyun kurucusuna: X bekleme listesine katıldı
  | 'waitlist_slot_available';  // Bekleme listesindeki kullanıcılara: Kontenjan açıldı

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // Bildirimi alacak kullanıcı
  type: NotificationType;
  title: string;
  message: string;
  data: {
    gameSessionId?: string;
    requestId?: string;
    senderId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'join_request_received',
        'join_request_accepted',
        'join_request_rejected',
        'join_request_cancelled',
        'game_cancelled',
        'game_full',
        'game_reminder',
        'player_left',
        'cancellation_vote_request',
        'cancellation_vote_result',
        'waitlist_joined',
        'waitlist_slot_available',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
