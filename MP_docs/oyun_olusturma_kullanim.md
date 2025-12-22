# Oyun Oluşturma Sistemi - Kullanım Kılavuzu

Bu dokümantasyon, yeni oyun oluşturma sisteminin nasıl çalıştığını ve nasıl kullanılacağını açıklar.

## 🚀 Sistem Başlatma

### 1. Backend'i Başlat

```bash
cd MP_backend
npm run dev
```

### 2. Oyun Tiplerini Veritabanına Ekle (İlk Kurulum)

```bash
cd MP_backend
npm run seed:games
```

Bu komut 25 oyun tipini veritabanına ekler. **Sadece bir kez çalıştırmanız yeterli.**

### 3. Frontend'i Başlat

```bash
cd MP_frontend/expo-client-main
npm start
```

## 📱 Kullanıcı Deneyimi

### Oyun Oluşturma Akışı

#### Adım 1: Oyun Seçimi
- Veritabanından gelen 25+ oyun görüntülenir
- 4 kategoriye ayrılmış: Masa & Taş, Spor, Beceri, Kart
- Kullanıcı oyun seçer → Otomatik bir sonraki adıma geçer

#### Adım 2: Açıklama
- **Başlık** (zorunlu, max 60 karakter)
- **Açıklama** (opsiyonel, max 300 karakter)
- **Etiketler** (max 3 adet seçilebilir)
  - #Eğlencesine
  - #İddialı
  - #Turnuva
  - #AcemiDostu
  - #SohbetMuhabbet

#### Adım 3: Konum ve Zaman
- **Şehir** (zorunlu)
- **İlçe** (zorunlu)
- **Mekan** (zorunlu)
- **Ödeme Tipi** (sadece ücretli oyunlarda görünür)
  - Alman Usulü
  - Ortak Ödeme
  - Ismarlıyorum
  - Ücretsiz
- **Tarih ve Saat** (zorunlu)
- **Tahmini Süre** (30-180 dakika)

#### Adım 4: Ekip Ayarları (Dinamik)

**Herkes İçin:**
- Toplam oyuncu sayısı
- İhtiyaç duyulan kişi sayısı
- Yetenek seviyesi (5 seçenek)

**Sadece Takım Oyunları İçin (ör: Basketbol, Futbol):**
- Takım oluşturma yöntemi:
  - Manuel Seç
  - Rastgele Karıştır

**Sadece Ekipman Gerektiren Oyunlar İçin (ör: Monopoly, Tenis):**
- "Ekipmanım var mı?" sorusu

#### Adım 5: Oyuncu Kriterleri
- **Cinsiyet Tercihi:**
  - Herkes Katılabilir
  - Sadece Kızlar
  - Sadece Erkekler
  - Karma (Dengeli)

#### Adım 6: Özet ve Yayınlama
- Tüm girilen bilgilerin gösterimi
- "Geri Dön" ile düzenleme yapılabilir
- "Yayınla" butonu ile oyun oluşturulur

## 🔧 Teknik Detaylar

### Taslak Sistemi (AsyncStorage)

**Nasıl Çalışır?**
- Her adımda form verileri AsyncStorage'a kaydedilir
- Kullanıcı uygulamayı kapatsa bile veriler korunur
- Uygulama açıldığında kaldığı yerden devam eder

**Neden Veritabanına Değil?**
- Veritabanına gereksiz yük olmaz
- Daha hızlı çalışır (internet gerektirmez)
- Sadece son adımda tek HTTP isteği atılır

### Dinamik Form Mantığı

**Frontend Karar Verir:**
```typescript
// Oyun tipi özellikleri
{
  hasTeams: true,           // Takım menüsü göster
  requiresEquipment: true,  // Ekipman sorusu göster
  expectsFee: true,         // Ödeme tipi sorusu göster
}
```

**Örnek Senaryolar:**

| Oyun | Takım Menüsü | Ekipman Sorusu | Ödeme Tipi |
|------|-------------|----------------|------------|
| Satranç | ❌ | ❌ | ❌ |
| Basketbol 3v3 | ✅ | ❌ | ❌ |
| Monopoly | ❌ | ✅ | ❌ |
| Halısaha | ✅ | ❌ | ✅ |
| Tenis | ✅ | ✅ | ✅ |

### Cache Sistemi

**Oyun Tipleri Cache:**
```typescript
// İlk yüklemede backend'den çekilir
const gameTypes = await fetchGameTypes();

// Sonraki açılışlarda cache'ten yüklenir
const cached = await fetchGameTypes(); // Hızlı!

// Güncelleme gerekirse
const refreshed = await fetchGameTypes(true); // forceRefresh
```

## 📊 API Endpoints

### Oyun Tipleri
```
GET /api/games/types
Response: Array<GameType>
```

### Oyun Oturumu Oluştur
```
POST /api/games/sessions
Headers: Authorization: Bearer {token}
Body: GameSessionDraft
Response: GameSession
```

### Tüm Oyunları Listele
```
GET /api/games/sessions?city=1&gameType=xyz
Response: Array<GameSession>
```

### Tek Oyun Detayı
```
GET /api/games/sessions/:id
Response: GameSession
```

## 🎯 Önemli Notlar

### 1. İlk Kurulumda Seed Çalıştırın
```bash
npm run seed:games
```

### 2. API URL Ayarı
`MP_frontend/expo-client-main/config/api.ts` dosyasında:
- Android Emulator: `http://10.0.2.2:3001/api`
- iOS Simulator: `http://localhost:3001/api`
- Fiziksel Cihaz: `http://192.168.x.x:3001/api` (bilgisayarınızın IP'si)

### 3. Swagger Dokümantasyonu
Backend çalışırken:
```
http://localhost:3001/api-docs
```

## 🐛 Sorun Giderme

### "Oyunlar yüklenmiyor"
1. Backend çalışıyor mu kontrol edin
2. Seed scripti çalıştırıldı mı? (`npm run seed:games`)
3. API URL doğru mu? (`config/api.ts`)

### "Taslak kayboldu"
- AsyncStorage'ı temizlediniz mi?
- Uygulama verilerini sildiniz mi?
- Normal şartlarda taslak kalıcıdır

### "Yayınlama başarısız"
1. Token geçerli mi? (Giriş yapıldı mı?)
2. Tüm zorunlu alanlar dolu mu?
3. Backend loglarına bakın

## 📝 Gelecek Geliştirmeler

- [ ] Oyun düzenleme özelliği
- [ ] Oyun iptal etme
- [ ] Oyuncuları manuel ekleme/çıkarma
- [ ] Push notification (oyuna katılım isteği)
- [ ] Favorilere ekleme
- [ ] Oyun geçmişi
- [ ] Admin paneli (oyun tipleri yönetimi)

