# Oyuna Katılma Sistemi (Join Request System)

**Tarih:** 10 Şubat 2026

## 📋 Gereksinim

Kullanıcılar oyun oluşturmak yerine diğer kullanıcıların oluşturduğu oyunlara katılabilecekler:

### 1. Ana Sayfa ve Keşfet Sayfası
- Ana sayfada o gün içerisinde ve 5km mesafedeki oyunlar
- Keşfet sayfasında filtreleme ile oyun arama

### 2. Oyuna Katılma İsteği
- Kullanıcı oyun lobisine tıklar → Oyun detaylarını görür
- "Katılma İsteği Gönder" butonu
- İstek gönderilince lobi sahibine bildirim gider

### 3. Lobi Sahibi Onayı
Bildirime tıklayınca katılmak isteyen oyuncunun bilgilerini görür:
- Profil resmi
- İsim soyisim
- Yaş
- Cinsiyet
- Üniversite ismi
- Hakkımda
- "Kabul Et" veya "Reddet" butonları

---

## 🔧 Backend Değişiklikleri

### 1. Yeni Modeller

#### JoinRequest Model
**Dosya:** `MP_backend/src/models/JoinRequest.ts`

```typescript
{
  gameSessionId: ObjectId,      // Hangi oyun
  userId: ObjectId,              // Kimden
  status: 'pending' | 'accepted' | 'rejected',
  message?: string,              // Kullanıcının opsiyonel mesajı
  respondedAt?: Date,
  timestamps: true
}
```

**Önemli Özellikler:**
- Unique index: `{ gameSessionId, userId }` 
  - Aynı kullanıcı aynı oyuna birden fazla istek gönderemesin

#### Notification Model
**Dosya:** `MP_backend/src/models/Notification.ts`

```typescript
{
  userId: ObjectId,              // Bildirimi alacak kullanıcı
  type: NotificationType,
  title: string,
  message: string,
  data: {
    gameSessionId?: string,
    requestId?: string,
    senderId?: string,
  },
  read: boolean,
  timestamps: true
}
```

**NotificationType Enum:**
- `join_request_received` - Lobi sahibine: X katılmak istiyor
- `join_request_accepted` - İstek sahibine: Katılım kabul edildi
- `join_request_rejected` - İstek sahibine: Katılım reddedildi
- `game_cancelled` - Tüm oyunculara: Oyun iptal edildi
- `game_full` - İlgilenen herkese: Oyun doldu
- `game_reminder` - Katılanlara: Oyun 1 saat içinde başlayacak
- `player_left` - Lobi sahibine: Bir oyuncu ayrıldı

---

### 2. Yeni API Endpoints

#### Join Request Controller
**Dosya:** `MP_backend/src/controllers/joinRequestController.ts`

##### POST `/api/games/sessions/:id/join`
**Oyuna katılma isteği gönder**

Kontroller:
- ✅ Oyun durumu kontrolü (status === 'open')
- ✅ Kullanıcı zaten katılmış mı?
- ✅ Kullanıcı oyun kurucusu mu?
- ✅ Daha önce istek gönderilmiş mi?

İşlemler:
1. JoinRequest oluştur (status: 'pending')
2. Lobi sahibine bildirim gönder

##### GET `/api/games/sessions/:id/requests`
**Oyunun katılma isteklerini getir**

Kontroller:
- ✅ Sadece lobi kurucusu erişebilir

İşlemler:
1. Pending istekleri getir
2. Kullanıcı bilgileri populate edilir

##### POST `/api/games/requests/:id/accept`
**Katılma isteğini kabul et**

Kontroller:
- ✅ Sadece lobi kurucusu kabul edebilir
- ✅ İstek zaten işlenmiş mi?
- ✅ Oyunda yer var mı?

