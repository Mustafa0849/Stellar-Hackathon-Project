# Backend Bağlantı Rehberi

## ✅ Tamamlanan Entegrasyonlar

Tüm frontend fonksiyonları backend API'ye bağlandı. Her fonksiyon backend başarısız olursa otomatik olarak Stellar SDK'ya geri döner (fallback).

### 1. **Send Payment (Gönderme)**
- **Dosya:** `app/pages/DashboardPage.tsx`
- **Fonksiyon:** `handleSend`
- **Backend API:** `transactionAPI.send()`
- **Fallback:** `sendPayment()` (Stellar SDK)

### 2. **Account Balance (Bakiye)**
- **Dosya:** `store/walletStore.ts`
- **Fonksiyon:** `fetchAccountData`
- **Backend API:** `walletAPI.getBalance()`
- **Fallback:** `loadAccountDetails()` (Stellar SDK)

### 3. **Transaction History (İşlem Geçmişi)**
- **Dosya:** `app/pages/DashboardPage.tsx`
- **Fonksiyon:** `loadTransactions`
- **Backend API:** `transactionAPI.getHistory()`
- **Fallback:** `fetchRecentTransactions()` (Stellar SDK)

### 4. **Get Testnet USDC**
- **Dosya:** `app/pages/DashboardPage.tsx`
- **Fonksiyon:** `handleGetTestnetUSDC`
- **Backend API:** `assetAPI.getTestnetUSDC()`
- **Fallback:** `getTestnetUSDC()` (Stellar SDK)

### 5. **XLM Price (Fiyat)**
- **Dosya:** `app/pages/DashboardPage.tsx`
- **Fonksiyon:** `fetchXlmPrice` (useEffect)
- **Backend API:** `assetAPI.getPrice("XLM")`
- **Fallback:** CoinGecko API

## 🔧 Kurulum

### 1. Environment Variable Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://ARKADAŞINIZIN_IP:PORT
```

**Örnekler:**
- Aynı bilgisayarda: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Farklı bilgisayarda: `NEXT_PUBLIC_API_URL=http://192.168.1.100:8000`

### 2. Backend IP Adresini Bulma

**Windows:**
```cmd
ipconfig
```
`IPv4 Address` değerini kullanın (örn: 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
# veya
ip addr
```

### 3. Frontend'i Yeniden Başlatma

Environment variable değişikliklerinden sonra Next.js'i yeniden başlatın:

```bash
# Durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

## 🧪 Test Etme

### Console Log'ları

Browser console'u açın (F12) ve şu log'ları göreceksiniz:

**Backend Başarılı:**
```
✅ Transaction sent via backend: {...}
✅ Balance fetched via backend: {...}
✅ Transactions fetched via backend: [...]
✅ Testnet USDC received via backend: {...}
✅ XLM price fetched via backend: {...}
```

**Backend Başarısız (Fallback):**
```
⚠️ Backend API failed, using direct Stellar SDK: Error...
🔄 Falling back to direct Stellar SDK...
```

### Test Senaryoları

1. **Send Payment Test:**
   - Dashboard'da "Send XLM" butonuna tıklayın
   - Hedef adres ve miktar girin
   - Console'da backend veya fallback log'larını kontrol edin

2. **Balance Test:**
   - Dashboard açıldığında otomatik olarak bakiye çekilir
   - Console'da backend veya fallback log'larını kontrol edin

3. **Transaction History Test:**
   - Dashboard'da "Activity" tab'ına tıklayın
   - Console'da backend veya fallback log'larını kontrol edin

4. **Get USDC Test:**
   - Dashboard'da "Get Testnet USDC" butonuna tıklayın
   - Console'da backend veya fallback log'larını kontrol edin

## 📋 Backend API Endpoint'leri

Tüm endpoint'ler `lib/api.ts` dosyasında tanımlıdır:

### Transaction Endpoints
- `POST /api/transaction/send` - İşlem gönder
- `GET /api/transaction/history/:address` - İşlem geçmişi
- `GET /api/transaction/:txId` - İşlem detayları

### Wallet Endpoints
- `GET /api/wallet/balance/:address` - Bakiye getir
- `POST /api/wallet/create` - Cüzdan oluştur
- `POST /api/wallet/import` - Cüzdan içe aktar

### Asset Endpoints
- `GET /api/asset/price/:symbol` - Fiyat bilgisi
- `POST /api/asset/faucet/usdc` - Testnet USDC al
- `POST /api/asset/swap` - Asset swap

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:**
- Production'da API URL'ini environment variable olarak kullanın
- Secret key'leri asla frontend'de saklamayın
- HTTPS kullanın (production'da)
- API key'leri güvenli şekilde saklayın

## 🐛 Sorun Giderme

### CORS Hatası
- Backend'de CORS ayarlarını kontrol edin
- Frontend URL'ini CORS whitelist'ine ekleyin

### Connection Refused
- Backend'in çalıştığından emin olun
- IP adresini ve port'u kontrol edin
- Firewall ayarlarını kontrol edin

### 401 Unauthorized
- Auth token'ın doğru gönderildiğinden emin olun
- Backend'de token validation'ı kontrol edin

### Backend Çalışmıyor
- Endişelenmeyin! Tüm fonksiyonlar otomatik olarak Stellar SDK'ya geri döner
- Uygulama normal şekilde çalışmaya devam eder

## 📝 Notlar

- Tüm backend entegrasyonları **fallback mekanizması** ile korunmuştur
- Backend başarısız olsa bile uygulama çalışmaya devam eder
- Console log'ları ile hangi yöntemin kullanıldığını görebilirsiniz
- Backend response formatları otomatik olarak frontend formatına dönüştürülür

