# Shadow Escape — Project Planning

## 📌 Deskripsi Project

**Shadow Escape** adalah game stealth 2D berbasis web dimana player harus menyusup ke markas musuh untuk mengambil data rahasia lalu keluar tanpa tertangkap.

Game ini menggunakan algoritma:

* Dijkstra's Algorithm
* Grid-based pathfinding
* Weighted graph
* AI state behavior

---

# 🎯 Objective Gameplay

Player harus:

1. Masuk ke markas
2. Menghindari guard & kamera
3. Mengambil data rahasia
4. Keluar melalui exit

Jika player tertangkap:

* Game Over

---

# 🧠 Konsep Utama Algoritma

## Dijkstra Digunakan Untuk

### 1. Guard Chase

Guard mencari jalur tercepat menuju player.

---

### 2. Investigasi Suara

Saat player melempar decoy:

* Guard menjalankan Dijkstra menuju sumber suara.

---

### 3. Dynamic Pathfinding

Setiap tile memiliki cost berbeda.

Contoh:

| Tile         | Cost |
| ------------ | ---- |
| Normal Floor | 1    |
| Dark Area    | 2    |
| Light Area   | 5    |
| Smoke Area   | 7    |
| Alarm Area   | 10   |
| Wall         | ∞    |

Sehingga AI terlihat lebih pintar.

---

# 🕹️ Core Features

## ✅ Player Movement

* WASD movement
* Collision system
* Sneak movement

---

## ✅ Guard AI

State:

* Patrol
* Suspicious
* Chase

---

## ✅ Vision System

Guard memiliki:

* Radius pandangan
* Direction view

---

## ✅ Camera System

Camera dapat:

* mendeteksi player
* di-disable menggunakan EMP

---

## ✅ Skill System

### Smoke Bomb

Membuat area sulit dilihat.

---

### EMP

Menonaktifkan kamera sementara.

---

### Sound Decoy

Membuat guard menuju titik suara palsu.

---

# 🗺️ Struktur Map

Map berbentuk grid/tile.

Contoh:

```txt
################
#P......L....E##
#.####.....#..##
#....C........##
#..G......V...##
################
```

Keterangan:

| Symbol | Arti       |
| ------ | ---------- |
| P      | Player     |
| G      | Guard      |
| C      | Camera     |
| L      | Light Area |
| V      | Vent       |
| E      | Exit       |
| #      | Wall       |

---

# ⚙️ Teknologi

## Frontend

* HTML
* CSS
* JavaScript

---

## Game Engine

* Phaser

---

## Hosting

* pakai vps dari azure

---

# 📂 Struktur Folder Project

```txt
shadow-escape/
│
├── index.html
├── style.css
│
├── assets/
│   ├── sprites/
│   ├── audio/
│   ├── tiles/
│   └── ui/
│
├── js/
│   │
│   ├── main.js
│   │
│   ├── scenes/
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   ├── UIScene.js
│   │   └── GameOverScene.js
│   │
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Guard.js
│   │   ├── Camera.js
│   │   └── Skill.js
│   │
│   ├── algorithms/
│   │   └── dijkstra.js
│   │
│   ├── systems/
│   │   ├── visionSystem.js
│   │   ├── alertSystem.js
│   │   ├── soundSystem.js
│   │   └── collisionSystem.js
│   │
│   └── maps/
│       └── level1.json
│
└── README.md
```

---

# 🧩 Alur Pengerjaan Project

# Phase 1 — Setup Project

## Tujuan

Menyiapkan dasar game.

## Pengerjaan

* Setup Phaser
* Setup scene
* Setup canvas
* Setup player movement

## Output

Player bisa bergerak di map.

---

# Phase 2 — Grid & Map System

## Tujuan

Membuat map tile/grid.

## Pengerjaan

* Membuat tilemap
* Collision wall
* Grid coordinate system

## Output

Map stealth sudah bisa dimainkan.

---

# Phase 3 — Implementasi Dijkstra

## Tujuan

Membuat shortest path AI.

## Pengerjaan

* Membuat graph dari grid
* Membuat weighted node
* Implementasi Dijkstra manual

## Output

Guard bisa mencari jalur otomatis.

---

# Phase 4 — Guard AI

## Tujuan

Membuat behavior guard.

## State AI

### Patrol

Guard berjalan sesuai rute.

### Suspicious

Guard menuju sumber suara.

### Chase

Guard mengejar player.

## Output

AI terlihat hidup.

---

# Phase 5 — Vision System

## Tujuan

Membuat deteksi player.

## Pengerjaan

* Radius detection
* Vision cone
* Light/dark area

## Output

Guard bisa melihat player.

---

# Phase 6 — Skill System

## Skill

### Smoke Bomb

Mengurangi visibility.

### EMP

Disable camera.

### Sound Decoy

Memancing guard.

## Output

Gameplay lebih strategis.

---

# Phase 7 — UI & Polish

## Pengerjaan

* HUD
* Skill cooldown
* Alert indicator
* Main menu
* Pause menu

## Output

Game terlihat professional.

---

# Phase 8 — Finalisasi

## Pengerjaan

* Bug fixing
* Sound effect
* Testing
* Optimasi

## Output

Ready demo & upload GitHub.

---

# 🤖 Flow AI Guard

```txt
Patrol
   ↓
Mendengar suara
   ↓
Suspicious
   ↓
Menjalankan Dijkstra
   ↓
Menuju sumber suara
   ↓
Melihat player?
   ↓ YES
Chase Mode
   ↓
Menjalankan Dijkstra realtime
   ↓
Mengejar player
```

---

# 🧠 Flow Dijkstra

```txt
Grid Map
   ↓
Convert to Graph
   ↓
Set Tile Cost
   ↓
Run Dijkstra
   ↓
Generate Shortest Path
   ↓
Guard Follow Path
```

---

# 🎨 UI Yang Disarankan

## HUD

* Health
* Skill cooldown
* Alert level

---

## Alert Status

* SAFE
* SUSPICIOUS
* ALERT

---

## Mini Map (Optional)

---

# 🔥 Fitur Bonus

## Jika Masih Ada Waktu

### Multiple Guards

Beberapa guard aktif.

---

### Dynamic Alarm

Alarm meningkatkan aggression AI.

---

### Vent System

Shortcut movement.

---

### Difficulty System

AI makin pintar.

---

# 📊 Pembagian Tim

## Member 1

### Gameplay & Map

* Tilemap
* Player movement
* Collision

---

## Member 2

### AI & Algorithm

* Dijkstra
* Guard AI
* Vision system

---

## Member 3

### UI & Polish

* HUD
* Skill system
* Audio
* Documentation

---

# 🎯 Fokus Utama Project

Yang paling penting:

## ✅ AI terlihat pintar

## ✅ Dijkstra benar-benar digunakan

## ✅ Gameplay berjalan lancar

## ✅ UI bersih

## ✅ Demo smooth

Bukan:

* grafik realistis
* fitur terlalu banyak
* map terlalu besar

---

# 🚀 Final Recommendation

## Tech Stack Final

| Bagian    | Teknologi                                                       |
| --------- | --------------------------------------------------------------- |
| Engine    | Phaser                                                          |
| Language  | JavaScript                                                      |
| UI        | HTML + CSS                                                      |
| Hosting   | [GitHub Pages](https://pages.github.com?utm_source=chatgpt.com) |
| Algorithm | Dijkstra's Algorithm                                            |

---

# 🏆 Goal Akhir

Project terlihat seperti:

* game stealth modern sederhana
* AI benar-benar aktif
* algoritma jelas digunakan
* layak dijadikan portfolio GitHub juga.
