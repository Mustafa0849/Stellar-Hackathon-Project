# Frontend Port Sorunu Çözümü

## Sorun: Frontend Açılmıyor, Sadece Backend Görünüyor

Bu durumda birkaç olasılık var:

### 1. Frontend Farklı Bir Portta Çalışıyor Olabilir

Next.js default olarak **3000** portunu kullanır, ama eğer 3000 portu doluysa otomatik olarak **3001, 3002** gibi bir sonraki boş portu kullanır.

**Kontrol:**
- Terminal'de frontend başlatıldığında hangi port yazıyor kontrol edin
- Genellikle şu mesajı görürsünüz:
  ```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  ```

### 2. Backend 3000 Portunda Çalışıyor Olabilir

Eğer backend 3000 portunda çalışıyorsa, frontend otomatik olarak 3001 portuna geçer.

**Çözüm:**
- Terminal'de frontend'in hangi portta çalıştığını kontrol edin
- O portu tarayıcıda açın (örn: http://localhost:3001)

### 3. Frontend Çalışmıyor Olabilir

**Kontrol:**
1. Terminal'de frontend process'inin çalıştığından emin olun
2. Hata mesajı var mı kontrol edin
3. `npm run dev` komutunu tekrar çalıştırın

## 🔧 Çözüm Adımları

### Adım 1: Frontend'i Durdurun ve Yeniden Başlatın

```bash
# Terminal'de Ctrl+C ile durdurun
# Sonra tekrar başlatın:
cd C:\Users\net\Stellar-Hackathon-Project
npm run dev
```

### Adım 2: Terminal Çıktısını Kontrol Edin

Terminal'de şu mesajı görmelisiniz:
```
▲ Next.js 14.2.33
- Local:        http://localhost:XXXX
```

**XXXX** numarası frontend'in çalıştığı port numarasıdır.

### Adım 3: Doğru Portu Tarayıcıda Açın

Terminal'de gösterilen port numarasını kullanarak tarayıcıda açın:
- `http://localhost:3000` (veya terminal'de gösterilen port)

### Adım 4: Port Çakışması Varsa

Eğer 3000 portu backend tarafından kullanılıyorsa, frontend'i farklı bir portta başlatabilirsiniz:

```bash
# Port 3001'de başlat
npx next dev -p 3001

# Veya package.json'da script ekleyin:
"dev:3001": "next dev -p 3001"
```

## 🎯 Hızlı Test

1. **Terminal'i açın** (Cursor'da Ctrl + `)
2. **Frontend'in çalıştığından emin olun**
3. **Terminal çıktısında port numarasını bulun**
4. **O portu tarayıcıda açın**

## 💡 İpucu

Terminal'de frontend başlatıldığında şu gibi bir mesaj görürsünüz:
```
✓ Ready in 1563ms
- Local:        http://localhost:3000
```

Bu mesajdaki port numarasını kullanın!

