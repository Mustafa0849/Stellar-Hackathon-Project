# Backend Port Numarasını Bulma (Backend Başka Bilgisayarda)

Backend başka bir bilgisayarda çalışıyorsa, port numarasını bulmak için şu yöntemleri kullanabilirsiniz:

## 🎯 Yöntem 1: Arkadaşınızdan Terminal Log'larını İsteyin

1. **Arkadaşınızdan backend'i çalıştırdığı terminal penceresinin ekran görüntüsünü isteyin**
2. Terminal'de şu gibi mesajlar görünecektir:
   ```
   Server running on http://0.0.0.0:8000
   Listening on port 8000
   ```
3. Port numarası bu mesajlarda yazılıdır!

## 🎯 Yöntem 2: Backend Koduna Bakın

Arkadaşınızdan backend projesinin ana dosyasını isteyin:
- `server.js`, `app.js`, `index.js` (Node.js)
- `app.py`, `main.py` (Python)

Bu dosyalarda şu satırları arayın:
```javascript
// Node.js
app.listen(8000, '0.0.0.0', () => {
  console.log('Server running on port 8000');
});
```

```python
# Python
app.run(host='0.0.0.0', port=8000)
```

Port numarası bu satırlarda yazılıdır!

## 🎯 Yöntem 3: Tarayıcıda Test Edin (En Pratik!)

Farklı port numaralarını deneyerek backend'in hangi portta çalıştığını bulabilirsiniz:

1. Tarayıcıda şu URL'leri açın (IP: 172.9.32.221):
   - `http://172.9.32.221:8000/api/network/status`
   - `http://172.9.32.221:3000/api/network/status`
   - `http://172.9.32.221:5000/api/network/status`
   - `http://172.9.32.221:8080/api/network/status`

2. **Hangisinde JSON response görürseniz, o port doğru port!** ✅

## 🎯 Yöntem 4: Yaygın Portları Deneyin

Backend'ler genellikle şu portlarda çalışır:
- **8000** (En yaygın - Python, Node.js)
- **3000** (Node.js default)
- **5000** (Flask default)
- **8080** (Alternatif)

`.env.local` dosyasını oluştururken en yaygın portu (8000) kullanabilirsiniz. Eğer çalışmazsa diğerlerini deneyin.

## ✅ Hızlı Çözüm

Port numarasını bilmiyorsanız, `.env.local` dosyasını şu şekilde oluşturun:

```bash
NEXT_PUBLIC_API_URL=http://172.9.32.221:8000
```

Eğer `8000` çalışmazsa, frontend'i yeniden başlatıp `3000`, `5000` veya `8080` deneyin.

