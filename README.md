# Shadow Escape

Shadow Escape adalah game *stealth* 2D berbasis web yang dibangun menggunakan Vanilla JavaScript dan framework **Phaser 3**. Proyek ini mendemonstrasikan implementasi **Algoritma Dijkstra** untuk sistem pencarian jalur (Pathfinding) dan algoritma **Bresenham's Line** untuk sistem penglihatan (Line of Sight) pada AI musuh.

## 🎮 Cara Bermain

**Misi:** Coba capai Pintu Keluar (**Kotak Biru**) tanpa tertangkap oleh Penjaga (**Kotak Merah/Oranye**) atau CCTV.

**Kontrol:**
- `W, A, S, D` atau `Panah Arah`: Bergerak (Sistem pergerakan *grid* 4-Arah).
- `SPASI`: Melempar pemancing suara atau *Sound Decoy* (Lingkaran Kuning) untuk mengalihkan perhatian penjaga.

## 🗺️ Lingkungan Map & Elemen Stealth

Map dalam game memiliki berbagai rintangan *stealth* tingkat lanjut:
- **(P) Player (Kotak Hijau):** Karakter Anda.
- **(E) Exit (Kotak Biru):** Pintu keluar / objektif kemenangan.
- **(C) Camera / CCTV (Kotak Putih):** Menembakkan sorot pandangan laser merah. Menyentuh laser ini membuat Anda langsung kalah.
- **(V) Vent / Ventilasi (Kotak Abu-abu Gelap):** Titik aman (tempat sembunyi). Player tidak bisa dilihat oleh Kamera maupun Guard jika bersembunyi di atas sini. Guard juga dilarang melewati blok ini oleh algoritma Dijkstra.
- **(L) Light Area (Kotak Kuning Pucat):** Zona berbahaya. Jika Anda menginjak blok ini, sensitivitas / jarak radius pandang Guard akan meningkat 2x lipat terhadap Anda.

## 🧠 Perilaku AI (Guard)

Guard memiliki sistem *State Machine* yang dinamis:
1. **Patroli (Warna Oranye):** Berjalan menyusuri lorong map. AI menolak memutar balik kecuali berada di jalan buntu.
2. **Curiga (Warna Kuning):** Jika Player melempar *Decoy*, Guard akan menghitung rute tercepat menggunakan Dijkstra menuju asal suara tersebut untuk melakukan investigasi.
3. **Mengejar (Warna Merah):** Jika Player masuk ke dalam radius pandangan (6 blok) dan posisinya tidak terhalang tembok (dikalkulasi via *Bresenham Line*), Guard akan memburu Player secara *real-time*.

## 🚀 Menjalankan Secara Lokal

Proyek ini dibangun murni menggunakan *Native ES Modules* sehingga tidak memerlukan *bundler* atau proses *build* panjang (seperti NPM/Vite). Namun, Anda tetap membutuhkan *local web server* untuk menghindari pencekalan CORS di browser.

1. *Clone* repositori ini:
   ```bash
   git clone git@github.com:YOGA3321/Shadow-Escape---kuis2-DAA.git
   cd Shadow-Escape---kuis2-DAA
   ```
2. Jalankan server HTTP ringan bawaan Python:
   ```bash
   python3 -m http.server 3000
   ```
3. Buka browser pada alamat: `http://localhost:3000`

## 🛠️ Teknologi & Algoritma Utama

- **Game Engine:** Phaser 3 (File lokal tanpa ketergantungan koneksi CDN)
- **Pathfinding:** `js/algorithms/dijkstra.js` (Graph Traversal murni yang mengizinkan jalur lantai & Light Area, tetapi memblokir Wall & Vent)
- **Line of Sight:** `js/entities/Guard.js` & `js/entities/Camera.js` (Bresenham Raycasting)

### Struktur Folder
```text
├── index.html              # UI dan container game
├── style.css               # Styling layout
└── js/
    ├── main.js             # Konfigurasi Phaser
    ├── phaser.min.js       # File engine Phaser
    ├── scenes/
    │   └── GameScene.js    # Siklus update game, status Menang/Kalah, & render map
    ├── entities/
    │   ├── Player.js       # Input player & collision frame/dinding
    │   ├── Guard.js        # AI State Machine & Logic pandangan
    │   └── Camera.js       # Raycast Vision untuk sistem deteksi area
    ├── algorithms/
    │   └── dijkstra.js     # Algoritma penentuan jarak terpendek
    └── maps/
        └── level1.js       # Peta Array 2D
```
