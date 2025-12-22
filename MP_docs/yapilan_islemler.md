# MatchPlay Projesi Geliştirme Notları

Bu dosya, MatchPlay projesinin geliştirme sürecinde yapılan işlemleri ve alınan kararları belgelemek için oluşturulmuştur.

## Aşama 1: Projeyi Supabase'den Arındırma

- Supabase bağımlılıkları (`@supabase/supabase-js`) kaldırıldı
- Supabase kullanan tüm servis dosyaları temizlendi (`authService`, `storageService`, `gameService`, vb.)
- Servislerin çalışmaya devam etmesi için `mockData.ts` dosyası oluşturuldu
- Frontend'deki Supabase import'ları kaldırıldı

## Aşama 2: Node.js & MongoDB Backend Kurulumu

- Express.js backend kuruldu (TypeScript ile)
- MongoDB Atlas bağlantısı yapıldı (Mongoose kullanılarak)
- Kullanıcı kayıt endpoint'i oluşturuldu (`POST /api/users/register`)
- Bcrypt ile şifre hash'leme sistemi kuruldu
- JWT token sistemi eklendi (otomatik giriş için)

## Aşama 3: Gelişmiş Kayıt Akışı (E-posta Doğrulamalı)

**Backend:**
- Nodemailer ile e-posta gönderim sistemi kuruldu
- `VerificationCode` modeli oluşturuldu (6 haneli kod, 10 dakika geçerlilik)
- `POST /api/users/send-verification-code` endpoint'i eklendi
- `POST /api/users/verify-code` endpoint'i eklendi
- Register endpoint'i tüm kullanıcı bilgilerini alacak şekilde güncellendi

**Frontend:**
- 6 adımlı kayıt formu oluşturuldu:
  1. E-posta girişi ve kod gönderme
  2. 6 haneli kod doğrulama (30 saniye cooldown ile tekrar gönderme)
  3. Şifre oluşturma (minimum 6 karakter)
  4. Kişisel bilgiler (isim, soyisim, doğum tarihi - 18 yaş kontrolü)
  5. Profil fotoğrafı (isteğe bağlı)
  6. Biyografi (isteğe bağlı, maksimum 50 karakter)

## Aşama 4: Hata Giderme ve Stabilizasyon

- Kayıt sonrası yönlendirme sorunu düzeltildi (`_layout.tsx` merkezileştirildi)
- TypeScript tip hataları giderildi (`types.ts` güncellendi)
- Ana sayfa sonsuz yükleme sorunu çözüldü (konum özellikleri geçici olarak devre dışı)

## Aşama 5: Backend Loglama Sistemi

- Request/Response middleware logları eklendi (şifreler gizlenir)
- Controller fonksiyonlarına detaylı loglar eklendi
- Veritabanı bağlantı logları eklendi
- Log formatı sadeleştirildi (emoji ve dekoratif öğeler kaldırıldı)
- Backend port'u 3001'e değiştirildi

**Güvenlik İyileştirmesi:**
- E-posta isim/soyisim eşleşme kontrolü kaldırıldı (kullanıcı deneyimi için)

## Aşama 6: JWT Tabanlı Login Sistemi

**Backend:**
- `POST /api/users/login` endpoint'i oluşturuldu (e-posta/şifre doğrulama, JWT token üretimi)
- Auth middleware oluşturuldu (`protect` - JWT token doğrulama)
- `GET /api/users/me` endpoint'i eklendi (korumalı, giriş yapmış kullanıcı bilgileri)
- User model'ine `createdAt` ve `updatedAt` alanları eklendi

**Frontend:**
- AsyncStorage ile token yönetimi eklendi (`storageService`)
- `authService.login()` gerçek backend'e bağlandı
- `authService.getCurrentUser()` gerçek backend'e bağlandı (token ile otomatik kullanıcı doğrulama)
- `authService.logout()` token silme işlevi eklendi
- Kayıt sonrası token otomatik saklanıyor

**Güvenlik:**
- JWT token'lar 30 gün geçerli
- Şifreler bcrypt ile hash'leniyor
- Protected route'lar auth middleware ile korunuyor

## Aşama 7: Register Düzenlemeleri ve User Update Endpoint'i