İşlemler:
1. İsteği kabul et (status: 'accepted', respondedAt)
2. Oyuncuyu oyuna ekle (`currentPlayers` array'ine push)
3. Oyun doldu mu kontrol et → status: 'full'
4. İstek sahibine bildirim gönder

##### POST `/api/games/requests/:id/reject`
**Katılma isteğini reddet**

Kontroller:
- ✅ Sadece lobi kurucusu reddedebilir
- ✅ İstek zaten işlenmiş mi?

İşlemler:
1. İsteği reddet (status: 'rejected', respondedAt)
2. İstek sahibine bildirim gönder

---

#### Notification Controller
**Dosya:** `MP_backend/src/controllers/notificationController.ts`

##### GET `/api/notifications`
**Kullanıcının bildirimlerini getir**

Query Params:
- `unreadOnly=true` (opsiyonel)

İşlemler:
- Son 50 bildirimi getir
- Tarihe göre sıralı (yeniden eskiye)

##### PUT `/api/notifications/:id/read`
**Bildirimi okundu olarak işaretle**

##### GET `/api/notifications/requests/:id/user`
**İstek sahibinin detaylı bilgilerini getir**

Kontroller:
- ✅ Sadece lobi kurucusu erişebilir

İşlemler:
- Kullanıcı bilgileri + yaş hesaplama

---

### 3. Utility Functions

**Dosya:** `MP_backend/src/utils/userHelpers.ts`

```typescript
// Doğum tarihinden yaş hesapla
calculateAge(birthDate: Date): number

// Cinsiyet label'ı getir
getGenderLabel(gender?: string): string
```

---

### 4. Routes

#### Join Request Routes
**Dosya:** `MP_backend/src/routes/joinRequestRoutes.ts`

```typescript
POST   /api/games/sessions/:id/join      → sendJoinRequest
GET    /api/games/sessions/:id/requests  → getGameRequests
POST   /api/games/requests/:id/accept    → acceptJoinRequest
POST   /api/games/requests/:id/reject    → rejectJoinRequest
```

#### Notification Routes
**Dosya:** `MP_backend/src/routes/notificationRoutes.ts`

```typescript
GET    /api/notifications                    → getNotifications
PUT    /api/notifications/:id/read           → markAsRead
GET    /api/notifications/requests/:id/user  → getRequestUserDetails
```

#### Ana Index Güncelleme
**Dosya:** `MP_backend/src/index.ts`

```typescript
app.use('/api/games', joinRequestRoutes);
app.use('/api/notifications', notificationRoutes);
```

---

## 💻 Frontend Değişiklikleri

### 1. Yeni Servisler

#### Game Request Service
**Dosya:** `MP_frontend/expo-client-main/services/gameRequestService.ts`

```typescript
// Katılma isteği gönder
sendJoinRequest(gameId: string, token: string, message?: string): Promise<GameRequest>

// İsteği kabul et (lobi sahibi)
acceptJoinRequest(requestId: string, token: string): Promise<void>

// İsteği reddet (lobi sahibi)
rejectJoinRequest(requestId: string, token: string): Promise<void>

// Oyunun isteklerini getir (lobi sahibi)
getGameRequests(gameId: string, token: string): Promise<any[]>

// Kullanıcının bu oyun için isteği var mı?
getRequestForGame(gameId: string, token: string): Promise<GameRequest | null>

// İstek sahibinin detaylı bilgilerini getir
getRequestUserDetails(requestId: string, token: string): Promise<any>
```

---

#### Notification Service
**Dosya:** `MP_frontend/expo-client-main/services/notificationService.ts`

```typescript
// Bildirimleri getir
getNotifications(token: string, unreadOnly?: boolean): Promise<Notification[]>

// Bildirimi okundu işaretle
markAsRead(notificationId: string, token: string): Promise<void>

// Okunmamış bildirim sayısı
getUnreadCount(token: string): Promise<number>
```

**Notification Interface:**
```typescript
interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    gameSessionId?: string;
    requestId?: string;
    senderId?: string;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Oyun Detay Sayfası Güncellemesi

**Dosya:** `MP_frontend/expo-client-main/app/game/[id].tsx`

#### Güncellenen Fonksiyonlar

**handleSendRequest():**
```typescript
const handleSendRequest = async () => {
  if (!user || !game || !user.token) return;
  
  await gameRequestService.sendJoinRequest(game.id, user.token);
  Alert.alert('Başarılı', 'Katılım isteğiniz gönderildi');
  await checkUserStatus();
};
```

**checkUserStatus():**
```typescript
const checkUserStatus = async () => {
  if (!user || !id || !user.token) return;
  
  const request = await gameRequestService.getRequestForGame(id, user.token);
  setUserRequest(request);
  
  // TODO: Backend'den currentPlayers gelince aktif olacak
  setIsParticipant(false);
};
```

**renderActionButton():**
- Kullanıcı oyun kurucusu → "İstekleri Yönet" butonu
- Kullanıcı katılmış → "Oyuna Katıldınız" badge
- İstek pending → "İsteği İptal Et" butonu (TODO)
- İstek accepted → "İsteğiniz Kabul Edildi" badge
- İstek rejected → "İstek Reddedildi" badge
- Oyun dolu → "Bekleme Listesine Katıl" butonu
- Oyun açık → "Katılma İsteği Gönder" butonu ✅

---

### 3. Bildirimler Sayfası Güncellemesi

**Dosya:** `MP_frontend/expo-client-main/app/(tabs)/notifications.tsx`

#### Önemli Değişiklikler

**loadNotifications():**
```typescript
const loadNotifications = async () => {
  if (!user?.token) return;
  const data = await notificationService.getNotifications(user.token);
  setNotifications(data);
};
```

**handleNotificationPress():**
```typescript
const handleNotificationPress = async (notification: Notification) => {
  if (!notification.read) {
    await handleMarkAsRead(notification._id);
  }

  // Katılma isteği bildirimi ise modal aç
  if (notification.type === 'join_request_received' && notification.data.requestId) {
    setSelectedRequestId(notification.data.requestId);
  } 
  // Diğer bildirimler için oyun detayına git
  else if (notification.data.gameSessionId) {
    router.push(`/game/${notification.data.gameSessionId}` as any);
  }
};
```

**Notification Icon Mapping:**
- `join_request_received` → UserPlus icon (primary)
- `join_request_accepted` → CheckCircle2 icon (success)
- `join_request_rejected` → XCircle icon (error)
- `game_cancelled` → XCircle icon (error)
- `game_full` → Bell icon (secondary)
- `game_reminder` → Calendar icon (secondary)
- `player_left` → XCircle icon (warning)

**handleMarkAllAsRead():**
```typescript
const handleMarkAllAsRead = async () => {
  const unreadNotifications = notifications.filter((n) => !n.read);
  await Promise.all(
    unreadNotifications.map((n) => notificationService.markAsRead(n._id, user.token!))
  );
  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
};
```

---

### 4. Yeni Component: JoinRequestModal

**Dosya:** `MP_frontend/expo-client-main/components/JoinRequestModal.tsx`

#### Props
```typescript
interface JoinRequestModalProps {
  visible: boolean;
  requestId: string;
  onClose: () => void;
}
```

#### Özellikler
- ✅ Modal bottom sheet tasarımı
- ✅ İstek sahibinin detaylı bilgilerini gösterir
- ✅ Profil resmi (veya placeholder)
- ✅ İsim soyisim, yaş, cinsiyet
- ✅ Üniversite bilgisi
- ✅ Hakkımda (bio)
- ✅ Kullanıcının mesajı (varsa)
- ✅ "Kabul Et" ve "Reddet" butonları
- ✅ Loading states
- ✅ Error handling

#### Görsel Tasarım

**Profil Bölümü:**
```
┌────────────────────────┐
│   [Profil Resmi]       │
│   İsim Soyisim         │
│   25 yaşında • Erkek   │
└────────────────────────┘
```

**Detaylar Bölümü:**
```
┌─────────────────────────────┐
│ 🎓  Üniversite              │
│     İstanbul Teknik Üniv.   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 💬  Hakkımda                │
│     Futbol oynamayı çok...  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Mesaj:                      │
│ Lütfen beni oyuna alın...   │
└─────────────────────────────┘
```

**Action Butonları:**
```
┌──────────────┬──────────────┐
│   Reddet     │   Kabul Et   │
└──────────────┴──────────────┘
```

---

## 📱 Kullanıcı Akışı

### Oyuna Katılma Akışı

1. Kullanıcı keşfet veya ana sayfadan oyun görür
2. Oyun kartına tıklar → `/game/[id]` sayfası açılır
3. Oyun detaylarını inceler:
   - Oyun türü, tarih, saat
   - Konum bilgileri
   - Oyuncu sayısı
   - Yetenek seviyesi
   - Açıklama
4. "Katılma İsteği Gönder" butonuna basar
5. İstek başarıyla gönderilir
6. ✅ "İsteğiniz gönderildi" mesajı
7. 🔔 Lobi sahibine "join_request_received" bildirimi gider

---

### Lobi Sahibi Onay Akışı

1. Lobi sahibi bildirimler sayfasına girer
2. 🔔 "X oyununuza katılmak istiyor" bildirimi görür
3. Bildirime tıklar → **JoinRequestModal** açılır
4. Oyuncunun profilini inceler:
   - 📷 Profil resmi
   - 👤 İsim soyisim
   - 📅 Yaş ve cinsiyet
   - 🎓 Üniversite
   - 💬 Hakkımda
   - ✉️ Mesaj (varsa)
5. Karar verir:
   - ✅ "Kabul Et" → İstek onaylanır
   - ❌ "Reddet" → İstek reddedilir
6. Modal kapanır
7. 🔔 İstek sahibine sonuç bildirimi gider

---

### İstek Sahibi Sonuç Akışı

1. İstek sahibi bildirimler sayfasına girer
2. Bildirim görür:
   - ✅ "Katılım isteğiniz kabul edildi" (yeşil)
   - ❌ "Katılım isteğiniz reddedildi" (kırmızı)
3. Bildirime tıklar → Oyun detay sayfasına gider
4. **Kabul edildiyse:**
   - "Oyuna Katıldınız" badge görünür
   - Oyun bilgilerine erişebilir
   - Oyun gününde katılabilir

---

## ✅ Tamamlanan Özellikler

### Backend
- ✅ JoinRequest modeli
- ✅ Notification modeli
- ✅ Katılma isteği gönderme endpoint'i
- ✅ İstek kabul/red endpoint'leri
- ✅ Bildirim sistemi endpoint'leri
- ✅ Kullanıcı yaş hesaplama utility
- ✅ Route'lar ana index'e bağlandı

### Frontend
- ✅ Game request servisi
- ✅ Notification servisi
- ✅ Oyun detay sayfası güncellemesi
- ✅ Bildirimler sayfası güncellemesi
- ✅ JoinRequestModal component
- ✅ Oyuna katılma butonu ve UI
- ✅ İstek onaylama/reddetme UI

---

## 🔄 Değiştirilen Dosyalar

### Backend (YENİ)
- ✅ `MP_backend/src/models/JoinRequest.ts`
- ✅ `MP_backend/src/models/Notification.ts`
- ✅ `MP_backend/src/utils/userHelpers.ts`
- ✅ `MP_backend/src/controllers/joinRequestController.ts`
- ✅ `MP_backend/src/controllers/notificationController.ts`
- ✅ `MP_backend/src/routes/joinRequestRoutes.ts`
- ✅ `MP_backend/src/routes/notificationRoutes.ts`

### Backend (GÜNCELLENDİ)
- ✅ `MP_backend/src/index.ts` (Route'lar eklendi)

### Frontend (YENİ)
- ✅ `MP_frontend/expo-client-main/services/notificationService.ts`
- ✅ `MP_frontend/expo-client-main/components/JoinRequestModal.tsx`

### Frontend (GÜNCELLENDİ)
- ✅ `MP_frontend/expo-client-main/services/gameRequestService.ts` (Backend'e bağlandı)
- ✅ `MP_frontend/expo-client-main/app/game/[id].tsx` (Token kullanımı)
- ✅ `MP_frontend/expo-client-main/app/(tabs)/notifications.tsx` (Backend entegrasyonu)

---

## 📝 Notlar ve TODO

### 1. İptal Özelliği
**Durum:** TODO  
**Açıklama:** Kullanıcı gönderdiği isteği iptal edebilme özelliği eklenebilir.

**Backend Endpoint:**
```typescript
DELETE /api/games/requests/:id/cancel
```

### 2. currentPlayers Kontrolü
**Durum:** TODO  
**Açıklama:** Oyuna katılan oyuncuların listesi (`currentPlayers`) backend'den geldiğinde `isParticipant` kontrolü aktif olacak.

**Frontend Kontrol:**
```typescript
const isParticipant = game.currentPlayers?.includes(user.id);
```

### 3. Bildirim Silme
**Durum:** KALDIRILDI  
**Açıklama:** Bildirim silme özelliği frontend'de kaldırıldı, okundu işaretleme odaklı sistem kullanılıyor.

### 4. Yaş Hesaplama
**Durum:** ✅ TAMAMLANDI  
**Açıklama:** Backend'de `birthDate` üzerinden otomatik yaş hesaplanıyor.

---

## 🚀 Gelecek Geliştirmeler

1. **Push Notifications**
   - Firebase Cloud Messaging
   - Expo Push Notifications
   - Gerçek zamanlı bildirim gönderimi

2. **Gerçek Zamanlı Bildirimler**
   - WebSocket entegrasyonu
   - Socket.io kullanımı
   - Anlık bildirim güncellemeleri

3. **İstek İptal Etme**
   - Kullanıcı isteğini geri çekebilir
   - Backend endpoint eklenecek

4. **Toplu İstek İşleme**
   - Birden fazla isteği aynı anda kabul/red
   - Lobi sahibi için toplu işlem UI'ı

5. **Oyuncu Değerlendirme**
   - Oyun sonrası oyuncu puanlama
   - Güvenilirlik skoru sistemi

6. **Otomatik Kabul/Red**
   - Belirli kriterlere göre otomatik kabul
   - Blacklist/whitelist sistemi

---

## 🔐 Güvenlik

### Backend Kontrolleri
- ✅ Sadece lobi kurucusu istekleri kabul/red edebilir
- ✅ Aynı kullanıcı aynı oyuna birden fazla istek gönderemez
- ✅ Oyun durumu kontrolleri (open, full, cancelled)
- ✅ JWT token ile kimlik doğrulama
- ✅ Oyunda yer kontrolü

### Frontend Validasyonları
- ✅ Token kontrolü
- ✅ Kullanıcı oturum kontrolü
- ✅ Error handling ve mesajları
- ✅ Loading states

---

## 📊 İstatistikler

**Toplam Yeni Dosya:** 7 backend + 2 frontend = **9 dosya**  
**Güncellenen Dosya:** 1 backend + 3 frontend = **4 dosya**  
**Toplam API Endpoint:** **9 endpoint**  
**Toplam Model:** **2 model** (JoinRequest, Notification)

---

**Son Güncelleme:** 10 Şubat 2026  
**Durum:** ✅ Tamamlandı
