# Fiziksel Cihazdan Bağlantı Kurma Rehberi

## 🎯 Sorun
iPhone veya Android fiziksel cihazınızdan Match Play uygulamasına erişirken "Network request failed" hatası alıyorsanız, bu rehber size yardımcı olacaktır.

---

## ✅ Yapılan Değişiklikler

### 1. Backend CORS Ayarları Güncellendi
**Dosya:** `MP_backend/src/index.ts`

```typescript
// CORS ayarları - TÜM cihazlardan ve ağlardan erişime izin ver
app.use(cors({
  origin: '*',  // Tüm kaynaklara izin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
}));
```

### 2. Backend Tüm Network Interface'leri Dinliyor
```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend sunucusu başlatıldı: http://localhost:${PORT}`);
  console.log(`Yerel ağ erişimi: http://172.20.10.3:${PORT}`);
});
```

### 3. Frontend Otomatik IP Tespiti
**Dosya:** `MP_frontend/expo-client-main/config/api.ts`

- ✅ Expo'nun otomatik tespit ettiği IP kullanılıyor
- ✅ Fiziksel cihaz otomatik algılanıyor
- ✅ Emülatör ve simulator için ayrı ayarlar

---

## 🔧 Kurulum Adımları

### Adım 1: Bilgisayarınızın IP Adresini Bulun

#### Windows:
```bash
ipconfig
```
**Aradığınız:** `IPv4 Address` (örn: `192.168.1.100` veya `172.20.10.3`)

#### Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Adım 2: Frontend Config Dosyasını Güncelleyin

**Dosya:** `MP_frontend/expo-client-main/config/api.ts`

```typescript
const LOCAL_NETWORK_IP = 'BURAYA_IP_ADRESINIZI_YAZIN'; // Örn: '192.168.1.100'
```

### Adım 3: Backend'i Yeniden Başlatın

Backend terminalini kapatıp yeniden başlatın:

```bash
cd MP_backend
npm start
```

**Göreceğiniz çıktı:**
```
Backend sunucusu başlatıldı: http://localhost:3001
Yerel ağ erişimi: http://172.20.10.3:3001
MongoDB bağlantısı başarılı!
```

### Adım 4: Frontend'i Yeniden Başlatın

Frontend terminalinde `r` tuşuna basarak reload edin veya yeniden başlatın:

```bash
cd MP_frontend/expo-client-main
npx expo start
```

### Adım 5: Telefonunuzda QR Kodu Okutun

1. iPhone'da Expo Go uygulamasını açın
2. QR kodu okutun
3. Uygulama yüklenecek ve backend'e bağlanacak

---

## 🔍 Sorun Giderme

### ❌ Hala "Network request failed" hatası alıyorum

#### 1. IP Adresini Kontrol Edin
```bash
# Windows
ipconfig

# Mac/Linux  
ifconfig
```

#### 2. Aynı Wi-Fi Ağında mısınız?
- ✅ Bilgisayar ve telefon **aynı Wi-Fi ağında** olmalı
- ❌ Telefon mobil veri kullanıyorsa çalışmaz
- ❌ Bilgisayar ethernet, telefon Wi-Fi ise sorun olabilir

#### 3. Güvenlik Duvarı Kontrolü

**Windows Defender Firewall:**
```
1. Windows Güvenlik > Güvenlik Duvarı
2. "Bir uygulamaya izin ver" 
3. Node.js'i bulun ve "Özel ağlar" seçeneğini işaretleyin
```

#### 4. Backend'in Çalıştığından Emin Olun

Bilgisayarınızdan tarayıcıda test edin:
```
http://localhost:3001
```

Yerel ağdan test edin:
```
http://[IP_ADRESINIZ]:3001
```

#### 5. Port 3001 Kullanımda mı?

Başka bir uygulama 3001 portunu kullanıyor olabilir:

```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001
```

---

## 🌐 Farklı Ağlardan Erişim

### Seçenek 1: Ngrok Kullanımı (Önerilen)

Farklı internetlerden erişim için ngrok kullanabilirsiniz:

```bash
# Ngrok yükleyin
npm install -g ngrok

# Backend'i ngrok ile expose edin
ngrok http 3001
```

**Çıktı:**
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3001
```

**Frontend config'i güncelleyin:**
```typescript
const API_URL = 'https://abc123.ngrok.io/api';
```

### Seçenek 2: Port Forwarding

Router'ınızın admin panelinden port forwarding ayarlayın:
- Dış port: 3001
- İç IP: Bilgisayarınızın IP'si
- İç port: 3001

⚠️ **Güvenlik Uyarısı:** Production için **SSL/HTTPS** ve **authentication** kullanın!

---

## 📱 Platform Bazlı Notlar

### iOS (iPhone/iPad)
- ✅ Expo Go ile yerel ağda çalışır
- ✅ Simulator için `localhost` kullanılır
- ⚠️ Farklı ağ için VPN veya ngrok gerekir

### Android
- ✅ Expo Go ile yerel ağda çalışır
- ✅ Emülatör için `10.0.2.2` kullanılır
- ⚠️ Bazı Android cihazlarda HTTP trafiği engellenebilir

**Android HTTP İzni:**
`android/app/src/main/AndroidManifest.xml`:
```xml
<application
  android:usesCleartextTraffic="true"
  ...>
```

---

## 🔐 Production Ortamı İçin

Production'da şu değişiklikler yapılmalı:

### 1. CORS Ayarlarını Sıkılaştırın
```typescript
app.use(cors({
  origin: ['https://matchplay.com', 'https://app.matchplay.com'],
  credentials: true
}));
```

### 2. HTTPS Kullanın
- SSL sertifikası edinin (Let's Encrypt ücretsiz)
- Backend'i HTTPS ile deploy edin

### 3. Environment Variables Kullanın
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
```

---

## 📞 Hala Sorun mu Yaşıyorsunuz?

1. Backend loglarını kontrol edin
2. Frontend console'u kontrol edin (Expo Go'da shake → Debug)
3. Network isteğini kontrol edin (Developer Tools)

**Backend log örneği (başarılı):**
```
[2026-02-11T14:25:30.123Z] POST /api/users/login
Request Body: { "email": "user@example.com" }
[2026-02-11T14:25:30.456Z] POST /api/users/login - Status: 200
```

**Frontend log örneği (başarılı):**
```
[API Config] Fiziksel cihaz tespit edildi. Backend IP: 172.20.10.3
Login successful: { token: "...", user: {...} }
```

---

## ✅ Başarı Kontrol Listesi

- [ ] Backend çalışıyor (`npm start` ile başlattım)
- [ ] Backend tüm IP'leri dinliyor (`0.0.0.0`)
- [ ] CORS ayarları `origin: '*'` olarak ayarlı
- [ ] Frontend config'de doğru IP adresi var
- [ ] Telefon ve bilgisayar aynı Wi-Fi'da
- [ ] Güvenlik duvarı Node.js'e izin veriyor
- [ ] Port 3001 açık ve başka uygulama kullanmıyor
- [ ] Frontend'i reload ettim (`r` tuşu)

---

**Son Güncelleme:** 11 Şubat 2026  
**Durum:** ✅ Tüm cihazlardan erişim aktif
