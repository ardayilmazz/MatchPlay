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

### Sorun Giderme ve Ek Notlar

- **Backend Kurulumu:** `npm` komutlarının hatalı dizinlerde çalışması nedeniyle `package.json` dosyası manuel olarak oluşturuldu ve bağımlılıklar sonradan eklendi. TypeScript tip hatalarını çözmek için `node_modules` klasörü silinip `npm install` komutuyla temiz bir kurulum yapıldı.
- **Git Kurulumu:** Proje `git init` ile yerel bir depoya dönüştürüldü. `git remote` komutlarındaki yazım hataları düzeltildi ve Windows Kimlik Bilgileri Yöneticisi'nden eski GitHub hesabının temizlenmesiyle `private` depoya `push` işlemi başarıyla tamamlandı.
- **Frontend Hataları:** Supabase'den geçiş sonrası `AuthContext`, `Input` component'i ve çeşitli servislerdeki (`authService`, `mockData` vb.) tipler ve fonksiyon çağrıları, yeni backend yapısıyla uyumlu olacak şekilde güncellendi.

### Otomatik Giriş (Auto-Login) Akışı

- **Amaç:** Kullanıcının kayıt olduktan sonra tekrar giriş yapma zorunluluğunu ortadan kaldırmak ve doğrudan bir sonraki adıma (profil oluşturma) yönlendirmek.
- **Backend:** `jsonwebtoken` kütüphanesi projeye eklendi. `registerUser` controller'ı, başarılı bir kayıttan sonra kullanıcı bilgileriyle birlikte bir JWT (JSON Web Token) üretecek şekilde güncellendi.
- **Frontend:** `authService`, `AuthContext` ve `register.tsx` dosyaları bu yeni akışı destekleyecek şekilde güncellendi. Kayıt başarılı olduğunda, backend'den gelen kullanıcı bilgileri ve token ile `AuthContext`'teki kullanıcı durumu güncellenerek otomatik giriş sağlandı ve kullanıcı `/onboarding/basic-info` ekranına yönlendirildi.

### Onboarding (Profil Oluşturma) Akışı

- **Profil Fotoğrafı Zorunluluğu Kaldırıldı:** Kullanıcının profil oluşturma sürecini tamamlayabilmesi için `basic-info.tsx` ekranındaki profil fotoğrafı yükleme zorunluluğu kaldırıldı.

### Oyun Oluşturma Akışı

- **Konum Verisi Düzeltmesi:** Oyun oluşturma akışının konum seçme adımında, Kadıköy ilçesi için eksik olan mekan (venue) verileri `mockData.ts` dosyasına eklendi.

## Aşama 3: Gelişmiş Kayıt Akışı (E-posta Doğrulamalı)

- **Amaç:** Güvenliği ve kullanıcı veri doğruluğunu artırmak için kayıt sürecini çok adımlı bir yapıya dönüştürmek.

### Backend Geliştirmeleri
- **E-posta Altyapısı:** `nodemailer` paketi projeye eklenerek e-posta gönderim yeteneği kazandırıldı. Gmail "Uygulama Şifresi" kullanılarak SMTP yapılandırması `.env` dosyasına eklendi.
- **Doğrulama Kodu Modeli:** `VerificationCode.ts` adında yeni bir Mongoose modeli oluşturuldu. Bu model, e-posta, 6 haneli kod ve kodun 10 dakikalık son kullanma tarihini geçici olarak saklar.
- **Yeni Endpoint 1 (`/send-verification-code`):** Kullanıcının girdiği e-postanın veritabanında kayıtlı olup olmadığını kontrol eden, kayıtlı değilse 6 haneli bir kod üretip bunu `VerificationCode` koleksiyonuna kaydeden ve `nodemailer` aracılığıyla kullanıcıya gönderen bir endpoint oluşturuldu.
- **Yeni Endpoint 2 (`/verify-code`):** Kullanıcının girdiği e-posta ve kodun veritabanındaki kayıtla eşleşip eşleşmediğini ve süresinin dolup dolmadığını kontrol eden bir endpoint oluşturuldu. Başarılı doğrulamada geçici kod veritabanından silinir.
- **Register Endpoint'i Güncellemesi:** Mevcut `/register` endpoint'i, kayıt akışının en sonunda tüm kullanıcı bilgilerini (isim, soyisim, şifre, doğum tarihi vb.) tek seferde alıp `User` koleksiyonuna kaydedecek şekilde tamamen yeniden yapılandırıldı.

