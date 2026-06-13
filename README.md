<div align="center">

# 🚑 Medipro Nihon Kohden AED-3100 Website & Admin Dashboard

[![](https://img.shields.io/badge/Language-English-blue?style=for-the-badge&logo=google-translate)](#english-version)
&nbsp;&nbsp;&nbsp;&nbsp;
[![](https://img.shields.io/badge/Dil-T%C3%BCrk%C3%A7e-red?style=for-the-badge&logo=google-translate)](#turkish-version)

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite3](https://img.shields.io/badge/SQLite3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

<a id="english-version"></a>
# English Version

A full-stack web application designed for Turkey's distributor Medipro, featuring the **Nihon Kohden Cardiolife AED-3100 Automated External Defibrillator (AED)** showcase site, a content management system (CMS), and an advanced visitor analytics dashboard.

## 🚀 Key Features

### 🖥️ User Frontend
* **Modern & Responsive Design**: Seamless layout across mobile, tablet, and desktop viewports, styled with premium HSL color palettes and smooth micro-animations.
* **Multi-Language Support (i18n)**: Dynamic locale translation for Turkish (TR) and English (EN) options.
* **Dark / Light Mode**: Instant, user-toggled theme changes adapted to browser preferences.
* **Dynamic Content Loading**: Changes made in the administration panel reflect immediately on the frontend.

### 🔐 Admin Management Panel (`/admin`)
* **Secure JWT Authentication**: JSON Web Token (JWT)-based session handling.
* **Brute-Force Attack Prevention**: Configured with `express-rate-limit` and automatic account lockout mechanisms after consecutive failed login attempts.
* **Dynamic CMS**: Direct dashboard control to update texts, FAQ (Frequently Asked Questions) panels, and legal regulations (`data/content.json`).
* **Media Uploads**: Powered by `multer` to upload and manage product images and carousel slides.
* **Profile & Security Controls**: Password recovery processes supported by email and OTP (One-Time Password) infrastructure.

### 📊 Visitor Tracking & Analytics
* **KVKK/GDPR Compliant IP Masking**: Securely hashes visitor IP addresses before database insertion.
* **Detailed Geo-Location**: Leverages `geoip-lite` to detect country, region, and city-level locations.
* **User-Agent & Device Parsing**: Uses `ua-parser-js` to extract operating system, browser, and device classifications.
* **Aggregated Reporting**: Groups geolocation data monthly (`visits_monthly_geo` table) for optimized time-series charts.

---

## 🛠️ Technology Stack

### Frontend
- **Vite** (Rapid builds and hot module replacement)
- **Vanilla JavaScript & CSS3** (Flexible layout structure, high-speed loading)

### Backend
- **Node.js & Express** (Robust Rest API server)
- **SQLite3** (Lightweight relational database)
- **JWT & BcryptJS** (Security, session validation, and password hashing)
- **Multer** (File upload management)
- **GeoIP-Lite & UA-Parser-JS** (Metadata and analytical resolution)

---

## 📁 Project Structure

```text
├── data/                       # Database and static content JSON files
│   ├── database.sqlite         # SQLite database file
│   ├── content.json            # Dynamic content updated via admin panel
│   └── stats.json              # Statistical counters
├── public/                     # Static files (Images, PDFs, and Admin UI assets)
│   ├── admin/                  # Dashboard HTML, CSS, and JS files
│   ├── docs/                   # Product specification and legal regulation PDFs
│   ├── images/                 # Nihon Kohden product and branding images
│   └── uploads/                # Dynamic uploaded media files
├── src/                        # Source codes and Backend Controllers
│   ├── authController.js       # Signup, Login, Password Reset, and OTP logic
│   ├── statsController.js      # Visitor tracking and analytic aggregations
│   ├── database.js             # SQLite3 connection and table schemas
│   ├── middleware.js           # JWT authentication and Rate-limiting middlewares
│   ├── main.js                 # Frontend entry point and translation initializer
│   ├── style.css               # Core CSS layout rules and variable definitions
│   └── i18n.js                 # Dynamic translation dictionaries (TR/EN)
├── server.js                   # Main Express server entry point
├── DEPLOYMENT_GUIDE/           # Thorough VPS server setup guides (PDF/Word)
├── package.json                # Project dependencies and script declarations
└── .gitignore                  # Git ignore files
```

---

## 💾 Database Schema

The SQLite database structure runs 4 core tables:
1. `users`: Stores admin credentials, password hashes, and verification statuses.
2. `reset_tokens`: Manages password reset tokens and expiration timestamps.
3. `visitors_ip`: Stores unique visitor IP hashes, browser details, devices, location information, and hit counters.
4. `visits_monthly_geo`: Holds aggregated, monthly statistics grouped by regions.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/emirtdede/Medipro-NihonKohden-AED-Site.git
cd Medipro-NihonKohden-AED-Site
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### 4. Run Locally
To run the Vite frontend development server:
```bash
npm run dev
```
To run the Express backend API and database:
```bash
npm start
```

---

## 🌐 Deployment
Detailed instructions and shell commands for hosting the application on virtual servers (VPS/cPanel/Heroku) are located inside the [DEPLOYMENT_GUIDE/](DEPLOYMENT_GUIDE/) directory in both **PDF** and **Word (.docx)** formats.

---

## 📄 License
Developed exclusively for Medipro. All rights reserved.

---

<a id="turkish-version"></a>
# Türkçe Versiyon

Türkiye distribütörü Medipro için hazırlanan **Nihon Kohden Cardiolife AED-3100 Otomatik Eksternal Defibrilatör (OED)** tanıtım sitesi, içerik yönetim sistemi (CMS) ve gelişmiş ziyaretçi analiz panelini barındıran full-stack web uygulaması.

## 🚀 Öne Çıkan Özellikler

### 🖥️ Kullanıcı Arayüzü (Önyüz)
* **Modern & Responsive Tasarım**: Mobil, tablet ve masaüstü cihazlarla tam uyumlu, premium HSL renk paletleri ve akıcı mikro animasyonlar içeren kullanıcı dostu arayüz.
* **Çoklu Dil Desteği (i18n)**: Türkçe (TR) ve İngilizce (EN) dil seçenekleri ile dinamik çeviri.
* **Karanlık / Aydınlık Tema (Dark/Light Mode)**: Kullanıcı tercihine göre anlık değişebilen, göz yormayan modern tema desteği.
* **Dinamik İçerik**: Yönetim panelinden güncellenen tüm içeriklerin anlık olarak sitede yansıması.

### 🔐 Yönetim Paneli (Admin Panel - `/admin`)
* **JWT Yetkilendirme**: JSON Web Token (JWT) tabanlı güvenli oturum yönetimi.
* **Brute-Force Koruması**: Giriş denemeleri için `express-rate-limit` entegrasyonu ve başarısız denemelerde hesap kilitleme mekanizması.
* **Dinamik İçerik Yönetimi**: Sitedeki tüm yazıları, SSS (Sıkça Sorulan Sorular) alanını ve mevzuat maddelerini panel üzerinden düzenleme (`data/content.json`).
* **Medya Yükleme**: Multer entegrasyonu ile ürün ve slayt görsellerini sunucuya yükleyip dinamik olarak yönetebilme.
* **Profil ve Güvenlik Yönetimi**: E-posta ve telefon doğrulama (OTP) altyapısı ile şifre sıfırlama süreçleri.

### 📊 Ziyaretçi Takip & Analitik Paneli
* **KVKK/GDPR Uyumlu IP Maskeleme**: Ziyaretçi IP adreslerini güvenli hash'leme yöntemiyle saklama.
* **Detaylı Coğrafi Analiz**: `geoip-lite` entegrasyonu ile ülke, bölge ve şehir tabanlı konum tespiti.
* **Cihaz ve Tarayıcı Analizi**: `ua-parser-js` ile ziyaretçilerin işletim sistemi, tarayıcı ve cihaz tiplerini ayrıştırma.
* **Aylık Raporlama**: Zaman serisi analizleri için aylık coğrafi veri gruplama (`visits_monthly_geo` tablosu).

---

## 🛠️ Kullanılan Teknolojiler

### Önyüz (Frontend)
* **Vite** (Hızlı derleme ve sıcak modül değişimi)
* **Vanilla Javascript & CSS3** (Esnek, hızlı ve responsive tasarım sistemleri)

### Arkayüz (Backend)
* **Node.js & Express** (Rest API sunucusu)
* **SQLite3** (Hafif ve hızlı ilişkisel veritabanı)
* **JWT & BcryptJS** (Güvenlik ve şifreleme)
* **Multer** (Dosya yükleme yönetimi)
* **GeoIP-Lite & UA-Parser-JS** (Analitik verileri ayrıştırma)

---

## 📁 Dosya Yapısı

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

## 💾 Veritabanı Şeması

Uygulama içinde 4 ana SQLite tablosu kullanılmaktadır:
1. `users`: Yönetici bilgilerini, şifre hash'lerini ve doğrulama durumlarını tutar.
2. `reset_tokens`: Şifre sıfırlama token'larını ve son geçerlilik sürelerini yönetir.
3. `visitors_ip`: Tekil ziyaretçilerin IP hash'ini, tarayıcı/cihaz/konum bilgisini ve ziyaret sayılarını saklar.
4. `visits_monthly_geo`: Aylara ve konumlara göre aggrege edilmiş istatistikleri tutar.

---

## ⚙️ Kurulum ve Çalıştırma

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
Projenin sunucuya (VPS/cPanel/Heroku vb.) kurulum süreçleri için detaylı adımlar ve komutlar [DEPLOYMENT_GUIDE/](DEPLOYMENT_GUIDE/) klasöründe hem **PDF** ve hem de **Word (.docx)** formatında yer almaktadır.

---

## 📄 Lisans
Bu proje Medipro için özel olarak geliştirilmiştir. Tüm hakları saklıdır.