# MatchPlay Projesi Geliştirme Notları

Bu dosya, MatchPlay projesinin geliştirme sürecinde yapılan işlemleri ve alınan kararları belgelemek için oluşturulmuştur.

## Aşama 1: Projeyi Supabase'den Arındırma

- `MP_docs/yapilan_islemler.md` dosyası oluşturuldu.
- Frontend projesinin (`MP_frontend/expo-client-main`) `package.json` dosyasından `@supabase/supabase-js` bağımlılığı kaldırıldı.
- `npm install` komutu çalıştırılarak `node_modules` ve `package-lock.json` güncellendi.
- `lib/supabase.ts` dosyası ve `supabase` veritabanı migrasyon klasörü projeden silindi.
- Supabase kullanan tüm servis dosyaları (`authService`, `storageService`, `gameService`, `gameRequestService`, `notificationService`, `statisticsService`, `waitlistService`) temizlendi.
- Servislerin çalışmaya devam etmesi için sahte veri içeren `mockData.ts` dosyası oluşturuldu.
- Supabase import'u içeren `app/game/[id].tsx` component dosyası temizlendi.

## Aşama 2: Node.js & MongoDB Backend Kurulumu

- `MP_backend` klasöründe `npm init` ile yeni bir Node.js projesi başlatıldı.
- Gerekli bağımlılıklar (`express`, `mongoose`, `dotenv`, `cors`) ve geliştirme bağımlılıkları (`typescript`, `ts-node-dev`, `@types/*`) kuruldu.
- TypeScript için `tsconfig.json` yapılandırma dosyası oluşturuldu.
- `src/index.ts` dosyası oluşturuldu ve içine temel bir Express sunucusu kuruldu.
- Sunucuyu geliştirme modunda çalıştırmak için `package.json` dosyasına `dev` script'i eklendi.
- Proje kök dizinine `.gitignore` dosyası eklendi.
- MongoDB Atlas'tan alınan bağlantı dizesi ile `.env` dosyası oluşturuldu.
- `src/config/db.ts` dosyası oluşturularak veritabanı bağlantı mantığı Mongoose kullanılarak yazıldı.
- `src/index.ts` dosyası, sunucu başlamadan önce veritabanı bağlantısını kuracak şekilde güncellendi.

### Kullanıcı Kayıt Endpoint'i

- Şifreleri güvenli bir şekilde hash'lemek için `bcryptjs` paketi projeye eklendi.
- `src` altında `models`, `controllers`, `routes` klasörleri oluşturularak proje yapısı düzenlendi.
- `models/User.ts` dosyasında, bir kullanıcının veritabanında saklanacak bilgilerini içeren Mongoose şeması ve modeli oluşturuldu.
- `controllers/userController.ts` dosyasında, yeni kullanıcı kaydı mantığını (e-posta kontrolü, şifre hash'leme, veritabanına kaydetme) içeren `registerUser` fonksiyonu yazıldı.
- `routes/userRoutes.ts` dosyasında, `POST /api/users/register` endpoint'i tanımlandı ve `registerUser` controller'ına bağlandı.
- Ana sunucu dosyası `index.ts`, `/api/users` ile başlayan istekleri `userRoutes`'a yönlendirecek şekilde güncellendi.
