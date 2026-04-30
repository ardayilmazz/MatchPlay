# Match Play Uygulaması - Stitch AI Tasarım Dokümantasyonu

> Bu doküman, Match Play mobil uygulamasının Stitch AI ile yeniden tasarlanması için hazırlanmıştır. Her sayfanın ekran görüntüsünü (SS) alıp bu dokümandaki açıklamalarla eşleştirerek Stitch'e sunabilirsiniz.

---

## 1. GENEL ÇALIŞMA MANTIĞI

### 1.1 Uygulama Nedir?
Match Play, **üniversite öğrencilerinin spor ve oyun etkinliklerine katılmasını** sağlayan bir mobil uygulamadır. Kullanıcılar:
- Kendi oyun/lobi oluşturabilir
- Başkalarının oyunlarına katılım isteği gönderebilir
- Bekleme listesine eklenebilir
- Oyun sonrası diğer katılımcıları değerlendirebilir (1-5 yıldız)
- Şikayet bildirebilir

### 1.2 Teknik Altyapı
- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **Veritabanı:** MongoDB
- **Dil:** Türkçe arayüz

### 1.3 Ana Akış Diyagramı

```
[Uygulama Açılışı]
       │
       ├── Giriş yapmamış → Hoş Geldin → Giriş / Kayıt
       ├── Kayıt tamamlanmamış → Onboarding (Ad, Üniversite vb.)
       └── Giriş yapmış → Ana Sayfa (Tab Bar)
                              │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    [Ana Sayfa]          [Keşfet]              [Oluştur]
    Oyun listesi         Filtreli arama        Yeni oyun oluştur
         │                     │                     │
         └──────────┬──────────┘                     │
                    │                               │
              [Oyun Detayı] ←───────────────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
   Katılma İsteği  Bekleme   İstekleri Yönet
   Gönder          Listesi    (Kurucu)
```

### 1.4 Tab Bar (Alt Menü)
Uygulama 5 ana sekmeye sahiptir:
| Sekme | İkon | Sayfa | Açıklama |
|-------|------|-------|----------|
| Ana Sayfa | Home | `/(tabs)/home` | Özet istatistikler + oyun listesi |
| Keşfet | Search | `/(tabs)/discover` | Filtreli oyun arama |
| Oluştur | PlusCircle | `/(tabs)/create` | Yeni oyun oluşturma (3 adım) |
| Bildirimler | Bell | `/(tabs)/notifications` | Tüm bildirimler |
| Profil | User | `/(tabs)/profile` | Kullanıcı profili + menü |

---

## 2. SAYFA SAYFA DETAYLI AÇIKLAMALAR

---

### 2.1 HOŞ GELDİN (Welcome) - `/auth/welcome`

**SS Referansı:** `auth_welcome.png`

**Amaç:** Giriş yapmamış kullanıcıya ilk karşılama ekranı.

#### Öğeler:

| Öğe | Tip | Metin/Değer | İşlev |
|-----|-----|-------------|-------|
| Logo alanı | Görsel | "MatchPlay" yazısı | Uygulama logosu (120x120, yuvarlak) |
| Başlık | Metin | "Oyun Arkadaşını Bul" | Ana slogan |
| Alt başlık | Metin | "Üniversitende spor ve oyun etkinliklerine katıl, yeni arkadaşlar edin" | Açıklama |
| **Giriş Yap** | Buton (primary) | "Giriş Yap" | → `/auth/login` |
| **Kayıt Ol** | Buton (outline) | "Kayıt Ol" | → `/auth/register` |

#### Bağlantılar:
- **Giriş Yap** → Giriş sayfası
- **Kayıt Ol** → Kayıt sayfası (7 adımlı süreç)

---

### 2.2 GİRİŞ (Login) - `/auth/login`

**SS Referansı:** `auth_login.png`

**Amaç:** E-posta ve şifre ile giriş.

#### Öğeler:

| Öğe | Tip | Placeholder/Label | İşlev |
|-----|-----|------------------|-------|
| Geri | Buton (ikon) | ChevronLeft | Önceki sayfaya dön |
| Başlık | Metin | "Hoş Geldin" | |
| Alt başlık | Metin | "Hesabına giriş yap" | |
| **E-posta** | Input | "ornek@universite.edu" | Sadece .edu veya .edu.tr uzantılı |
| **Şifre** | Input (şifre) | "Şifrenizi girin" | Gizli |
| **Şifremi Unuttum** | Link | "Şifremi Unuttum" | → `/auth/forgot-password` |
| **Giriş Yap** | Buton | "Giriş Yap" | Giriş işlemi → Ana sayfa |
| Footer | Metin | "Hesabın yok mu? **Kayıt Ol**" | Kayıt Ol tıklanabilir → `/auth/register` |

