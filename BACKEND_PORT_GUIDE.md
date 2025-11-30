# Backend Port Numarası Nasıl Bulunur?

## 🔍 Yöntem 1: Backend Kodunda Arama

Backend projenizde şu dosyalara bakın:

### Node.js/Express Backend:
- `server.js` veya `app.js` veya `index.js`
- `app.listen()` veya `server.listen()` satırını bulun
- Örnek:
  ```javascript
  app.listen(8000, '0.0.0.0', () => {
    console.log('Server running on port 8000');
  });
  ```
  Bu durumda port: **8000**

### Python/Flask Backend:
- `app.py` veya `main.py`
- `app.run()` satırını bulun
- Örnek:
  ```python
  app.run(host='0.0.0.0', port=8000)
  ```
  Bu durumda port: **8000**

### package.json veya .env Dosyası:
- `package.json` içinde `"start"` script'ine bakın
- `.env` dosyasında `PORT` değişkenine bakın
- Örnek:
  ```json
  "scripts": {
    "start": "node server.js --port 8000"
  }
  ```

## 🔍 Yöntem 2: Backend Çalıştığında Console Log'ları

Backend'i çalıştırdığınızda terminal'de şu gibi mesajlar görürsünüz:

```
Server running on http://0.0.0.0:8000
Listening on port 8000
Server started at http://localhost:8000
```

Bu mesajlarda port numarası yazıyor!

## 🔍 Yöntem 3: netstat Komutu (Windows)

Backend çalışırken, yeni bir terminal açın ve şu komutu çalıştırın:

```cmd
netstat -ano | findstr LISTENING
```

Çıktıda şu gibi satırlar göreceksiniz:
```
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING       12345
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12346
```

Burada `:8000` veya `:3000` gibi port numaralarını görebilirsiniz.

**PowerShell'de:**
```powershell
Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
```

## 🔍 Yöntem 4: Tarayıcıda Test Etme

Farklı port numaralarını deneyerek backend'in hangi portta çalıştığını bulabilirsiniz:

1. Tarayıcıda şu URL'leri deneyin:
   - `http://172.9.32.221:8000/api/network/status`
   - `http://172.9.32.221:3000/api/network/status`
   - `http://172.9.32.221:5000/api/network/status`
   - `http://172.9.32.221:8080/api/network/status`

2. Hangisinde JSON response görürseniz, o port doğru port!

## 🔍 Yöntem 5: Backend'in package.json Dosyası

Backend projenizin `package.json` dosyasına bakın:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Sonra `server.js` dosyasına bakın ve port numarasını bulun.

## 📋 Yaygın Port Numaraları

Backend'ler genellikle şu portlarda çalışır:
- **8000** - En yaygın (Python, Node.js)
- **3000** - Node.js default
- **5000** - Flask default
- **8080** - Alternatif
- **3001, 8001** - Alternatifler

## ✅ Hızlı Test

Backend'iniz çalışıyorsa, şu komutu çalıştırarak hangi portta dinlediğini bulabilirsiniz:

**Windows PowerShell:**
```powershell
# Tüm dinleyen portları listele
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalAddress -eq "0.0.0.0" -or $_.LocalAddress -eq "::"} | Select-Object LocalAddress, LocalPort
```

**Windows CMD:**
```cmd
netstat -ano | findstr LISTENING
```

## 🎯 Önerilen Yöntem

1. **Backend'i çalıştırın**
2. **Terminal'deki log mesajlarına bakın** - Port numarası genellikle orada yazıyor
3. **Eğer göremiyorsanız**, `netstat` komutunu kullanın
4. **Son çare olarak**, farklı port numaralarını tarayıcıda test edin

## 💡 İpucu

Backend'iniz çalışmıyorsa, önce backend'i başlatmanız gerekiyor. Backend çalışmadan port numarasını bulamazsınız.