**Register İyileştirmeleri:**
- Yaş kontrolü 18'den 17'ye düşürüldü
- Özel DatePicker component'i oluşturuldu (yıl-ay-gün seçimi, Türkçe ay isimleri, dinamik gün sayısı)
- Kayıt sonrası ana sayfaya otomatik yönlendirme eklendi

**User Update Endpoint:**
- `PUT /api/users/me` endpoint'i oluşturuldu (korumalı)
- Partial update desteği (sadece gönderilen alanlar güncellenir)
- Güncellenebilir alanlar: firstName, lastName, university, department, bio, profilePhoto, sports, skillLevel
- Frontend'de `authService.updateUser()` gerçek implementasyon yapıldı
- Profil düzenleme sayfası entegre edildi

## Aşama 8: Register ve Profil Düzenleme İyileştirmeleri

**Register Akışı:**
- Türkçe karakter desteği eklendi (ı, İ, Ğ, Ü, Ş, Ö, Ç, I)
- Doğum yılı limiti 1960'a ayarlandı (maksimum)
- Üniversite seçimi zorunlu hale getirildi (yeni adım: `UNIVERSITY_INFO`)
- Bölüm seçimi isteğe bağlı
- Kayıt adımları: E-posta → Kod → Şifre → Kişisel Bilgiler → **Üniversite Bilgileri** → Profil Fotoğrafı → Biyografi
- Biyografi adımında profil güncelleme hakkında bilgilendirme mesajı eklendi

**Profil Düzenleme:**
- Tüm alanlar isteğe bağlı (bio/department zorunluluğu kaldırıldı)
- Kullanıcı istediği alanları doldurabilir veya boş bırakabilir

## Aşama 9: Türkçe Karakter Desteği Genişletildi

- İsim ve soyisim validasyonunda eksik Türkçe karakterler eklendi
- Yeni regex: `/^[a-zA-ZğüşöçıİĞÜŞÖÇI\s]+$/`
- Artık tüm Türkçe karakterler destekleniyor (ı, İ, I dahil)

## Aşama 10: Kayıt Verilerinin Profilde Görünmesi

**Sorun:** Kayıt sırasında girilen biyografi, profil fotoğrafı, üniversite ve bölüm bilgileri profilde görünmüyordu.

**Çözüm:**
- Backend'de `registerUser` fonksiyonu `bio`, `profilePhoto`, `university`, `department` alanlarını kaydediyor
- Backend response'a tüm kullanıcı bilgileri eklendi
- Frontend'de `authService.register()` fonksiyonu tüm alanları AuthContext'e aktarıyor
- Swagger dokümantasyonu güncellendi

**Sonuç:** Artık kayıt sırasında girilen tüm bilgiler (üniversite, bölüm, biyografi, profil fotoğrafı) profilde görünüyor.

## Aşama 11: Network Hatası Çözümü (Emulator/Simulator)

**Sorun:** Android emulator'de "Network request failed" hatası alınıyordu.

**Neden:** Android emulator `localhost`'a erişemez, özel IP adresi gerekir.

**Çözüm:**
- `config/api.ts` dosyası oluşturuldu (platform bazlı otomatik URL seçimi)
- Android Emulator: `http://10.0.2.2:3001/api`
- iOS Simulator: `http://localhost:3001/api`
- Fiziksel telefon için manuel IP ayarı desteği
- `authService` artık `config/api.ts`'den API_URL'i import ediyor

## Aşama 12: Oyun Oluşturma Sistemi (Veritabanı Tabanlı)

**Mimari Kararlar:**
- Oyun tipleri veritabanında tutulacak (frontend cache ile)
- Form verileri AsyncStorage'da taslak olarak kaydedilecek (veritabanına yük yok)
- Son adımda tek seferde backend'e gönderilecek
- Dinamik form alanları (oyun tipine göre)

**Backend:**
- `GameType` modeli: 25+ oyun tanımı (kategori, min/max oyuncu, takım sistemi, ekipman, mekan tipi, ücret beklentisi)
- `GameSession` modeli: Kullanıcı oyun ilanları (taslak/yayında/iptal/tamamlandı durumları)
- `gameController.ts`: Oyun tipleri ve oturum yönetimi
- `gameRoutes.ts`: API endpoints ve Swagger dokümantasyonu
- Seed script: 25 oyun tipi otomatik ekleme (`npm run seed:games`)