#### Bağlantılar:
- Başarılı giriş → Index (yönlendirme) → Ana sayfa veya Onboarding
- **Şifremi Unuttum** → Şifre sıfırlama
- **Kayıt Ol** → Kayıt sayfası

---

### 2.3 KAYIT (Register) - `/auth/register`

**SS Referansı:** `auth_register.png` (7 adım - her adım ayrı SS alınabilir)

**Amaç:** Yeni kullanıcı kaydı. 7 adımlı wizard.

#### Adımlar ve Öğeler:

**Adım 1 - E-posta Girişi (EMAIL_ENTRY):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| E-posta | Input | ornek@universite.edu |
| Doğrulama Kodu Gönder | Buton | E-postaya 6 haneli kod gönderir |

**Adım 2 - Kod Doğrulama (EMAIL_VERIFY):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Bilgi metni | Metin | "{email} adresine gönderilen 6 haneli kodu girin" |
| Doğrulama Kodu | Input | 6 hane, number-pad |
| E-postayı Onayla | Buton | Kodu doğrular |
| Tekrar Kod Gönder | Link | 30 sn cooldown ile |

**Adım 3 - Şifre (PASSWORD_ENTRY):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Şifre | Input (şifre) | En az 6 karakter |
| Şifre Tekrar | Input (şifre) | |
| Devam Et | Buton | |

**Adım 4 - Kişisel Bilgiler (USER_INFO):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Ad | Input | Sadece harf |
| Soyad | Input | Sadece harf |
| Doğum Tarihi | DatePicker | 17+ yaş zorunlu |
| Devam Et | Buton | |

**Adım 5 - Üniversite (UNIVERSITY_INFO):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Üniversite | Picker (arama) | Zorunlu, listeden seçim |
| Bölüm | Picker (arama) | İsteğe bağlı |
| Devam Et | Buton | |

**Adım 6 - Profil Fotoğrafı (PROFILE_PHOTO):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Fotoğraf alanı | 120x120 yuvarlak | Tıklanınca galeri açılır |
| Devam Et | Buton | |
| Şimdilik Atla | Link | |

**Adım 7 - Biyografi (BIO):**
| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Biyografi | Input (multiline) | Max 50 karakter, isteğe bağlı |
| Kaydı Tamamla | Buton | |
| Atla ve Bitir | Link | |

**Ortak:** Geri butonu, "Zaten hesabın var mı? Giriş Yap" footer

#### Bağlantılar:
- Kayıt tamamlanınca → `/(tabs)/home`
- **Giriş Yap** → `/auth/login`

---

### 2.4 ONBOARDING - TEMEL BİLGİLER - `/onboarding/basic-info`

**SS Referansı:** `onboarding_basic_info.png`

**Amaç:** Giriş yapmış ama profili eksik kullanıcıyı tamamlama (ad, soyad, üniversite, bölüm, profil fotoğrafı).

#### Öğeler:
- Ad, Soyad, Üniversite (Picker), Bölüm (Picker), Profil fotoğrafı (galeri)
- **Kaydet** butonu → Ana sayfa

---

### 2.5 ANA SAYFA (Home) - `/(tabs)/home`

**SS Referansı:** `home.png`

**Amaç:** Özet istatistikler, anlık oyunlar, hızlı filtreler ve oyun listesi.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Ana Sayfa" |
| Alt başlık | Metin | "MatchPlay'e hoş geldiniz!" |
| **İstatistik Kartları** (2x2 grid) | Kart | Aktif Oyun, Bugün, Yakınımda, Popüler |
| **Popüler Sporlar** | Liste | Her spor için "X oyun" badge |
| **Anlık Oyunlar** | Yatay liste | 2 saat içinde başlayan oyunlar (GameCard) |
| **Hızlı Filtreler** | Chip grubu | Bugün, Yarın, Bu Hafta, Yakınımda, Anlık |
| **Oyun Listesi Başlığı** | Metin | "Bugünkü Oyunlar" (filtreye göre değişir) |
| **Tümünü Gör** | Link | → Keşfet sayfası |
| **GameCard** (liste) | Kart | Her oyun: başlık, spor, tarih, saat, konum, X/Y oyuncu, ücret |
| **Yeni Oyun Oluştur** | Buton | Oyun yoksa gösterilir → Oluştur |
| **X Oyun Daha Göster** | Buton | 5'ten fazla oyun varsa → Keşfet |

