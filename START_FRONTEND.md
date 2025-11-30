# Frontend Başlatma Rehberi

## ✅ Doğru Projeyi Başlatma

Stellar-Hackathon-Project frontend'ini başlatmak için:

### 1. Terminal'i Açın
- Cursor'da: **Ctrl + `** (backtick)
- Veya: **Terminal > New Terminal**

### 2. Doğru Dizine Gidin
```bash
cd C:\Users\net\Stellar-Hackathon-Project
```

### 3. Eski Process'leri Durdurun
```bash
# Tüm node process'lerini durdur
taskkill /F /IM node.exe
```

### 4. Frontend'i Başlatın
```bash
npm run dev
```

### 5. Terminal Çıktısını Kontrol Edin
Terminal'de şu mesajı görmelisiniz:
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
```

### 6. Tarayıcıda Açın
http://localhost:3000 adresini açın

## 🔍 Hangi Proje Çalışıyor?

Eğer başka bir proje açılıyorsa:

1. **Terminal'de hangi dizinde olduğunuzu kontrol edin:**
   ```bash
   pwd
   # veya PowerShell'de:
   Get-Location
   ```

2. **Doğru dizinde olduğunuzdan emin olun:**
   - `C:\Users\net\Stellar-Hackathon-Project` ✅
   - `C:\Users\net\OneDrive\Masaüstü\wallet-ui-design` ❌ (Yanlış!)

3. **Port çakışması varsa:**
   - 3000 portunu kullanan process'i durdurun
   - Veya frontend'i farklı portta başlatın: `npx next dev -p 3001`

## 🆘 Sorun Giderme

### "Port 3000 already in use"
```bash
# Windows'ta portu kullanan process'i bul ve durdur
netstat -ano | findstr :3000
taskkill /PID <PID_NUMARASI> /F
```

### "Cannot find module"
```bash
npm install
```

### Yanlış Proje Açılıyor
1. Tüm terminal'leri kapatın
2. Yeni terminal açın
3. Doğru dizine gidin: `cd C:\Users\net\Stellar-Hackathon-Project`
4. `npm run dev` çalıştırın

