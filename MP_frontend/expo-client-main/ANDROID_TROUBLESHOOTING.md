# Android Emülatör Bağlantı Sorunları - Çözüm Rehberi

## Sorun: "No apps connected" Hatası

Bu hata, Expo'nun Android emülatörüne bağlanamadığı anlamına gelir. Aşağıdaki adımları sırayla deneyin:

## Çözüm Adımları

### 1. Expo Go Uygulamasını Kontrol Edin
- Android emülatörünüzde **Expo Go** uygulamasının yüklü olduğundan emin olun
- Eğer yüklü değilse, Google Play Store'dan yükleyin
- Emülatörü yeniden başlatın

### 2. Metro Bundler Cache'ini Temizleyin
```bash
npm run android:clear
```
veya
```bash
npx expo start --android --clear
```

### 3. Android Emülatörünü Doğrudan Başlatın
```bash
npm run android
```
veya
```bash
npx expo start --android
```

Bu komut Expo'yu Android modunda başlatır ve emülatörü otomatik olarak açmaya çalışır.

### 4. Tunnel Modunu Deneyin
Eğer yukarıdaki adımlar işe yaramazsa, tunnel modunu kullanın:
```bash
npm run android:tunnel
```
veya
```bash
npx expo start --android --tunnel
```

### 5. Manuel Bağlantı
1. `npx expo start` komutunu çalıştırın
2. Terminal'de görünen QR kodu veya URL'yi kopyalayın
3. Emülatördeki Expo Go uygulamasını açın
4. "Enter URL manually" seçeneğini seçin
5. URL'yi yapıştırın (genellikle `exp://192.168.x.x:8081` formatında)

### 6. ADB Bağlantısını Kontrol Edin
Android SDK'nın PATH'te olduğundan emin olun ve şu komutu çalıştırın:
```bash
adb devices
```

Eğer emülatör listede görünmüyorsa:
- Emülatörü yeniden başlatın
- ADB sunucusunu yeniden başlatın: `adb kill-server` sonra `adb start-server`

### 7. Port Kontrolü
8081 portunun kullanımda olmadığından emin olun:
```bash
netstat -ano | findstr :8081
```

Eğer port kullanılıyorsa, o process'i sonlandırın veya farklı bir port kullanın:
```bash
npx expo start --port 8082
```

### 8. Firewall/Antivirus Kontrolü
Windows Firewall veya antivirus yazılımınızın Expo'yu engellemediğinden emin olun.

### 9. Emülatör Ayarları
- Emülatörün internet bağlantısı olduğundan emin olun
- Emülatörü "Cold Boot" ile başlatın (soğuk başlatma)
- Emülatörün RAM ve CPU ayarlarını kontrol edin

### 10. Expo CLI'yi Güncelleyin
```bash
npm install -g expo-cli@latest
```

## Hızlı Çözüm Komutları

```bash
# 1. Cache temizle ve Android'de başlat
npm run android:clear

# 2. Tunnel modu ile dene
npm run android:tunnel

# 3. Sadece Metro bundler'ı başlat (manuel bağlantı için)
npx expo start
```

## Yaygın Hatalar ve Çözümleri

### "Unable to connect to Metro"
- Metro bundler'ın çalıştığından emin olun
- `--clear` flag'i ile yeniden başlatın

### "Network request failed"
- Tunnel modunu kullanın
- Firewall ayarlarını kontrol edin

### "App keeps loading"
- Expo Go uygulamasını kapatıp yeniden açın
- Metro bundler'ı durdurup yeniden başlatın
- Emülatörü yeniden başlatın

## İletişim
Sorun devam ederse, terminal çıktısını ve hata mesajlarını kaydedin.