**GameCard içeriği:**
- Başlık / Spor adı
- Durum badge (Açık/Dolu/Tamamlandı)
- Tarih, Saat aralığı
- Mekan adı, İlçe
- Oyuncu sayısı (X/Y)
- Yetenek seviyesi
- Ücret (Ücretsiz veya X TL)

**Pull-to-refresh:** Liste yenileme

#### Bağlantılar:
- GameCard tıklama → `/game/[id]`
- **Tümünü Gör** → `/(tabs)/discover`
- **Yeni Oyun Oluştur** → `/(tabs)/create`

---

### 2.6 KEŞFET (Discover) - `/(tabs)/discover`

**SS Referansı:** `discover.png`

**Amaç:** Filtreli oyun arama.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Keşfet" |
| **Filtre Butonu** | Buton (SlidersHorizontal ikon) | Badge: aktif filtre sayısı |
| Sonuç sayısı | Metin | "X oyun bulundu" |
| **GameCard Listesi** | FlatList | Filtrelenmiş oyunlar |
| **Filtreleri Sıfırla** | Buton | Boş liste durumunda |

**GameFiltersModal (Filtre butonuna tıklanınca açılan modal):**

| Bölüm | Öğeler |
|-------|--------|
| Lobi Başlığı Ara | TextInput: "Lobi başlığı ara..." |
| Oyun Türü | Kategoriler: Masa & Taş, Spor, Beceri, Kart → Alt oyunlar chip olarak |
| Konum ve Zaman | Mekan ara (TextInput) VEYA Mesafe: 2km, 5km, 10km, 20km |
| Tarih Aralığı | Başlangıç / Bitiş tarih seçici (takvim) |
| Doluluk | Toggle: "Sadece yer olan oyunları göster" |
| Cinsiyet Tercihi | Chip: Herkes, Sadece Kızlar, Sadece Erkekler, Karma |
| Yetenek Seviyesi | Chip: İlk Defa, Az Bilenler, Orta, İyi, Profesyonel |
| Ücret | Chip: Tümü, Ücretsiz, Ücretli |
| **Sıfırla** | Buton | Varsayılana dön |
| **Uygula** | Buton | Filtreleri uygula, modal kapat |

#### Bağlantılar:
- GameCard tıklama → `/game/[id]`

---

### 2.7 OLUŞTUR (Create) - `/(tabs)/create`

**SS Referansı:** `create_step1.png`, `create_step2.png`, `create_step3.png`

**Amaç:** 3 adımlı oyun oluşturma.

#### Adım Göstergesi (StepIndicator):
- Oyun | Ekip | Özet (3 nokta, aktif olan vurgulu)

#### ADIM 1 - OYUN:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Geri | Buton | Önceki adım (adım 0'da yok) |
| Oyun Seç* | Touchable | Modal: Kategoriler → Oyun türü seçimi |
| Konum ve Zaman* | Touchable | Modal: Şehir → İlçe → Mekan + Tarih + Saat |
| Ücret | Touchable | Modal: 0 veya X TL |
| Süre | Touchable | Modal: Dakika seçimi |
| Başlık ve Açıklama | Touchable | Modal: Başlık, Açıklama, Etiketler |
| **İleri** | Buton | Adım 2'ye geç (Oyun + Konum + Tarih zorunlu) |

#### ADIM 2 - EKİP:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Oyuncular* | Touchable | Modal: Toplam oyuncu, İhtiyaç duyulan, Otomatik iptal toggle |
| Yetenek Seviyesi | Touchable | Modal: İlk Defa, Az Bilenler, Orta, İyi, Profesyonel |
| Cinsiyet Tercihi | Touchable | Modal: Herkes, Kızlar, Erkekler, Karma |
| **İleri** | Buton | Adım 3'e geç |

#### ADIM 3 - ÖZET:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Özet kartı | Metin | Tüm girilen bilgilerin özeti |
| **Geri** | Buton | Adım 2'ye |
| **Yayınla** | Buton | Oyunu oluştur → Ana sayfa |

#### Bağlantılar:
- Yayınlama başarılı → `/(tabs)/home`

---

### 2.8 BİLDİRİMLER (Notifications) - `/(tabs)/notifications`

