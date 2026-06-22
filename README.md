# MatchPlay

MatchPlay, üniversite öğrencilerinin spor ve oyun etkinlikleri için ekip arkadaşı bulmasını sağlayan bir mobil platformdur. Kullanıcılar etkinlik oluşturabilir, keşfedebilir, katılım isteği gönderebilir, bekleme listesine yazılabilir ve oyun sonrası birbirlerini puanlayabilir.

## Teknoloji Özeti

| Katman | Teknoloji |
|--------|-----------|
| Mobil uygulama | React Native, Expo, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Veritabanı | MongoDB (Mongoose) |
| Kimlik doğrulama | JWT, bcrypt, e-posta OTP (Nodemailer) |

## Proje Yapısı

```
MatchPlay_V1.0/
├── MP_backend/                          # REST API sunucusu
│   └── src/
├── MP_frontend/expo-client-main/        # Mobil uygulama (Expo)
└── README.md
```

## Gereksinimler

- [Node.js](https://nodejs.org/) (LTS, v18+ önerilir)
- npm
- MongoDB (yerel veya [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Gmail hesabı (kayıt sırasında e-posta doğrulama kodu için)
- Mobil test için: [Expo Go](https://expo.dev/go) veya Android/iOS emülatör

---

## Sistemi Ayağa Kaldırma

### 1. Backend kurulumu

```bash
cd MP_backend
npm install
```

`MP_backend` klasöründe `.env` dosyası oluşturun:

```env
PORT=3001
MONGO_URI=mongodb+srv://<kullanici>:<sifre>@<cluster>.mongodb.net/matchplay
JWT_SECRET=guclu_bir_gizli_anahtar_yazin
EMAIL_USER=sizin@gmail.com
EMAIL_PASS=gmail_uygulama_sifresi
```

| Değişken | Açıklama |
|----------|----------|
| `MONGO_URI` | MongoDB bağlantı dizesi |
| `JWT_SECRET` | JWT imzalama anahtarı |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail SMTP (2 adımlı doğrulama + uygulama şifresi gerekir) |

İsteğe bağlı — başlangıç verisi:

```bash
npm run seed:games
npm run seed:locations
```

Backend'i başlatın:

```bash
npm run dev
```

Sunucu `http://localhost:3001` adresinde çalışır. API dokümantasyonu: `http://localhost:3001/api-docs`

---

### 2. Frontend kurulumu

Yeni bir terminal açın:

```bash
cd MP_frontend/expo-client-main
npm install
```

Mobil uygulamayı başlatın:

```bash
npx expo start
```

Terminalde çıkan QR kodu **Expo Go** ile tarayın veya `a` (Android) / `i` (iOS simülatör) tuşlarına basın.

---

### 3. Backend bağlantısı (önemli)

Mobil uygulama backend'e `MP_frontend/expo-client-main/config/api.ts` üzerinden bağlanır.

**Android emülatör:** Ek ayar gerekmez (`10.0.2.2:3001` otomatik kullanılır).

**iOS simülatör:** Ek ayar gerekmez (`localhost:3001` otomatik kullanılır).

**Fiziksel telefon:** Bilgisayarınızın yerel ağ IP'sini `config/api.ts` içindeki `LOCAL_NETWORK_IP` değerine yazın. Windows'ta IP bulmak için:

```powershell
ipconfig
```

(Wireless LAN / Ethernet altındaki IPv4 adresi.)

Telefon ve bilgisayar **aynı Wi‑Fi ağında** olmalıdır.

**Farklı ağ / uzaktan test:** ngrok gibi bir tünel kullanın ve frontend `.env` dosyasında tanımlayın:

```env
EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
```

---

## Hızlı Kontrol Listesi

1. MongoDB erişilebilir mi? → Backend logunda `MongoDB bağlantısı başarılı` görünmeli
2. Backend çalışıyor mu? → Tarayıcıda `http://localhost:3001` açılmalı
3. Frontend backend'e ulaşıyor mu? → Kayıt/giriş veya oyun listesi deneyin
4. E-posta doğrulama çalışmıyorsa → `.env` içindeki `EMAIL_USER` / `EMAIL_PASS` değerlerini kontrol edin

---

## Ana Özellikler

- `.edu` / `.edu.tr` e-posta ile kayıt ve OTP doğrulama
- Etkinlik oluşturma (3 adımlı sihirbaz)
- Keşfet ve filtreleme
- Katılım istekleri, bekleme listesi, bildirimler
- Oyun sonrası puanlama ve şikayet sistemi
- Otomatik oyun durumu güncelleme ve iptal oylaması

---

## Lisans

Bu proje tez / eğitim amaçlı geliştirilmiştir.
