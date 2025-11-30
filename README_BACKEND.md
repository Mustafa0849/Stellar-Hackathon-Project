# Backend Bağlantı Rehberi

## Hızlı Başlangıç

### 1. Environment Variable Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://ARKADAŞINIZIN_IP_ADRESI:PORT
```

**Örnek:**
```bash
# Eğer backend 192.168.1.100 IP'sinde ve 8000 portunda çalışıyorsa:
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000

# Eğer aynı bilgisayarda çalışıyorsa:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

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

### 3. Backend'in Çalıştığından Emin Olun

Backend'iniz çalışıyor mu kontrol edin:
```bash
curl http://ARKADAŞINIZIN_IP:PORT/api/network/status
```

### 4. Frontend'i Yeniden Başlatın

Environment variable değişikliklerinden sonra Next.js'i yeniden başlatın:

```bash
# Durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

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

## API Kullanımı

### Örnek: Wallet Oluşturma

```typescript
import { walletAPI } from '@/lib/api'

const createWallet = async () => {
  try {
    const wallet = await walletAPI.createWallet({
      recoveryPhrase: ['word1', 'word2', ...],
      password: 'your-password'
    })
    console.log('Wallet Address:', wallet.address)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Örnek: Bakiye Getirme

```typescript
import { walletAPI } from '@/lib/api'

const getBalance = async () => {
  const address = localStorage.getItem('walletAddress')
  if (address) {
    const balance = await walletAPI.getBalance(address)
    console.log('Balance:', balance)
  }
}
```

### Örnek: İşlem Gönderme

```typescript
import { transactionAPI } from '@/lib/api'

const sendTransaction = async (to: string, amount: string, asset: string) => {
  try {
    const tx = await transactionAPI.send({
      to,
      amount,
      asset
    })
    console.log('Transaction sent:', tx.id)
  } catch (error) {
    console.error('Error sending transaction:', error)
  }
}
```

## Mevcut API Endpoint'leri

Tüm API fonksiyonları `lib/api.ts` dosyasında tanımlıdır:

- `walletAPI` - Cüzdan işlemleri
- `transactionAPI` - İşlem işlemleri  
- `assetAPI` - Asset işlemleri
- `authAPI` - Kimlik doğrulama
- `networkAPI` - Network işlemleri

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

## Sorun Giderme

### CORS Hatası Alıyorsanız

Backend'de CORS ayarlarını yapın. Örnek (Express.js):

```javascript
const cors = require('cors')
app.use(cors({
  origin: ['http://localhost:3000', 'http://SİZİN_IP:3000'],
  credentials: true
}))
```

### Connection Refused Hatası

1. Backend'in çalıştığından emin olun
2. IP adresini ve port'u kontrol edin
3. Firewall'da port'un açık olduğundan emin olun
4. Aynı ağda olduğunuzdan emin olun

### 404 Not Found

Backend endpoint'lerinin doğru olduğundan emin olun. `lib/api.ts` dosyasındaki endpoint'leri backend'inizle eşleştirin.

### 401 Unauthorized

- Auth token'ın doğru gönderildiğinden emin olun
- Backend'de token validation'ı kontrol edin

### Backend Çalışmıyor

- Endişelenmeyin! Tüm fonksiyonlar otomatik olarak Stellar SDK'ya geri döner
- Uygulama normal şekilde çalışmaya devam eder

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:**
- Production'da API URL'ini environment variable olarak kullanın
- Secret key'leri asla frontend'de saklamayın
- HTTPS kullanın (production'da)
- API key'leri güvenli şekilde saklayın

## 📝 Notlar

- Tüm backend entegrasyonları **fallback mekanizması** ile korunmuştur
- Backend başarısız olsa bile uygulama çalışmaya devam eder
- Console log'ları ile hangi yöntemin kullanıldığını görebilirsiniz
- Backend response formatları otomatik olarak frontend formatına dönüştürülür

## Detaylı Dokümantasyon

Daha fazla bilgi için:
- `BACKEND_CONNECTION.md` - Detaylı entegrasyon bilgileri
- `BACKEND_IP_GUIDE.md` - IP adresi bulma rehberi