**SS Referansı:** `notifications.png`

**Amaç:** Tüm bildirimleri listeleme ve işleme.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Bildirimler" |
| Okunmamış badge | Badge | Okunmamış sayısı (kırmızı) |
| **Tümünü Okundu İşaretle** | Buton | Tüm okunmamışları işaretle |
| **Tümünü Sil** | Buton | Onay modalı ile sil |
| **Bildirim Kartı** (liste) | Kart | İkon + Başlık + Mesaj + Zaman |

**Bildirim tipleri (ikon ve renk farklı):**
- join_request_received: Katılım isteği alındı
- join_request_accepted: İstek kabul edildi
- join_request_rejected: İstek reddedildi
- cancellation_vote_request: İptal oylaması
- game_cancelled: Oyun iptal
- game_reminder: Oyun hatırlatması
- waitlist_slot_available: Bekleme listesinde yer açıldı
- rating_pending: Oylama bekliyor

**Bildirim tıklama davranışı:**
- Katılım isteği → JoinRequestModal (Kabul/Red)
- İptal oylaması → `/vote/[id]`
- Oylama bekliyor → `/rating/[gameId]`
- Diğerleri → `/game/[id]`

**Boş durum:** "Bildirim Yok" metni + ikon

#### Bağlantılar:
- Bildirim türüne göre → Oyun detay, Oylama, Rating, JoinRequestModal

---

### 2.9 PROFİL (Profile) - `/(tabs)/profile`

**SS Referansı:** `profile.png`

**Amaç:** Kullanıcı bilgileri ve menü.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Profil" |
| **Ayarlar** | Buton (ikon) | → Ayarlar sayfası |
| Avatar | Görsel | 120x120, yoksa baş harf |
| Ad Soyad | Metin | |
| E-posta | Metin | |
| **Yıldız puanı** | Badge | Ortalama rating (örn. 4.5) |
| **Puan** | Badge | Kullanıcı puanı |
| Üniversite | Info kartı | |
| Bölüm | Info kartı | |
| Hakkımda | Info kartı | Bio |
| İlgi Alanları | Tag listesi | Sporlar |
| **Profili Düzenle** | Buton | → `/profile/edit` |
| **Kullanıcı Yorumları** | Menü öğesi | → `/my/ratings` |
| **Planladığım Oyunlar** | Menü öğesi | → `/my/games` |
| **Katıldığım Oyunlar** | Menü öğesi | → `/my/joined-games` |
| **İstek Geçmişi** | Menü öğesi | → `/my/requests` |
| **Bekleme Listesi** | Menü öğesi | → `/my/waitlist` |
| **Geçmiş Oyunlar** | Menü öğesi | → `/my/completed-games` |
| **Şikayetlerim** | Menü öğesi | → `/my/complaints` |

#### Bağlantılar:
- Her menü öğesi ilgili `/my/*` sayfasına gider.

---

### 2.10 AYARLAR (Settings) - `/(tabs)/settings`

**SS Referansı:** `settings.png`

**Amaç:** Tema ve çıkış.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Ayarlar" |
| **Koyu Mod** | Switch | Açık/kapalı |
| **Çıkış Yap** | Buton (kırmızı) | Modal: "Emin misiniz?" → Evet/İptal |

**Çıkış Modalı:**
- Başlık: "Çıkış Yap"
- Mesaj: "Çıkış yapmak istediğinize emin misiniz?"
- İptal, Evet butonları

#### Bağlantılar:
- Çıkış onayı → `/auth/welcome`

---

### 2.11 OYUN DETAYI (Game Detail) - `/game/[id]`

**SS Referansı:** `game_detail.png`

**Amaç:** Oyun bilgileri ve aksiyonlar (katılma, bekleme listesi, istek yönetimi).

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Geri | Buton | Önceki sayfa |
| Başlık | Metin | "Oyun Detayı" |
| Spor adı | Metin | |
| Durum badge | Badge | Açık (yeşil) / Dolu (kırmızı) / Tamamlandı |
| Tarih | Metin | Örn. "15 Mart 2025" |
| Saat | Metin | "14:00 - 16:00" |
| Mekan | Metin | Mekan adı + adres + ilçe + şehir |
| Oyuncu sayısı | Metin | "X/Y Oyuncu" |
| Yetenek seviyesi | Metin | Herkes, Başlangıç, Orta, İleri, Rekabetçi |
| Açıklama | Metin | Varsa |
| **Oyun Kurucu Bilgileri** | Buton | CreatorProfileModal (kurucu değilse) |
| **Aksiyon Butonu** | Dinamik | Duruma göre değişir |

