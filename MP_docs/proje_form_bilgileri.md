## MatchPlay Projesi Form Bilgileri

### 1. Uygulamayı Tanıtan Özet

MatchPlay, üniversite öğrencilerinin kampüs hayatında spor, masa oyunları veya çeşitli fiziksel aktiviteler için kolayca ekip arkadaşı bulmalarını sağlayan bir mobil uygulamadır. Öğrencilerin ders yoğunluğu ve farklı sosyal çevreler nedeniyle anlık gelişen oyun oynama isteklerini organize edememe problemini çözer. Sadece `.edu` uzantılı e-posta adresleri ile kayıt olunabilen platform, güvenli bir topluluk ortamı yaratarak öğrencilerin konum ve zaman bazlı oyunlar kurmasına veya mevcut oyunlara katılmasına olanak tanır.

### 2. Uygulamanın Amacı

Uygulamanın temel amacı, üniversite kampüslerindeki sosyal ve fiziksel etkileşimi artırmaktır. MatchPlay, öğrencilerin daha aktif ve sosyal bir üniversite hayatı yaşamasını hedefler. Bu doğrultuda, platformun amaçları şunlardır:
*   Öğrencilerin ortak ilgi alanlarına sahip yeni arkadaşlar edinmesini kolaylaştırmak.
*   Spontane veya planlı oyun aktiviteleri için organizasyon sürecini basitleştirmek.
*   Güvenilir bir puanlama ve değerlendirme sistemi ile güvenli bir topluluk oluşturmak.
*   Öğrencilerin boş zamanlarını daha verimli ve keyifli geçirmelerine yardımcı olmak.

### 3. Uygulamanın Kapsamı

MatchPlay uygulamasının kapsamı, bir oyun etkinliğinin başından sonuna kadar tüm süreci yönetmeyi içerir:
*   **Kayıt ve Profil Yönetimi:** Sadece `.edu` uzantılı e-posta ile güvenli kayıt, e-posta doğrulama ve kullanıcıların oyun ilgi alanları, yetenek seviyeleri gibi bilgileri içeren detaylı profil oluşturma.
*   **Oyun Kurma:** Kullanıcıların oyun türü, konum, tarih, saat ve oyuncu sayısı gibi detayları belirterek kendi oyunlarını oluşturabilmesi.
*   **Oyun Keşfetme ve Filtreleme:** Kullanıcıların ana akışta veya harita görünümünde çevrelerindeki oyunları keşfetmesi; oyun türü, mesafe, tarih gibi kriterlere göre filtreleme yapabilmesi.
*   **Katılım ve Onay Süreci:** Oyunlara katılım isteği gönderme ve oyun kurucusunun bu istekleri profilleri inceleyerek onaylaması veya reddetmesi. Kontenjan dolduğunda bekleme listesi özelliği.
*   **Oyun Lobisi (İletişim):** Onaylanmış katılımcılar için oyuna özel, geçici sohbet grupları oluşturularak maç öncesi iletişimin sağlanması.
*   **Değerlendirme Sistemi:** Oyun sonrası katılımcıların birbirlerini "Dakiklik", "Sportmenlik" gibi kriterlere göre puanlayıp yorum yapabildiği bir güven sistemi.
*   **Güvenlik ve Moderasyon:** Kullanıcı şikayet etme, engelleme mekanizmaları ve şikayetlerin yönetileceği bir admin paneli.

### 4. Kullanılacak Programlar ve Teknolojiler

Projenin geliştirilmesi aşamasında modern, platformlar arası (cross-platform) ve ölçeklenebilir teknolojilerin kullanılması planlanmaktadır. Donanım olarak özel bir gereksinim bulunmamaktadır.

*   **Programlama Dilleri:**
    *   **JavaScript/TypeScript:** Mobil uygulama ve sunucu tarafı geliştirmesi için ana dil olarak kullanılacaktır.
    *   **SQL:** Veritabanı sorgulamaları için kullanılacaktır.
*   **Platformlar ve Çerçeveler (Frameworks):**
    *   **Mobil Uygulama (Frontend):** `React Native` veya `Flutter` gibi tek bir kod tabanıyla hem iOS hem de Android için uygulama geliştirmeyi sağlayan bir cross-platform framework.
    *   **Sunucu (Backend):** `Node.js` (Express.js veya NestJS ile) kullanılarak hızlı ve ölçeklenebilir bir REST API sunucusu.
    *   **Veritabanı:** `PostgreSQL` veya `MongoDB` gibi ilişkisel veya NoSQL bir veritabanı yönetim sistemi.
*   **Kullanılacak Donanımlar:**
    *   Proje tamamen yazılım tabanlı olup, geliştirme ve test süreçleri standart kişisel bilgisayarlar üzerinde yürütülecektir. Raspberry Pi, Arduino gibi özel bir donanım kullanımını gerektirmemektedir.

### 5. Projenin Mevcut Durumu

Proje şu anda **planlama ve gereksinim analizi aşamasındadır.** Bu aşamada yapılan çalışmaların en somut kanıtı, **MatchPlay Ürün Gereksinim Dokümanı (PRD)** olan `matchplay_tanitim.md` dosyasıdır.

Bu doküman kapsamında şu ana kadar tamamlanan çalışmalar şunlardır:
*   **Problem ve Çözüm Tanımı:** Uygulamanın ele alacağı temel problem netleştirilmiş ve bu probleme yönelik çözüm vizyonu ortaya konmuştur.
*   **Hedef Kitle ve Strateji:** Uygulamanın hedef kitlesi belirlenmiş, kullanıcı personaları oluşturulmuş ve projenin stratejik hedefleri ile başarı kriterleri (KPI) tanımlanmıştır.
*   **Özelliklerin Detaylandırılması:** Uygulamanın sahip olacağı tüm temel özellikler (kayıt, oyun kurma, keşfetme, iletişim, değerlendirme vb.) ve bu özelliklerin teknik gereksinimleri detaylı bir şekilde listelenmiştir.
*   **Kullanıcı Akışları:** Temel kullanıcı senaryoları ve etkileşim süreçleri tasarlanmıştır.

Mevcut durumda, projenin kavramsal çerçevesi ve yol haritası tamamlanmış olup, bir sonraki aşama olan teknik tasarım ve prototip geliştirme için hazır durumdadır. Kodlama aşamasına henüz geçilmemiştir; öncelikle projenin temelleri sağlam bir dokümantasyon ile atılmıştır.