**Frontend - Servisler:**
- `gameService.ts`: Oyun tipleri cache, taslak yönetimi, oyun oturumu CRUD
- AsyncStorage ile oyun tipleri cache (ilk yükleme sonrası offline çalışır)
- AsyncStorage ile taslak kaydetme (veritabanına yük olmadan)

**Frontend - Yeni 6 Adımlı Form:**
1. **Oyun Seçimi** (`NewGameTypeStep`): Veritabanından çekilen dinamik oyun listesi, kategorilere göre gruplandırılmış
2. **Açıklama** (`TitleDescriptionStep`): Başlık, açıklama, etiketler (#Eğlencesine, #İddialı, vb.)
3. **Konum ve Zaman** (`LocationTimeStep`): Şehir, ilçe, mekan, ödeme tipi, tarih/saat, tahmini süre
4. **Ekip** (`TeamPlayersStep`): Dinamik alanlar - oyuncu sayısı, takım sistemi (sadece takım oyunlarında), yetenek seviyesi, ekipman (sadece gerekiyorsa)
5. **Oyuncu Kriterleri** (`PlayerCriteriaStep`): Cinsiyet tercihi (herkes, kızlar, erkekler, karma)
6. **Özet** (`NewSummaryStep`): Tüm bilgilerin görüntülenmesi ve yayınlama

**Dinamik Mantık:**
- Satranç: Takım sistemi gizli, ekipman sorusu yok
- Basketbol: Takım sistemi gösteriliyor, ekipman sorusu yok
- Monopoly: Takım sistemi gizli, ekipman sorusu gösteriliyor
- Halısaha: Ödeme tipi soruluyor (ücretli oyun)

**Özellikler:**
- Her adımda otomatik taslak kaydediliyor (AsyncStorage)
- Uygulama kapansa bile kaldığı yerden devam edilebilir
- Geri/ileri navigasyon tam destekli
- Son adımda tek HTTP isteği ile yayınlanıyor
- Yayınlanan oyunlar "open" statüsünde listeleniyor

**Dosyalar:**
- `MP_docs/oyun_listesi.md`: 25 oyun detaylı özellikleri ve veritabanı yapısı
- `MP_backend/src/models/GameType.ts`
- `MP_backend/src/models/GameSession.ts`
- `MP_backend/src/controllers/gameController.ts`
- `MP_backend/src/routes/gameRoutes.ts`
- `MP_backend/src/scripts/seedGameTypes.ts`
- `MP_frontend/expo-client-main/services/gameService.ts`
- `MP_frontend/expo-client-main/components/create-game/*.tsx` (6 yeni component)
- `MP_frontend/expo-client-main/app/(tabs)/create.tsx` (tamamen yeniden yazıldı)

## Aşama 13: MockData Temizliği - Tam API Entegrasyonu

**Karar**: Tüm mock veriler kaldırıldı, gerçek API'ye tamamen geçildi.

**Güncellenen Servisler:**

1. **gameService.ts**: Tamamen gerçek API
   - `fetchGameTypes()`: Backend + AsyncStorage cache
   - `fetchGameSessions()`: Backend'den oyun listesi
   - `gameService.getGames()`: Filtreleme + format dönüşümü
   - mockData kullanımı tamamen kaldırıldı

2. **statisticsService.ts**: Tamamen gerçek API
   - `getHomeStatistics()`: Backend'den hesaplanan gerçek istatistikler
   - Aktif oyunlar, bugünkü oyunlar, popüler sporlar

3. **gameRequestService.ts**: Geçici boş veriler
   - Backend API'si henüz yok (gelecekte eklenecek)
   - Boş array/null döner (uygulama çökmez)

4. **waitlistService.ts**: Geçici boş veriler
   - Backend API'si henüz yok
   - Boş array döner

5. **notificationService.ts**: Geçici boş veriler
   - Backend API'si henüz yok
   - Boş array döner

**Sonuç:**
- ✅ Oyun oluşturma tamamen çalışıyor
- ✅ Oyun listeleme tamamen çalışıyor
- ✅ İstatistikler gerçek verilerle çalışıyor
- ✅ Filtreler (bugün, yarın, hafta, anlık) çalışıyor
- ⏳ Katılım isteği, waitlist, bildirimler gelecekte eklenecek

**Dokümantasyon**: `MP_docs/api_gecisi_tamamlandi.md`

## Aşama 14: Oyun Oluşturma UX İyileştirmeleri (22 Aralık 2025)

**Oyun Seçimi (Adım 1):**
- Kategori ve oyun sıralaması düzenlendi (Masa & Taş, Spor, Beceri, Kart)
- Oyunların altındaki kişi sayısı bilgisi kaldırıldı (kullanıcı özgürlüğü)
- Uno, kart oyunları kategorisine taşındı

**Açıklama (Adım 2):**
- Başlık limiti: 60 → 40 karakter
- Açıklama limiti: 300 → 200 karakter
- Etiket limiti kaldırıldı (sınırsız etiket)

**Konum & Zaman (Adım 3):**
- Ödeme sistemi tamamen yenilendi: "Bu oyun ücretli" toggle + kişi başı ücret input
- Özel tarih/saat seçici: Takvim görünümü, 3 ay ileri limit, 06:00-00:00 saat aralığı
- Oyun süresi: Ok butonlarıyla 15-30-45-60-90-120 dk seçimi
- "Oyun Süresi Belirsiz" seçeneği eklendi

**Ekip (Adım 4):**
- Oyuncu sayısı limitleri: Min 2, Max 30 (tüm oyunlar için standart)
- Ok butonlarıyla sayı seçimi, "kişi" kelimesi kaldırıldı
- Takım planlama modal'ı: Kaydet/İptal butonları, varsayılan A-B takımı, takım ekleme/düzenleme
- Ekipman sorusu netleştirildi: "Ekipmanım var/yok" seçenekleri

**Özet Sayfası:**
- Ücret gösterimi: "Ücretsiz" veya "X TL (Kişi başı)"
- Takım bilgisi: "Takım Sayısı: X takım" veya boş

## Aşama 15: Profil - Planladığım Oyunlar Sistemi (22 Aralık 2025)

**Backend:**
- `GET /api/games/sessions/my`: Kullanıcının kendi oyunlarını listele (korumalı endpoint)
- `PUT /api/games/sessions/:id`: Oyun güncelleme (sadece başlık, açıklama, ihtiyaç duyulan oyuncu)
- `DELETE /api/games/sessions/:id`: Oyun iptal etme (sadece oluşturan)
- `GET /api/games/statistics`: Ana sayfa istatistikleri
- `GameSession` model'ine `toJSON` transform eklendi (gameType otomatik populate)

**Frontend:**
- **Profil → Planladığım Oyunlar** menüsü eklendi
- `/my/games`: Oyun listesi sayfası (tarih, süre, oyuncu sayısı, konum, ücret)
- `/my/games/[id]`: Oyun detay ve düzenleme sayfası
- Düzenlenebilir alanlar: Başlık (40), Açıklama (200), İhtiyaç duyulan oyuncu sayısı
- Görüntülenen bilgiler: Oyun tipi, tarih, süre, toplam oyuncu, konum, yetenek seviyesi, ücret
- Silme özelliği: Onay dialogu ile oyun iptali
- Pull-to-refresh: Oyun listesini yenileme

**Servis İyileştirmeleri:**
- `fetchMyGameSessions()`: Kullanıcının oyunları
- `fetchGameSession()`: Tek oyun detayı
- `updateGameSession()`: Oyun güncelleme
- `deleteGameSession()`: Oyun silme
- URL düzeltmeleri: `/api/games` → `/games` (API_URL zaten /api içeriyor)

**Hata Düzeltmeleri:**
- Geçersiz oyun tipi hatası: gameType objesi backend'e gönderilmemeli, sadece gameTypeId
- Cache yenileme: fetchGameTypes(forceRefresh=true) ile eski ID'ler temizleniyor
- Eski draft kontrolü: Geçersiz gameTypeId varsa otomatik temizleniyor
- Port kullanım hatası: Process ID ile otomatik temizleme
- Model transform hatası: TypeScript tip tanımı düzeltildi (doc: any, ret: any)

**Veritabanı:**
- Oyun tipleri seed script çalıştırıldı: 23 oyun başarıyla eklendi
- MongoDB bağlantısı stabil