## MatchPlay Ürün Gereksinim Dokümanı (PRD)

**Versiyon:** 1.0
**Tarih:** 27.10.2025

---

### 1. Giriş ve Vizyon

**1.1. Problem**
Üniversite öğrencileri, ders yoğunluğu ve farklı sosyal çevreler nedeniyle kampüs hayatında basketbol, masa tenisi, voleybol gibi fiziksel oyunlar veya kutu oyunları için ekip arkadaşı bulmakta zorlanmaktadır. Anlık gelişen oyun oynama istekleri genellikle organize olunamadığı için sonuçsuz kalmaktadır.

**1.2. Çözüm ve Vizyon**
MatchPlay, üniversite öğrencilerinin konum ve zaman bazlı olarak oyun kurmasını, mevcut oyunlara katılmasını ve güvenilir yeni oyun arkadaşları edinmesini sağlayan bir mobil uygulamadır. Vizyonumuz, üniversite kampüslerindeki sosyal ve fiziksel etkileşimi artırarak öğrencilerin daha aktif ve sosyal bir üniversite hayatı yaşamasını sağlamaktır. Platform, sadece `.edu` uzantılı e-posta adresleriyle kayıt kabul ederek güvenli bir topluluk ortamı oluşturur.

---

### 2. Hedef Kitle ve Personalar

**2.1. Hedef Kitle**
- Türkiye'deki üniversitelerde okuyan, aktif `.edu` uzantılı e-posta adresine sahip lisans ve lisansüstü öğrencileri.

**2.2. Kullanıcı Personaları**
- **Organizatör Ozan (21, Bilgisayar Müh.):** Sosyal ve dışa dönük. Sık sık halı saha veya basketbol maçı organize etmeye çalışır ama her zaman yeterli kişiyi toplayamaz. WhatsApp gruplarında kaybolan mesajlardan ve son dakika iptallerinden bıkmıştır.
- **Katılımcı Zeynep (19, Tıp Fak.):** Kampüse yeni gelmiş, sosyal çevresini genişletmek istiyor. Voleybol oynamayı seviyor ancak kimi, nerede bulacağını bilmiyor. Güvenilir ve kendi gibi öğrenci olan insanlarla tanışmak istiyor.
- **Spontane Emre (22, İşletme):** Ders aralarında veya gün içinde boş vakti olduğunda hızlıca bir aktiviteye katılmak istiyor. Uzun planlar yapmak yerine, "şimdi yakınlarda ne var?" diye merak eden, anlık fırsatları değerlendirmeyi seven bir karakter.

---

### 3. Stratejik Hedefler ve Başarı Kriterleri

**3.1. İş Hedefleri**
- Üniversite öğrencileri için 1 numaralı oyun bulma platformu olmak.
- Aktif kullanıcı tabanını ilk 6 ayda X kampüsünde Y kullanıcıya ulaştırmak.
- Kullanıcıların platformda haftada ortalama en az bir oyun oluşturmasını veya bir oyuna katılmasını sağlamak.

**3.2. Başarı Kriterleri (KPIs)**
- **Aktivasyon:** Kayıt olan kullanıcıların profil tamamlama oranı (%90+).
- **Etkileşim:** Günlük/Aylık Aktif Kullanıcı (DAU/MAU) sayısı, oluşturulan oyun sayısı, gönderilen katılım isteği sayısı.
- **Elde Tutma (Retention):** 1-7-30 günlük kullanıcı geri dönüş oranları.
- **Memnuniyet:** Ortalama oyun puanı (4+/5), uygulama mağazası puanı (4.5+/5).

---

### 4. Özellikler ve Gereksinimler

**4.1. Temel Kullanıcı Akışları**

**4.1.1. Kayıt ve Profil Yönetimi (Onboarding)**
- **Gereksinimler:**
  - Sadece `.edu` uzantılı e-posta ile kayıt.
  - E-posta doğrulama linki ile hesap aktivasyonu.
  - **Zorunlu Profil Bilgileri:** Ad-Soyad, profil fotoğrafı, üniversite, bölüm.
  - **İsteğe Bağlı Bilgiler:** Oynadığı oyunlar, kendini tanıtan kısa bir bio, oyun yetenek seviyesi (Başlangıç, Orta, İleri).
  - Profil sayfası; kullanıcının ortalama puanını, katıldığı oyun sayısını ve aldığı yorumları gösterir.