**Aksiyon Butonu (rol ve duruma göre):**

| Durum | Buton |
|-------|-------|
| Kurucu | "İstekleri Yönet" → `/my/games/[id]/requests` |
| Katılımcı | "Buluşmadan Ayrıl" (tehlike) |
| İstek bekliyor | "İsteği İptal Et" |
| İstek reddedildi | "İstek Reddedildi" (badge, tıklanamaz) |
| Bekleme listesinde (oyun açık) | "Katılma İsteği Gönder" + "Listeden Çık" |
| Bekleme listesinde (oyun dolu) | "Listeden Çık" |
| Oyun dolu | "Bekleme Listesine Katıl" |
| Oyun açık | "Katılma İsteği Gönder" |

**CreatorProfileModal:** Kurucunun adı, fotoğrafı, üniversite, bölüm, rating vb.

#### Bağlantılar:
- **İstekleri Yönet** → `/my/games/[id]/requests`
- **Oyun Kurucu Bilgileri** → Modal

---

### 2.12 İSTEK YÖNETİMİ (Game Requests) - `/my/games/[id]/requests`

**SS Referansı:** `game_requests.png`

**Amaç:** Kurucunun gelen katılım isteklerini kabul/reddetmesi.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Geri | Buton | |
| Başlık | Metin | "Katılım İstekleri" |
| **İstek Kartı** (liste) | Kart | Avatar, Ad Soyad, Yaş, Cinsiyet, Mesaj |
| **Kabul Et** | Buton (yeşil) | İsteği kabul |
| **Reddet** | Buton (kırmızı) | İsteği reddet |

**Boş durum:** "Henüz katılım isteği yok"

---

### 2.13 PLANLADIĞIM OYUNLAR - `/my/games`

**SS Referansı:** `my_games.png`

**Amaç:** Kullanıcının oluşturduğu oyunların listesi.

#### Öğeler:
- GameCard listesi (oluşturulan oyunlar)
- Tıklama → `/my/games/[id]` (kurucu görünümü)

---

### 2.14 KATILDIĞIM OYUNLAR - `/my/joined-games`

**SS Referansı:** `my_joined_games.png`

**Amaç:** Kabul edildiği oyunların listesi.

#### Öğeler:
- GameCard listesi
- Tıklama → `/my/joined-games/[id]`

---

### 2.15 İSTEK GEÇMİŞİ - `/my/requests`

**SS Referansı:** `my_requests.png`

**Amaç:** Gönderilen katılım isteklerinin durumu (beklemede, kabul, red).

---

### 2.16 BEKLEME LİSTESİ - `/my/waitlist`

**SS Referansı:** `my_waitlist.png`

**Amaç:** Bekleme listesine eklendiği oyunlar.

---

### 2.17 GEÇMİŞ OYUNLAR - `/my/completed-games`

**SS Referansı:** `my_completed_games.png`

**Amaç:** Tamamlanmış oyunlar. Oylama yapılmamışsa rating sayfasına yönlendirme.

---

### 2.18 OYUN İPTAL OYLAMASI (Vote) - `/vote/[id]`

**SS Referansı:** `vote.png`

**Amaç:** Oyun başlamadan 3 saat önce kurucu iptal isterse, katılımcıların oylaması.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Oyun İptal Oylaması" |
| Mesaj | Metin | "Katıldığınız oyunun iptal edilmesini kabul ediyor musunuz?" |
| Oylama durumu | Metin | "X / Y katılımcı oy kullandı" |
| Oyun detayları kartı | Kart | Oyun adı, türü, tarih, mekan, oyuncu sayısı |
| Organizatör kartı | Kart | Kurucu bilgisi |
| **İptal Etmeyi Onayla** | Buton (yeşil) | Onay |
| **İptal Etme** | Buton (kırmızı) | Red |
| Zaten oy kullandıysa | Kart | "Oyunuzu kullandınız" |
| Oylama tamamlandıysa | Kart | "Oyun İptal Edildi" veya "Oyun Devam Ediyor" |

#### Bağlantılar:
- Oy sonrası → Geri

---

### 2.19 OYUN SONRASI OYLAMA (Rating) - `/rating/[gameId]`

**SS Referansı:** `rating.png`

