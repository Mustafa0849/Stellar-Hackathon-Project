# Backend Terminal Log'larına Nasıl Bakılır?

## 🖥️ Senaryo 1: Backend Aynı Bilgisayarda Çalışıyorsa

### Adım 1: Backend Terminal Penceresini Bulun

1. **Backend'i başlattığınız terminal penceresini bulun**
   - Backend'i çalıştırdığınızda açılan terminal/komut istemi penceresi
   - Genellikle şu komutlarla başlatılır:
     ```bash
     npm start
     # veya
     node server.js
     # veya
     python app.py
     # veya
     npm run dev
     ```

2. **O terminal penceresine bakın**
   - Backend başladığında genellikle şu gibi mesajlar görürsünüz:

   **Node.js/Express örneği:**
   ```
   Server running on http://0.0.0.0:8000
   Listening on port 8000
   Server started successfully
   ```

   **Python/Flask örneği:**
   ```
   * Running on http://0.0.0.0:8000
   * Running on all addresses (0.0.0.0)
   ```

### Adım 2: Port Numarasını Bulun

Terminal'de şu kelimeleri arayın:
- `port`
- `listening`
- `running on`
- `http://`

Port numarası genellikle bu kelimelerin yanında yazılıdır.

## 🌐 Senaryo 2: Backend Başka Bir Bilgisayarda Çalışıyorsa

### Seçenek 1: Arkadaşınızdan Terminal Ekran Görüntüsü İsteyin

1. Arkadaşınızdan backend'i çalıştırdığı terminal penceresinin ekran görüntüsünü isteyin
2. Terminal'deki log mesajlarında port numarasını bulun

### Seçenek 2: Backend Koduna Bakın

1. Backend projesinin ana dosyasını açın:
   - `server.js`, `app.js`, `index.js` (Node.js)
   - `app.py`, `main.py` (Python)
   - `main.go` (Go)

2. Şu satırları arayın:
   ```javascript
   // Node.js/Express
   app.listen(8000, '0.0.0.0', () => {
     console.log('Server running on port 8000');
   });
   ```

   ```python
   # Python/Flask
   app.run(host='0.0.0.0', port=8000)
   ```

3. Port numarası bu satırlarda yazılıdır!

## 📋 Terminal Log Örnekleri

### Node.js/Express Backend:
```
$ npm start

> backend@1.0.0 start
> node server.js

Server running on http://0.0.0.0:8000
Database connected
API endpoints ready
```

**Port: 8000** ✅

### Python/Flask Backend:
```
$ python app.py

 * Running on http://0.0.0.0:8000
 * Running on all addresses (0.0.0.0)
```

**Port: 8000** ✅

### Django Backend:
```
$ python manage.py runserver 0.0.0.0:8000

Starting development server at http://0.0.0.0:8000/
```

**Port: 8000** ✅

## 🔍 Terminal'de Arama Yapma

Eğer terminal'de çok fazla log varsa:

1. **Ctrl + F** tuşlarına basın (Windows)
2. **"port"** veya **"8000"** veya **"3000"** yazın
3. Enter'a basın ve port numarasını bulun

## 💡 İpucu: Backend Başlatma Komutları

Backend'i başlatmak için genellikle şu komutlar kullanılır:

```bash
# Node.js
npm start
npm run dev
node server.js

# Python
python app.py
python manage.py runserver
flask run

# Go
go run main.go
```

Bu komutları çalıştırdığınızda terminal'de port numarası görünür.

## 🆘 Backend Terminal'i Bulamıyorsanız

1. **Backend'i yeniden başlatın** - Yeni bir terminal açın ve backend'i başlatın, böylece log'ları görebilirsiniz
2. **Backend koduna bakın** - Port numarası kodda yazılıdır
3. **Farklı portları deneyin** - 8000, 3000, 5000, 8080 gibi yaygın portları tarayıcıda test edin

## ✅ Hızlı Test

Backend terminal'inde şu gibi bir mesaj görüyorsanız:
```
Server running on http://0.0.0.0:8000
```

Port numaranız: **8000**

Eğer şöyleyse:
```
Listening on port 3000
```

Port numaranız: **3000**

