# Backend IP Adresi Nasıl Bulunur?

## 🖥️ Windows'ta IP Adresi Bulma

### Yöntem 1: Komut İstemi (CMD) veya PowerShell

1. **Windows + R** tuşlarına basın
2. `cmd` yazın ve Enter'a basın (veya PowerShell açın)
3. Şu komutu çalıştırın:

```cmd
ipconfig
```

4. Çıktıda **"IPv4 Address"** veya **"IPv4 Adresi"** satırını bulun
5. Genellikle şu formatta olur: `192.168.1.XXX` veya `10.0.0.XXX`

**Örnek çıktı:**
```
Ethernet adapter Ethernet:

   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```

Bu durumda IP adresiniz: **192.168.1.100**

### Yöntem 2: Ayarlar Menüsü

1. **Windows + I** tuşlarına basın (Ayarlar)
2. **Ağ ve İnternet** > **Wi-Fi** (veya **Ethernet**)
3. Bağlı olduğunuz ağa tıklayın
4. **Özellikler** bölümünde **IPv4 adresi** satırını bulun

### Yöntem 3: PowerShell (Daha Detaylı)

PowerShell'de şu komutu çalıştırın:

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object IPAddress, InterfaceAlias
```

Bu komut sadece gerçek ağ IP adreslerini gösterir (localhost ve otomatik IP'leri hariç tutar).

## 🌐 Backend'in Çalıştığı Bilgisayar Farklıysa

Eğer backend başka bir bilgisayarda çalışıyorsa:

1. **Backend'in çalıştığı bilgisayarda** yukarıdaki adımları uygulayın
2. O bilgisayarın IP adresini alın
3. Backend'in çalıştığı **port numarasını** öğrenin (genellikle 8000, 3000, 5000 gibi)

## 📝 Örnekler

### Senaryo 1: Backend Aynı Bilgisayarda
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Senaryo 2: Backend Farklı Bilgisayarda (Aynı Ağ)
```
# Backend IP: 192.168.1.100
# Backend Port: 8000
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
```

### Senaryo 3: Backend Farklı Bilgisayarda (Farklı Port)
```
# Backend IP: 192.168.1.100
# Backend Port: 3000
NEXT_PUBLIC_API_URL=http://192.168.1.100:3000
```

## ✅ IP Adresini Doğrulama

IP adresinizi bulduktan sonra, backend'in erişilebilir olduğundan emin olun:

1. **Backend'in çalıştığından emin olun**
2. Tarayıcıda şu URL'yi açın:
   ```
   http://BULDUĞUNUZ_IP:PORT/api/network/status
   ```
   Örnek: `http://192.168.1.100:8000/api/network/status`

3. Eğer bir JSON response görüyorsanız, backend erişilebilir! ✅

## 🔍 Hangi IP'yi Kullanmalıyım?

- **127.0.0.1** veya **localhost**: Sadece aynı bilgisayarda çalışıyorsa
- **192.168.x.x** veya **10.0.x.x**: Aynı yerel ağda başka bilgisayarlardan erişim için
- **169.254.x.x**: Otomatik IP (genellikle kullanmayın)

## ⚠️ Önemli Notlar

1. **Firewall**: Backend port'unun firewall'da açık olduğundan emin olun
2. **Aynı Ağ**: Backend ve frontend aynı yerel ağda olmalı (Wi-Fi veya Ethernet)
3. **Port**: Backend'in hangi port'ta çalıştığını bilin (genellikle 8000, 3000, 5000)

## 🆘 Sorun Giderme

### "Connection Refused" Hatası
- Backend'in çalıştığından emin olun
- IP adresini ve port'u kontrol edin
- Firewall ayarlarını kontrol edin

### "Network Error" Hatası
- Aynı ağda olduğunuzdan emin olun
- IP adresinin doğru olduğundan emin olun
- Backend'in tüm ağlardan dinlemesi gerekiyor (0.0.0.0)

### Backend Bulunamıyor
- Backend'in `0.0.0.0` veya `::` adresinde dinlemesi gerekiyor (sadece `localhost` değil)
- Backend kodunda şu şekilde olmalı:
  ```javascript
  app.listen(8000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:8000');
  });
  ```

