# Medipro Nihon Kohden AED-3100 Web Sitesi & Yönetim Paneli

Türkiye distribütörü Medipro için hazırlanan **Nihon Kohden Cardiolife AED-3100 Otomatik Eksternal Defibrilatör (OED)** tanıtım sitesi, içerik yönetim sistemi (CMS) ve gelişmiş ziyaretçi analiz panelini barındıran full-stack web uygulaması.

---

## 🚀 Öne Çıkan Özellikler (Key Features)

### 🖥️ Kullanıcı Arayüzü (Frontend Showcase)
* **Modern & Responsive Tasarım:** Mobil, tablet ve masaüstü cihazlarla tam uyumlu, premium HSL renk paletleri ve akıcı mikro animasyonlar içeren kullanıcı dostu arayüz.
* **Çoklu Dil Desteği (i18n):** Türkçe (TR) ve İngilizce (EN) dil seçenekleri ile dinamik çeviri.
* **Karanlık / Aydınlık Tema (Dark/Light Mode):** Kullanıcı tercihine göre anlık değişebilen, göz yormayan modern tema desteği.
* **Dinamik İçerik:** Yönetim panelinden güncellenen tüm içeriklerin anlık olarak sitede yansıması.

### 🔐 Yönetim Paneli (Admin Dashboard - `/admin`)
* **JWT Yetkilendirme:** JSON Web Token (JWT) tabanlı güvenli oturum yönetimi.
* **Brute-Force Koruması:** Giriş denemeleri için `express-rate-limit` entegrasyonu ve başarısız denemelerde hesap kilitleme mekanizması.
* **Dinamik İçerik Yönetimi:** Sitedeki tüm yazıları, SSS (Sıkça Sorulan Sorular) alanını ve mevzuat maddelerini panel üzerinden düzenleme (`data/content.json`).
* **Medya Yükleme:** Multer entegrasyonu ile ürün ve slayt görsellerini sunucuya yükleyip dinamik olarak yönetebilme.
* **Profil ve Güvenlik Yönetimi:** E-posta ve telefon doğrulama (OTP) altyapısı ile şifre sıfırlama süreçleri.

### 📊 Ziyaretçi Takip & Analitik Paneli (Analytics)
* **KVKK/GDPR Uyumlu IP Maskeleme:** Ziyaretçi IP adreslerini güvenli hash'leme yöntemiyle saklama.
* **Detaylı Coğrafi Analiz:** `geoip-lite` entegrasyonu ile ülke, bölge ve şehir tabanlı konum tespiti.
* **Cihaz ve Tarayıcı Analizi:** `ua-parser-js` ile ziyaretçilerin işletim sistemi, tarayıcı ve cihaz tiplerini ayrıştırma.
* **Aylık Raporlama:** Zaman serisi analizleri için aylık coğrafi veri gruplama (`visits_monthly_geo` tablosu).

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

### Frontend (Önyüz)
* **Vite** (Geliştirme ortamı ve hızlı derleme)
* **Vanilla Javascript & CSS3** (Esnek, hızlı ve responsive tasarım sistemleri)

### Backend (Arkayüz)
* **Node.js & Express** (Rest API sunucusu)
* **SQLite3** (Hafif ve hızlı ilişkisel veritabanı)
* **JWT & BcryptJS** (Güvenlik ve şifreleme)
* **Multer** (Dosya yükleme yönetimi)
* **GeoIP-Lite & UA-Parser-JS** (Analitik verileri ayrıştırma)

---

## 📁 Dosya Yapısı (Project Structure)

```text
├── data/                       # Veritabanı ve statik içerik JSON dosyaları
│   ├── database.sqlite         # SQLite Veritabanı dosyası
│   ├── content.json            # Yönetim panelinden düzenlenen site içerikleri
│   └── stats.json              # Sayaç vb. istatistiksel veriler
├── public/                     # Statik dosyalar (Görseller, PDF'ler ve Admin arayüzü)
│   ├── admin/                  # Admin paneli HTML, CSS ve Javascript kodları
│   ├── docs/                   # Teknik şartname ve OED Yönetmeliği PDF'leri
│   ├── images/                 # Nihon Kohden ürün ve logo görselleri
│   └── uploads/                # Admin panelinden yüklenen dinamik görseller
├── src/                        # Önyüz kaynak kodları ve Backend Kontrolcüleri
│   ├── authController.js       # Kayıt, Giriş, Şifre Sıfırlama ve OTP işlemleri
│   ├── statsController.js      # Ziyaretçi takip ve analitik hesaplamaları
│   ├── database.js             # SQLite3 Veritabanı bağlantısı ve tablo şemaları
│   ├── middleware.js           # JWT doğrulama ve Rate-Limiting ara katmanları
│   ├── main.js                 # Önyüz ana giriş ve i18n tetikleyicileri
│   ├── style.css               # Proje genel CSS kuralları ve tema değişkenleri
│   └── i18n.js                 # Dil çeviri sözlükleri (TR/EN)
├── server.js                   # Express API sunucusu ana giriş noktası
├── DEPLOYMENT_GUIDE/           # Detaylı sunucu kurulum rehberleri (PDF/Word)
├── package.json                # Bağımlılıklar ve script tanımları
└── .gitignore                  # Git dışı bırakılan dosyalar
```

---

## 💾 Veritabanı Şeması (Database Schema)

Uygulama içinde 4 ana SQLite tablosu kullanılmaktadır:
1. `users`: Yönetici bilgilerini, şifre hash'lerini ve doğrulama durumlarını tutar.
2. `reset_tokens`: Şifre sıfırlama token'larını ve son geçerlilik sürelerini yönetir.
3. `visitors_ip`: Tekil ziyaretçilerin IP hash'ini, tarayıcı/cihaz/konum bilgisini ve ziyaret sayılarını saklar.
4. `visits_monthly_geo`: Aylara ve konumlara göre aggrege edilmiş istatistikleri tutar.

---

## ⚙️ Kurulum ve Çalıştırma (Installation & Setup)

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/emirtdede/Medipro-NihonKohden-AED-Site.git
cd Medipro-NihonKohden-AED-Site
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın
Ana dizinde `.env` adında bir dosya oluşturup aşağıdaki değişkenleri tanımlayın:
```env
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### 4. Geliştirme Ortamında Çalıştırın
Önyüz (Vite) geliştirme sunucusunu başlatmak için:
```bash
npm run dev
```

Express API backend sunucusunu ve veritabanını başlatmak için:
```bash
npm start
```

---

## 🌐 Dağıtım (Deployment)
Projenin sunucuya (VPS/cPanel/Heroku vb.) kurulum süreçleri için detaylı adımlar ve komutlar [DEPLOYMENT_GUIDE/](file:///d:/SOFTWARE%20DEVELOPMENT/%23TamamlananProjeler/AED-SITE/DEPLOYMENT_GUIDE) klasöründe hem **PDF** hem de **Word (.docx)** formatında yer almaktadır.

---

## 📄 Lisans
Bu proje Medipro için özel olarak geliştirilmiştir. Tüm hakları saklıdır.