**4.1.2. Oyun Kurma**
- **Gereksinimler:**
  - **Oyun Tipi:** Listeden spor/oyun dalı seçimi (örn: Basketbol, Futbol, Masa Tenisi, Satranç).
  - **Konum:** Harita üzerinden mekan seçimi veya manuel adres girişi (İl > İlçe > Mekan).
  - **Tarih ve Saat:** Net başlangıç ve bitiş saati.
  - **Oyuncu Sayısı:** Gerekli toplam oyuncu sayısı (kontenjan).
  - **Açıklama:** Oyun kuralları, ekipman durumu veya diğer notlar için bir alan.
  - **Yeni Fikir: Oyun Seviyesi:** Oyun için beklenen yetenek seviyesi (Herkes, Rekabetçi vb.) belirtilebilir. Bu, doğru oyuncuların eşleşmesini kolaylaştırır.

**4.1.3. Oyun Keşfetme ve Filtreleme**
- **Gereksinimler:**
  - **Ana Akış (Oyun Bul):** Varsayılan olarak kullanıcının 2 km çevresindeki ve o gün içinde başlayacak oyunları listeler.
  - **Anlık Akış (Yakınımdakiler):** Sadece 1 km yarıçapında ve önümüzdeki 2 saat içinde başlayacak oyunları gösteren, spontane katılımı teşvik eden özel bir sekme/filtre.
  - **Filtreleme Seçenekleri:** Oyun türü, mesafe, tarih aralığı, oyun seviyesi.
  - **Harita Görünümü:** Oyunları liste olarak değil, harita üzerinde pin'ler olarak görme seçeneği.

**4.1.4. Katılım ve Onay Süreci**
- **Gereksinimler:**
  - Kullanıcı, ilana "Katılma İsteği Gönder" butonu ile başvurur.
  - Oyun kurucusu, istek gönderen kullanıcının profilini (puanı, oynadığı oyun sayısı vb.) inceleyebilir.
  - Kurucu isteği kabul eder veya reddeder. Her iki durumda da adaya anlık bildirim gider.
  - Kontenjan dolduğunda ilan otomatik olarak yeni isteklere kapanır.
  - **Yeni Fikir: Bekleme Listesi (Waitlist):** Kontenjan dolsa bile kullanıcılar bekleme listesine girebilir. Bir yer boşalırsa listedeki ilk kişiye bildirim gider ve katılma hakkı tanınır.

**4.1.5. İletişim (Oyun Lobisi)**
- **Gereksinimler:**
  - Bir oyuncunun katılım talebi kabul edildiğinde, o oyuna özel geçici bir sohbet grubu otomatik olarak oluşturulur.
  - Sadece onaylanmış katılımcılar ve oyun kurucusu bu sohbette yer alır.
  - Maç öncesi son detayların (örn: "Beyaz tişört giyin", "5 dakika gecikeceğim") konuşulması için kullanılır.
  - Oyunun bitiş saatinden bir süre sonra sohbet arşive kaldırılır veya salt okunur hale gelir.

**4.1.6. Oyun Sonrası ve Değerlendirme Sistemi**
- **Gereksinimler:**
  - Oyun bittikten sonra tüm katılımcılara "Oyunu Değerlendir" bildirimi gönderilir.
  - Katılımcılar birbirlerine 1-5 yıldız arası puan verir.
  - **Değerlendirme Kriterleri:** "Dakiklik", "Sportmenlik", "İletişim" gibi etiketler seçilebilir.
  - Yapılan puanlama ve yorumlar, kullanıcıların profillerinde birikir ve genel "Güven Puanı"nı oluşturur.

**4.2. Güvenlik ve Moderasyon**

- **Kullanıcı Şikayet Etme:** Oyuncular, oyun sırasında veya sonrasında uygunsuz davranış sergileyen bir kullanıcıyı kanıt (sohbet ekran görüntüsü vb.) ile birlikte şikayet edebilir.
- **Kullanıcı Engelleme:** Kullanıcılar, bir daha aynı ortamda bulunmak istemedikleri kişileri engelleyebilir. Engellenen kullanıcılar birbirlerinin oyunlarını göremez.
- **Admin Paneli:** Moderatörlerin şikayetleri incelediği, kullanıcı profillerini askıya aldığı veya sildiği bir yönetim arayüzü.