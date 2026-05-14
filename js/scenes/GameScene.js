import Player from '../entities/Player.js';
import Guard from '../entities/Guard.js';
import Camera from '../entities/Camera.js';
// IMPORT DIJKSTRA UNTUK HINT
import { findShortestPath } from '../algorithms/dijkstra.js'; 
import level1 from '../maps/level1.js';
import level2 from '../maps/level2.js';
import level3 from '../maps/level3.js';
import level4 from '../maps/level4.js';
import level5 from '../maps/level5.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.tileSize = 40;
    }

    init(data) {
        // Kita set default ke 5 agar Anda bisa langsung masuk ke Misi Final
        this.currentLevel = data.level || 1;
    }


    create() {
        // Pilih data map berdasarkan level
        if (this.currentLevel === 1) {
            this.mapData = level1;
            this.tileSize = 40;
        } else if (this.currentLevel === 2) {
            this.mapData = level2;
            this.tileSize = 32;
        } else if (this.currentLevel === 3) {
            this.mapData = level3;
            this.tileSize = 24;
        } else if (this.currentLevel === 4) {
            this.mapData = level4;
            this.tileSize = 18; 
        } else if (this.currentLevel === 5) {
            this.mapData = level5;
            this.tileSize = 18; // Diperbesar agar memenuhi layar (81x18 = 1458px)
        }



        // Update UI Text
        const uiTitle = document.querySelector('#ui-container h3');
        if (uiTitle) uiTitle.innerText = `Shadow Escape - Level ${this.currentLevel}`;

        // Hitung total ukuran map dalam pixel
        const mapWidthInPixels = this.mapData[0].length * this.tileSize; 
        const mapHeightInPixels = this.mapData.length * this.tileSize;

        // --- ZOOM KAMERA ---
        const zoomX = this.cameras.main.width / mapWidthInPixels;
        const zoomY = this.cameras.main.height / mapHeightInPixels;
        const targetZoom = Math.max(0.5, Math.min(1.2, zoomX, zoomY));
        this.cameras.main.setZoom(targetZoom);

        // Create simple grid background
        this.add.grid(
            mapWidthInPixels / 2, mapHeightInPixels / 2, 
            mapWidthInPixels, mapHeightInPixels, 
            this.tileSize, this.tileSize, 
            0x3d3d3d, 1, 0x4d4d4d, 1
        );

        // Draw grid map
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                
                if (this.mapData[y][x] === 1) {
                    this.add.rectangle(px + this.tileSize/2, py + this.tileSize/2, this.tileSize, this.tileSize, 0x555555);
                } else if (this.mapData[y][x] === 2) {
                    this.add.rectangle(px + this.tileSize/2, py + this.tileSize/2, this.tileSize, this.tileSize, 0x111111).setStrokeStyle(1, 0x333333); // Vent
                } else if (this.mapData[y][x] === 3) {
                    this.add.rectangle(px + this.tileSize/2, py + this.tileSize/2, this.tileSize, this.tileSize, 0x4d4d22).setStrokeStyle(1, 0x555533); // Light Area
                } else if (this.mapData[y][x] === 5) {
                    // --- ZONA RUMPUT (Kode 5) ---
                    this.add.rectangle(px + this.tileSize/2, py + this.tileSize/2, this.tileSize, this.tileSize, 0x1b4d2e).setStrokeStyle(1, 0x0f2b19); 
                } else {
                    this.add.rectangle(px + this.tileSize/2, py + this.tileSize/2, this.tileSize, this.tileSize, 0x2d2d2d).setStrokeStyle(1, 0x444444);
                }
            }
        }

        // Tentukan posisi awal berdasarkan level
        let startX = 1;
        let startY = 1;
        if (this.currentLevel === 5) {
            startX = 79;
            startY = 79;
        }


        this.player = new Player(this, startX, startY, this.tileSize, this.mapData);


        this.cameras.main.setBounds(0, 0, mapWidthInPixels, mapHeightInPixels);
        this.cameras.main.startFollow(this.player.graphics, true, 0.1, 0.1);

        // Penempatan Guard & Kamera Berdasarkan Level
        if (this.currentLevel === 1) {
            this.guards = [
                new Guard(this, 15, 10, this.tileSize, this.mapData), 
                new Guard(this, 22, 16, this.tileSize, this.mapData)
            ];
            this.camerasEntities = [
                new Camera(this, 1, 6, {dx: 0, dy: 1}, this.tileSize, this.mapData),
                new Camera(this, 14, 3, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 28, 12, {dx: 0, dy: 1}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 28, gridY: 18 }; 
        } else if (this.currentLevel === 2) {
            this.guards = [
                new Guard(this, 10, 5, this.tileSize, this.mapData),
                new Guard(this, 20, 15, this.tileSize, this.mapData),
                new Guard(this, 30, 25, this.tileSize, this.mapData),
                new Guard(this, 5, 20, this.tileSize, this.mapData)
            ];
            this.camerasEntities = [
                new Camera(this, 5, 1, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 30, 11, {dx: 0, dy: 1}, this.tileSize, this.mapData), 
                new Camera(this, 15, 19, {dx: -1, dy: 0}, this.tileSize, this.mapData), 
                new Camera(this, 2, 28, {dx: 1, dy: 0}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 38, gridY: 28 }; 
        } else if (this.currentLevel === 3) {
            // --- LEVEL 3: THE HEDGE MAZE ---
            this.exitPoint = { gridX: 58, gridY: 43 };

            // Cari lokasi lantai yang valid untuk penempatan guard secara acak
            const validTiles = [];
            for (let y = 1; y < this.mapData.length - 1; y++) {
                for (let x = 1; x < this.mapData[y].length - 1; x++) {
                    if ((this.mapData[y][x] === 0 || this.mapData[y][x] === 3) && (x > 8 || y > 8)) {
                        validTiles.push({x, y});
                    }
                }
            }

            // Ambil 8 titik acak untuk guard
            this.guards = [];
            for (let i = 0; i < 8; i++) {
                const spot = Phaser.Utils.Array.RemoveRandomElement(validTiles);
                if (spot) {
                    this.guards.push(new Guard(this, spot.x, spot.y, this.tileSize, this.mapData));
                }
            }

            this.camerasEntities = [
                new Camera(this, 1, 10, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 58, 10, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 1, 30, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 58, 30, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 30, 1, {dx: 0, dy: 1}, this.tileSize, this.mapData),
                new Camera(this, 30, 43, {dx: 0, dy: -1}, this.tileSize, this.mapData)
            ];
        } else if (this.currentLevel === 4) {
            this.guards = [
                new Guard(this, 5, 3, this.tileSize, this.mapData),
                new Guard(this, 25, 3, this.tileSize, this.mapData),
                new Guard(this, 45, 3, this.tileSize, this.mapData),
                new Guard(this, 65, 3, this.tileSize, this.mapData),
                new Guard(this, 15, 18, this.tileSize, this.mapData),
                new Guard(this, 28, 13, this.tileSize, this.mapData),
                new Guard(this, 55, 18, this.tileSize, this.mapData),
                new Guard(this, 68, 13, this.tileSize, this.mapData),
                new Guard(this, 39, 27, this.tileSize, this.mapData),
                new Guard(this, 19, 35, this.tileSize, this.mapData),
                new Guard(this, 7, 43, this.tileSize, this.mapData),
                new Guard(this, 48, 33, this.tileSize, this.mapData),
                new Guard(this, 67, 44, this.tileSize, this.mapData)
            ];
            this.guards.forEach(g => { 
                g.moveSpeed = 130; 
                g.visionRadius = 9; 
            });

            this.camerasEntities = [
                new Camera(this, 8, 27, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 60, 27, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 45, 33, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 45, 43, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 68, 3, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 38, 17, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 40, 19, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 19, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 1, 36, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 38, 43, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 33, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 43, {dx: -1, dy: 0}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 77, gridY: 48 };
        } else if (this.currentLevel === 5) {
            // --- LEVEL 5: THE MEGA CUBE (Square Dense Maze) ---
            // Pemain mulai dari pojok kanan bawah (79,79)
            // Goal ada di pojok kiri atas (1,1)
            this.exitPoint = { gridX: 1, gridY: 1 };

            // Spawn 20 Elit Guards secara acak di lorong-lorong
            const validTiles = [];
            for (let y = 1; y < this.mapData.length - 1; y++) {
                for (let x = 1; x < this.mapData[y].length - 1; x++) {
                    if (this.mapData[y][x] === 0 && (x < 70 || y < 70)) {
                        validTiles.push({ x, y });
                    }
                }
            }
            this.guards = [];
            for (let i = 0; i < 20; i++) {
                const spot = Phaser.Utils.Array.RemoveRandomElement(validTiles);
                if (spot) {
                    const g = new Guard(this, spot.x, spot.y, this.tileSize, this.mapData);
                    g.moveSpeed = 100; // Agak lambat karena lorong sempit
                    g.visionRadius = 10; 
                    this.guards.push(g);
                }
            }

            this.camerasEntities = [
                new Camera(this, 10, 10, { dx: 1, dy: 0 }, this.tileSize, this.mapData),
                new Camera(this, 70, 70, { dx: -1, dy: 0 }, this.tileSize, this.mapData),
                new Camera(this, 10, 70, { dx: 0, dy: -1 }, this.tileSize, this.mapData),
                new Camera(this, 70, 10, { dx: 0, dy: 1 }, this.tileSize, this.mapData),
                new Camera(this, 40, 40, { dx: 1, dy: 1 }, this.tileSize, this.mapData),
                new Camera(this, 40, 40, { dx: -1, dy: -1 }, this.tileSize, this.mapData)
            ];
        }



        const exitPx = (this.exitPoint.gridX * this.tileSize) + (this.tileSize / 2);
        const exitPy = (this.exitPoint.gridY * this.tileSize) + (this.tileSize / 2);
        this.add.rectangle(exitPx, exitPy, this.tileSize * 0.8, this.tileSize * 0.8, 0x00aaff);

        // ==========================================
        // SISTEM KOIN & HUD
        // ==========================================
        this.coinCount = 0;
        this.coins = [];
        
        // Sinkronisasi Koin ke Sidebar HTML
        const coinValEl = document.getElementById('coin-val');
        if (coinValEl) coinValEl.innerText = this.coinCount;



        // Spawn koin random (Level 5 butuh banyak koin untuk Hint!)
        const coinAmounts = [0, 5, 8, 12, 30]; // Index 4 = Lvl 4, Index 5 (otomatis dari .length)
        const amount = this.currentLevel === 5 ? 30 : coinAmounts[this.currentLevel];
        this.spawnRandomCoins(amount);


        // Setup input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.hintKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H); 

        this.isGameOver = false;
        this.isGameWon = false;
        this.activeDecoy = null;
        this.isHintActive = false; 
        this.isPaused = false; // Flag Pause

        // Input Tombol P untuk Pause
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }


    spawnRandomCoins(amount) {
        let spawned = 0;
        while (spawned < amount) {
            let rx = Phaser.Math.Between(1, this.mapData[0].length - 2);
            let ry = Phaser.Math.Between(1, this.mapData.length - 2);
            let tile = this.mapData[ry][rx];
            
            // Koin muncul di Lantai(0), Lampu(3), atau Rumput(5)
            // Hindari spawn di posisi Player atau di Exit Point
            if ((tile === 0 || tile === 3 || tile === 5) && 
                !(rx === this.player.gridX && ry === this.player.gridY) && 
                !(rx === this.exitPoint.gridX && ry === this.exitPoint.gridY)) {

                
                let isOccupied = this.coins.some(c => c.gridX === rx && c.gridY === ry);
                if (!isOccupied) {
                    const px = (rx * this.tileSize) + (this.tileSize / 2);
                    const py = (ry * this.tileSize) + (this.tileSize / 2);
                    
                    const coinObj = this.add.circle(px, py, this.tileSize * 0.25, 0xffd700).setStrokeStyle(2, 0xaa8800).setDepth(50);
                    this.coins.push({ gridX: rx, gridY: ry, obj: coinObj });
                    spawned++;
                }
            }
        }

        // Update Judul Level di UI
        const titleEl = document.getElementById('level-title');
        if (titleEl) {
            titleEl.innerText = `Shadow Escape - Level ${this.currentLevel}`;
        }
    }

    

    getDangerZones() {
        const dangerZones = new Set();
        if (!this.camerasEntities) return dangerZones;
        
        this.camerasEntities.forEach(cam => {
            let cx = cam.gridX;
            let cy = cam.gridY;
            let dist = 0;
            while (dist < cam.visionLength) {
                cx += cam.direction.dx;
                cy += cam.direction.dy;
                // Jika kena dinding (1), berhenti
                if (this.mapData[cy] && this.mapData[cy][cx] === 1) break;
                
                dangerZones.add(`${cx},${cy}`);
                dist++;
            }
        });
        return dangerZones;
    }

    update(time, delta) {
        // Logika Toggle Pause
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.togglePause();
        }

        if (this.isGameOver || this.isGameWon || this.isPaused) return;

        this.player.update(this.cursors, this.keys);

        this.camerasEntities.forEach(cam => cam.update());

        // Logika Ambil Koin
        for (let i = this.coins.length - 1; i >= 0; i--) {
            let c = this.coins[i];
            if (this.player.gridX === c.gridX && this.player.gridY === c.gridY) {
                c.obj.destroy();
                this.coins.splice(i, 1); 
                this.coinCount++; 
                const coinValEl = document.getElementById('coin-val');
                if (coinValEl) coinValEl.innerText = this.coinCount;

            }
        }

        // FITUR HINT (LOGIKA 5 KOIN & 2 KOIN)
        // ==========================================
        if (Phaser.Input.Keyboard.JustDown(this.hintKey) && !this.isHintActive) {
            
            if (this.coinCount >= 5) {
                // --- TIER 1: 5 Koin = FULL JALAN ---
                this.coinCount -= 5;
                const coinValEl = document.getElementById('coin-val');
                if (coinValEl) coinValEl.innerText = this.coinCount;
                this.isHintActive = true;
                
                const dangerZones = this.getDangerZones();
                const path = findShortestPath(this.mapData, 
                    { x: this.player.gridX, y: this.player.gridY }, 
                    { x: this.exitPoint.gridX, y: this.exitPoint.gridY },
                    true,
                    dangerZones
                );


                const hintGraphics = []; 
                path.forEach(node => {
                    const px = (node.x * this.tileSize) + (this.tileSize / 2);
                    const py = (node.y * this.tileSize) + (this.tileSize / 2);
                    const dot = this.add.circle(px, py, this.tileSize * 0.2, 0x00ff00).setAlpha(0.8).setDepth(100); 
                    hintGraphics.push(dot);
                });

                this.time.delayedCall(2000, () => {
                    hintGraphics.forEach(dot => dot.destroy());
                    this.isHintActive = false; 
                });

            } else if (this.coinCount >= 2) {
                // --- TIER 2: 2 Koin = SETENGAH JALAN ---
                this.coinCount -= 2;
                const coinValEl = document.getElementById('coin-val');
                if (coinValEl) coinValEl.innerText = this.coinCount;
                this.isHintActive = true;
                
                const dangerZones = this.getDangerZones();
                const fullPath = findShortestPath(this.mapData, 
                    { x: this.player.gridX, y: this.player.gridY }, 
                    { x: this.exitPoint.gridX, y: this.exitPoint.gridY },
                    true,
                    dangerZones
                );


                const halfPathLength = Math.ceil(fullPath.length / 2);
                const halfPath = fullPath.slice(0, halfPathLength);

                const hintGraphics = []; 
                halfPath.forEach(node => {
                    const px = (node.x * this.tileSize) + (this.tileSize / 2);
                    const py = (node.y * this.tileSize) + (this.tileSize / 2);
                    const dot = this.add.circle(px, py, this.tileSize * 0.2, 0xadff2f).setAlpha(0.8).setDepth(100); 
                    hintGraphics.push(dot);
                });

                this.time.delayedCall(2000, () => {
                    hintGraphics.forEach(dot => dot.destroy());
                    this.isHintActive = false; 
                });

            } else {
                // --- TIDAK PUNYA KOIN SAMA SEKALI ---
                const px = (this.player.gridX * this.tileSize) + (this.tileSize / 2);
                const py = (this.player.gridY * this.tileSize) - (this.tileSize);
                const warning = this.add.text(px, py, 'Butuh Koin!', { 
                    fill: '#ff0000', fontSize: '18px', fontStyle: 'bold', stroke: '#fff', strokeThickness: 3 
                }).setOrigin(0.5).setDepth(200);
                
                this.time.delayedCall(1000, () => warning.destroy());
            }
        }

        // ==========================================
        // FITUR DECOY (DILARANG MELEMPAR DI DALAM VENT)
        // ==========================================
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.activeDecoy) {
            
            const playerTile = this.mapData[this.player.gridY][this.player.gridX];
            
            // Cek apakah player sedang ada di dalam Vent (Kode 2)
            if (playerTile === 2) {
                // Jika di Vent, batalin Decoy dan kasih Peringatan Merah!
                const px = (this.player.gridX * this.tileSize) + (this.tileSize / 2);
                const py = (this.player.gridY * this.tileSize) - (this.tileSize);
                const warning = this.add.text(px, py, 'Tidak bisa decoy di Vent!', { 
                    fill: '#ff0000', fontSize: '14px', fontStyle: 'bold', stroke: '#fff', strokeThickness: 2 
                }).setOrigin(0.5).setDepth(200);
                
                this.time.delayedCall(1000, () => warning.destroy());
            } else {
                // Jika tidak di Vent, Decoy normal
                this.activeDecoy = { gridX: this.player.gridX, gridY: this.player.gridY };
                const px = (this.activeDecoy.gridX * this.tileSize) + (this.tileSize / 2);
                const py = (this.activeDecoy.gridY * this.tileSize) + (this.tileSize / 2);
                
                const decoyGraphic = this.add.circle(px, py, 10, 0xffff00);
                
                this.time.delayedCall(5000, () => {
                    decoyGraphic.destroy();
                    this.activeDecoy = null;
                });
            }
        }

        // Win Logic
        if (this.player.gridX === this.exitPoint.gridX && this.player.gridY === this.exitPoint.gridY) {
            this.isGameWon = true;
            this.player.graphics.setFillStyle(0x00aaff); 
            
            const centerX = this.cameras.main.worldView.centerX;
            const centerY = this.cameras.main.worldView.centerY;

            this.add.rectangle(centerX, centerY, 800, 200, 0x000000, 0.8).setScrollFactor(0);
            
            let winText = '';
            if (this.currentLevel === 1) {
                winText = 'LEVEL 1 SELESAI!\nTekan N untuk Lanjut ke Level 2';
                this.input.keyboard.once('keydown-N', () => {
                    this.scene.restart({ level: 2 });
                });
            } else if (this.currentLevel === 2) {
                winText = 'LEVEL 2 SELESAI!\nTekan N untuk Lanjut ke Level 3';
                this.input.keyboard.once('keydown-N', () => {
                    this.scene.restart({ level: 3 });
                });
            } else if (this.currentLevel === 3) {
                winText = 'LEVEL 3 SELESAI!\nTekan N untuk Lanjut ke Level 4';
                this.input.keyboard.once('keydown-N', () => {
                    this.scene.restart({ level: 4 });
                });
            } else if (this.currentLevel === 4) {
                winText = 'LEVEL 4 SELESAI!\nTekan N untuk MISI FINAL!';
                this.input.keyboard.once('keydown-N', () => {
                    this.scene.restart({ level: 5 });
                });
            } else {
                winText = 'SEMUA MISI SELESAI!\nKAMU ADALAH MASTER STEALTH SEJATI.\nNexus Sphere Telah Dikuasai!\nTekan R untuk Main Lagi';
                this.input.keyboard.once('keydown-R', () => {
                    this.scene.restart({ level: 1 });
                });
            }


            this.add.text(centerX, centerY, winText, { 
                fontSize: '28px', 
                fill: '#00aaff', 
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0);

            return;
        }

        // Game Over Logic
        const playerTile = this.mapData[this.player.gridY][this.player.gridX];
        const isPlayerInVent = (playerTile === 2);

        if (!isPlayerInVent) {
            for (let i = 0; i < this.guards.length; i++) {
                if (this.player.gridX === this.guards[i].gridX && this.player.gridY === this.guards[i].gridY) {
                    this.triggerGameOver('TERTANGKAP GUARD!');
                    break; 
                }
            }
        }
    }

    triggerGameOver(reason) {
        if (this.isGameOver || this.isGameWon) return;
        this.isGameOver = true;
        this.player.graphics.setFillStyle(0xff0000); 
        
        const centerX = this.cameras.main.worldView.centerX;
        const centerY = this.cameras.main.worldView.centerY;

        this.add.rectangle(centerX, centerY, 800, 150, 0x000000, 0.8).setScrollFactor(0);
        this.add.text(centerX, centerY, reason + '\nTekan R untuk Restart', { 
            fontSize: '32px', 
            fill: '#ff0000', 
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        this.input.keyboard.once('keydown-R', () => {
            this.isGameOver = false;
            this.scene.restart({ level: this.currentLevel });
        });
    }

    togglePause() {
        if (this.isGameOver || this.isGameWon) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            // BEKUKAN seluruh sistem game
            this.tweens.pauseAll();
            this.time.paused = true;

            // Tampilkan Overlay Pause
            const centerX = this.cameras.main.worldView.centerX;
            const centerY = this.cameras.main.worldView.centerY;

            this.pauseOverlay = this.add.container(0, 0).setDepth(1000).setScrollFactor(0);
            
            const bg = this.add.rectangle(centerX, centerY, 800, 200, 0x000000, 0.7).setOrigin(0.5);
            const text = this.add.text(centerX, centerY, 'GAME PAUSED\nTekan P untuk Lanjut', { 
                fontSize: '32px', 
                fontFamily: 'Orbitron',
                fill: '#00ffcc', 
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);
            
            this.pauseOverlay.add([bg, text]);
        } else {
            // LANJUTKAN kembali sistem game
            this.tweens.resumeAll();
            this.time.paused = false;

            // Hapus Overlay Pause
            if (this.pauseOverlay) {
                this.pauseOverlay.destroy();
            }
        }
    }

}

