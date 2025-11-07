# MATCHPLAY TEST 1.0

**Local Test:**
> test yapılamadı veritabanı ihtiyacı var

**bult.new adresi üzerinden yapılan test:**

---

## KAYIT SAYFASI
- E-posta onayı.
- Üniversite e-postası ile isim, soyisim doğrulaması.

## PROFİL SAYFASI
- Profilde cinsiyet, yaş bilgisi görüntülenmeli.
- Profil sayfasındaki üniversite bölümüne gerek yok.

## OYUN OLUŞTURMA SAYFASI
*(şimdilik test edilebilmesi için mekan eklendi: istanbul-kadıköy-)*
- Tarih, saat olarak belirlenebiliyor fakat gün olarak belirlenemiyor.
- "Toplam oyuncu sayısı" yanlış anlaşılabilir. "İhtiyaç duyulan oyuncu sayısı" olarak düzenlenebilir.
- En son aşamada "Oyunu Oluştur" butonuna basıldığında anasayfaya yönlendiriyor. Oluşturulan oyunun profilde görünmesi isteniyor.
- Oyun oluşturulduktan sonra tekrar oyun oluşturma sayfasına girildiğinde, bir önceki oluşturulan oyunun son aşaması görünüyor.
    - **Öneri:** Bir kullanıcı aynı anda sadece bir aktif oyun oluşturabilsin. Oyun tamamlandıktan sonra yeni bir oyun oluşturabilsin.
    - **Öneri:** Bu durumda, oyun oluşturma sayfasına tekrar girildiğinde "Mevcutta bir oyununuz var, başka bir oyun oluşturulamaz." gibi bir uyarı gösterilebilir veya sayfa, mevcut oyunu güncelleme sayfasına dönüşebilir.

## PUAN
- Her oyun sonrasında kurucu ile katılımcı birbirini puanlamalı.
- Oyuncunun aldığı puanların ortalaması profilde gözükmeli.

## SOHBET
- Oyun kurucusu, katılımcının isteğini kabul ettikten sonra kişiler birbiri ile sohbet edebilmeli.
- Sohbet menüsü eklenmeli.

## ANASAYFA
- "Popüler Sporlar" yerine "Popüler Oyunlar" yazılmalı ve son 1 hafta içinde en çok oynanan 3 oyun sergilenmeli.
- Sergilenen oyunlara tıklandığında, ilgili oyun seçili olarak doğrudan oyun oluşturma sayfasının ikinci adımına yönlendirilmeli.

## KEŞFET
- Dolu oyunlar için "istek listesi" özelliği eklenebilir. Eğer bir yer boşalırsa, oyun başlayana kadar istek listesindeki kişilere bildirim gidebilir.
- İstek listesi profilde görüntülenebilir.

---

## Sorular ve Hatalar
- Bekleme listesi nedir?
- Boltta telefon ile QR kod okutulduğunda "HTTP response error 502: No connected tunnel source" hatası alınıyor.
