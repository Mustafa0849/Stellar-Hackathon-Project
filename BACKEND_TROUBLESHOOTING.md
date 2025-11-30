# Backend Bağlantı Sorun Giderme

## ❌ Hiçbir Portta JSON Görünmüyorsa

Bu durumda birkaç olasılık var:

### 1. Backend Çalışmıyor Olabilir
- Backend'in çalıştığından emin olun
- Arkadaşınızdan backend'in çalıştığını doğrulamasını isteyin

### 2. Backend Farklı Bir Endpoint Kullanıyor Olabilir
Backend'iniz `/api/network/status` yerine farklı bir endpoint kullanıyor olabilir.

**Deneyin:**
- `http://172.9.32.221:8000/` (Ana sayfa)
- `http://172.9.32.221:8000/api/` (API root)
- `http://172.9.32.221:8000/health` (Health check)
- `http://172.9.32.221:8000/status` (Status endpoint)

### 3. Backend Farklı Bir IP'de Çalışıyor Olabilir
- Backend'in çalıştığı bilgisayarın IP adresini tekrar kontrol edin
- `ipconfig` komutunu backend'in çalıştığı bilgisayarda çalıştırın

### 4. Firewall Sorunu Olabilir
- Backend'in çalıştığı bilgisayarda firewall'ın portu engellemediğinden emin olun
- Windows Firewall ayarlarını kontrol edin

### 5. Backend Sadece localhost'ta Dinliyor Olabilir
Backend'iniz sadece `localhost` veya `127.0.0.1` adresinde dinliyor olabilir. Bu durumda dışarıdan erişilemez.

**Çözüm:** Backend kodunda şu şekilde olmalı:
```javascript
// ❌ YANLIŞ (Sadece localhost'ta dinler)
app.listen(8000, 'localhost', ...)

// ✅ DOĞRU (Tüm ağlardan erişilebilir)
app.listen(8000, '0.0.0.0', ...)
```

## 🔍 Kontrol Adımları

### Adım 1: Backend'in Çalıştığını Doğrulayın
Arkadaşınızdan backend terminal'inde şu mesajı görüp görmediğini sorun:
```
Server running on...
Listening on...
```

### Adım 2: Backend'in IP Adresini Kontrol Edin
Backend'in çalıştığı bilgisayarda `ipconfig` çalıştırın ve IP adresini kontrol edin.

### Adım 3: Backend Kodunu Kontrol Edin
Backend'inizin hangi adreste dinlediğini kontrol edin:
- `app.listen(8000, '0.0.0.0')` ✅ (Tüm ağlardan erişilebilir)
- `app.listen(8000, 'localhost')` ❌ (Sadece localhost'tan erişilebilir)

### Adım 4: Farklı Endpoint'leri Deneyin
Backend'inizin hangi endpoint'leri kullandığını öğrenin ve onları deneyin.

## 💡 Geçici Çözüm

Backend bağlantısı olmadan da frontend çalışabilir! Tüm fonksiyonlar **fallback mekanizması** ile korunmuştur:

- Backend başarısız olursa → Otomatik olarak Stellar SDK kullanılır
- Uygulama normal şekilde çalışmaya devam eder

`.env.local` dosyasını oluşturmayı bekleyebilir veya backend bağlantısı olmadan test edebilirsiniz.