### Frontend Geliştirmeleri
- **`authService` Güncellemesi:** Backend'de oluşturulan yeni endpoint'lere (`sendVerificationCode`, `verifyCode`) istek atacak fonksiyonlar eklendi. `register` fonksiyonu, tüm adımlardan toplanan verileri tek seferde gönderecek şekilde güncellendi.
- **Çok Adımlı Form Yapısı:** `register.tsx` dosyası, `step` state'i ile yönetilen 6 adımlı bir "wizard" (sihirbaz) formuna dönüştürüldü:
  1.  **E-posta Girişi:** Kullanıcıdan sadece e-posta alınır ve kod gönderme işlemi tetiklenir.
  2.  **Kod Doğrulama:** 6 haneli kod girişi istenir. "Tekrar Kod Gönder" butonu için 30 saniyelik bir bekleme (cooldown) mekanizması kuruldu.
  3.  **Şifre Oluşturma:** Minimum 6 karakter uzunluğunda ve onaylı şifre girişi istenir.
  4.  **Kişisel Bilgiler:** İsim, soyisim ve doğum tarihi istenir. Bu adımda 18 yaş kontrolü ve kullanıcının ad/soyadının e-posta adresiyle eşleşme kontrolü gibi özel doğrulamalar eklendi.
  5.  **Profil Fotoğrafı:** `ImagePicker` kullanılarak, kullanıcının isteğe bağlı olarak fotoğraf ekleyebileceği bir arayüz oluşturuldu ("Şimdilik Atla" seçeneği ile).
  6.  **Biyografi:** Kullanıcının isteğe bağlı olarak 50 karakterlik bir biyografi ekleyebileceği son bir arayüz oluşturuldu. Bu adım tamamlandığında veya atlandığında, toplanan tüm verilerle kayıt işlemi gerçekleştirilir ve kullanıcı ana sayfaya yönlendirilir.

## Aşama 4: Hata Giderme ve Stabilizasyon

- **Kayıt Sonrası Yönlendirme Sorunu:** Kayıt işlemi tamamlandıktan sonra ana sayfaya yönlendirme sırasında ortaya çıkan "This screen doesn't exist" hatası giderildi. Çözüm olarak, yönlendirme mantığı `_layout.tsx` dosyasında merkezileştirildi. Artık bu dosya, kullanıcının kimlik doğrulama durumunu (`isAuthenticated`) dinleyerek, giriş yapmış kullanıcıları otomatik olarak ana sayfaya, yapmamış olanları ise giriş ekranına yönlendiriyor.
- **TypeScript Tip Hataları:** Geliştirme sürecinde `register.tsx` ve `AuthContext.tsx` gibi dosyalarda ortaya çıkan `AuthState`, `Game`, `pathname` gibi tip hataları, eksik tiplerin `types.ts` dosyasına eklenmesi ve hatalı yönlendirme fonksiyonlarının düzeltilmesiyle giderildi.
- **Ana Sayfa Sonsuz Yükleme Sorunu:** Ana sayfanın (`home.tsx`), konum bilgisi (`userLocation`) alınamadığı için sonsuz bir veri çekme döngüsüne girmesi sorunu çözüldü. İleride tekrar ele alınmak üzere, konumla ilgili tüm özellikler (`useLocation` hook'u, ilgili filtreler ve arayüz elemanları) geçici olarak devre dışı bırakılarak ana sayfanın stabil bir şekilde yüklenmesi sağlandı.


## Aşama 5: Çözülemeyen Sonsuz Döngü Sorunu ve Projenin Duraklatılması

- **Problem:** Önceki tüm stabilizasyon çabalarına rağmen, uygulama ana sayfada inatçı bir sonsuz render döngüsü sergilemeye devam etti. Bu durum, uygulamanın donmasına ve kullanılamaz hale gelmesine neden oldu.
- **Kök Neden Analizi:** Sorunun, `home.tsx` bileşeninin kendisinden ziyade, uygulamanın en üst seviyesindeki `AuthContext`'in her render'da yeni bir `value` nesnesi oluşturmasından kaynaklandığı tespit edildi. Bu durum, tüm uygulama ağacının sürekli olarak yeniden render edilmesine yol açan bir "yeniden render fırtınası"nı tetikliyordu.
- **Son Düzeltme Girişimi:** Sorunun kök nedenini çözmek için `AuthContext.tsx` dosyasında, context'in `value` değeri `useMemo` hook'u ile sarmalanarak stabilize edildi. Bu değişikliğin, gereksiz render'ları önleyerek döngüyü kırması hedeflendi.
- **Sonuç:** Yapılan son müdahaleye rağmen, kullanıcı tarafında sorun çözülemedi ve yaşanan hayal kırıklığı üzerine projenin bu noktada duraklatılmasına karar verildi. Sorunun çözülemediği bu dosyaya not olarak eklenmiştir.