**Amaç:** Tamamlanan oyundaki katılımcıları 1-5 yıldız ile değerlendirme.

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Başlık | Metin | "Oyun Sonrası Oylama" |
| Oyun bilgisi | Metin | Oyun adı + "X kişiyi oylayabilirsiniz" |
| **Katılımcı Kartı** (liste) | Kart | Avatar, Ad Soyad, "Seç" veya "Değerlendirildi X/5" |
| **İptal** | Buton | Geri |
| **Gönder** | Buton | Oylamaları gönder |

**RatingModal (katılımcıya tıklanınca):**
- 1-5 yıldız seçimi
- Yorum (isteğe bağlı)
- **Şikayet Et** butonu → `/complaint`
- Kaydet / Kapat

#### Bağlantılar:
- **Şikayet Et** → `/complaint` (reportedId, reportedName, gameId ile)
- Gönder başarılı → Geri

---

### 2.20 ŞİKAYET ET (Complaint) - `/complaint`

**SS Referansı:** `complaint.png`

**Amaç:** Bir kullanıcıyı şikayet etme (oyun/rating bağlamında).

#### Öğeler:

| Öğe | Tip | Açıklama |
|-----|-----|----------|
| Geri | Buton | |
| Başlık | Metin | "Şikayet Et" |
| Şikayet edilecek kişi | Metin | reportedName (parametre) |
| **Şikayet Mesajı** | TextInput (multiline) | "Şikayet nedeninizi yazın...", max 1000 karakter |
| Karakter sayacı | Metin | "X/1000" |
| **İptal** | Buton | Geri |
| **Gönder** | Buton | Şikayeti gönder |

#### Bağlantılar:
- Gönder başarılı → Geri

---

### 2.21 PROFİL DÜZENLE - `/profile/edit`

**SS Referansı:** `profile_edit.png`

**Amaç:** Profil bilgilerini güncelleme.

#### Öğeler:
- Ad, Soyad
- Profil fotoğrafı (galeri)
- Üniversite, Bölüm (Picker)
- Bio
- **Kaydet** butonu

---

### 2.22 KULLANICI YORUMLARI - `/my/ratings`

**SS Referansı:** `my_ratings.png`

**Amaç:** Kullanıcıya verilen yıldız değerlendirmelerinin listesi.

---

### 2.23 ŞİKAYETLERİM - `/my/complaints`

**SS Referansı:** `my_complaints.png`

**Amaç:** Kullanıcının gönderdiği şikayetlerin listesi.

---

## 3. ORTAK BİLEŞENLER

### 3.1 GameCard
- Oyun listelerinde kullanılan standart kart
- İçerik: Başlık, spor, tarih, saat, mekan, oyuncu sayısı, yetenek, ücret, durum badge

### 3.2 Input
- Label, placeholder, error mesajı
- Şifre alanları için isPassword

### 3.3 Button
- variant: primary, secondary, outline, danger
- loading state
- leftIcon

### 3.4 Picker
- Arama destekli dropdown
- options: { label, value }[]

### 3.5 Modal'lar
- CreatorProfileModal
- JoinRequestModal (Kabul/Red)
- RatingModal (1-5 yıldız, yorum, şikayet)
- GameFiltersModal
- Oyun oluşturma adımlarındaki tüm seçim modal'ları

---

## 4. RENK VE TEMA

- **Primary:** Ana renk (butonlar, vurgular)
- **Secondary:** İkincil vurgu
- **Success:** Başarı, onay (yeşil)
- **Error:** Hata, red, tehlike (kırmızı)
- **Neutral:** Arka plan, metin tonları
- **Koyu Mod:** Ayarlardan açılır

---

## 5. STITCH İÇİN ÖNERİLER

1. Her sayfa için ayrı SS alın ve bu dokümandaki sayfa numarasıyla eşleştirin.
2. Modal'lar için ayrı SS alın (özellikle GameFiltersModal, JoinRequestModal, RatingModal).
3. Oyun oluşturma 3 adımının her biri için SS alın.
4. Boş durumlar (liste boş, bildirim yok vb.) için de SS alın.
5. Farklı rollerde (kurucu, katılımcı, bekleme listesinde) Oyun Detayı sayfasının SS'lerini alın.
6. Koyu mod açıkken de birkaç ana sayfa SS'i alın.

---

*Bu doküman Match Play V1.0 kod tabanına dayanarak oluşturulmuştur. Güncellemeler için proje yapısı referans alınmalıdır.*
