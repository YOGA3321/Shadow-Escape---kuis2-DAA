import Player from '../entities/Player.js';
import Guard from '../entities/Guard.js';
import Camera from '../entities/Camera.js';
// IMPORT DIJKSTRA UNTUK HINT
import { findShortestPath } from '../algorithms/dijkstra.js'; 
import level1 from '../maps/level1.js';
import level2 from '../maps/level2.js';
import level3 from '../maps/level3.js';
import level4 from '../maps/level4.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.tileSize = 40;
    }

    init(data) {
        this.currentLevel = data.level || 4;
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
        } else {
            this.mapData = level4;
            this.tileSize = 18; // 80x50 map, tile terkecil
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

        this.player = new Player(this, 1, 1, this.tileSize, this.mapData);

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
                new Camera(this, 35, 11, {dx: 0, dy: 1}, this.tileSize, this.mapData), 
                new Camera(this, 15, 19, {dx: -1, dy: 0}, this.tileSize, this.mapData), 
                new Camera(this, 2, 28, {dx: 1, dy: 0}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 38, gridY: 28 }; 
        } else if (this.currentLevel === 3) {
            this.guards = [
                new Guard(this, 10, 5, this.tileSize, this.mapData),
                new Guard(this, 50, 5, this.tileSize, this.mapData),
                new Guard(this, 10, 35, this.tileSize, this.mapData),
                new Guard(this, 50, 35, this.tileSize, this.mapData),
                new Guard(this, 30, 19, this.tileSize, this.mapData),
                new Guard(this, 5, 25, this.tileSize, this.mapData)
            ];
            this.camerasEntities = [
                new Camera(this, 1, 5, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 58, 5, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 1, 9, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 58, 9, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 30, 1, {dx: 0, dy: 1}, this.tileSize, this.mapData),
                new Camera(this, 30, 27, {dx: 0, dy: -1}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 58, gridY: 37 }; 
        } else {
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
                new Camera(this, 70, 27, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 55, 33, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 55, 43, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 1, 3, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 3, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 1, 18, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 38, 18, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 40, 18, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 18, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 1, 36, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 38, 43, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 33, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 43, {dx: -1, dy: 0}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 77, gridY: 48 };
        }

        const exitPx = (this.exitPoint.gridX * this.tileSize) + (this.tileSize / 2);
        const exitPy = (this.exitPoint.gridY * this.tileSize) + (this.tileSize / 2);
        this.add.rectangle(exitPx, exitPy, this.tileSize * 0.8, this.tileSize * 0.8, 0x00aaff);

        // ==========================================
        // SISTEM KOIN & HUD
        // ==========================================
        this.coinCount = 0;
        this.coins = [];
        
        // HUD Koin di pojok layar
        this.coinText = this.add.text(20, 20, 'Koin: 0', { 
            fontSize: '24px', fill: '#ffd700', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 
        }).setScrollFactor(0).setDepth(200);

        // Spawn koin random (Makin tinggi level, makin banyak)
        const coinAmounts = [0, 5, 8, 12, 20];
        this.spawnRandomCoins(coinAmounts[this.currentLevel]);


        // Setup input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.hintKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H); 

        this.isGameOver = false;
        this.isGameWon = false;
        this.activeDecoy = null;
        this.isHintActive = false; 
    }

    spawnRandomCoins(amount) {
        let spawned = 0;
        while (spawned < amount) {
            let rx = Phaser.Math.Between(1, this.mapData[0].length - 2);
            let ry = Phaser.Math.Between(1, this.mapData.length - 2);
            let tile = this.mapData[ry][rx];
            
            // Koin muncul di Lantai(0), Lampu(3), atau Rumput(5)
            if ((tile === 0 || tile === 3 || tile === 5) && 
                !(rx === 1 && ry === 1) && 
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
    }

    update(time, delta) {
        if (this.isGameOver || this.isGameWon) return;

        this.player.update(this.cursors, this.keys);
        this.camerasEntities.forEach(cam => cam.update());

        // Logika Ambil Koin
        for (let i = this.coins.length - 1; i >= 0; i--) {
            let c = this.coins[i];
            if (this.player.gridX === c.gridX && this.player.gridY === c.gridY) {
                c.obj.destroy();
                this.coins.splice(i, 1); 
                this.coinCount++; 
                this.coinText.setText('Koin: ' + this.coinCount);
            }
        }

        // ==========================================
        // FITUR HINT (LOGIKA 5 KOIN & 2 KOIN)
        // ==========================================
        if (Phaser.Input.Keyboard.JustDown(this.hintKey) && !this.isHintActive) {
            
            if (this.coinCount >= 5) {
                // --- TIER 1: 5 Koin = FULL JALAN ---
                this.coinCount -= 5;
                this.coinText.setText('Koin: ' + this.coinCount); 
                this.isHintActive = true;
                
                const path = findShortestPath(this.mapData, 
                    { x: this.player.gridX, y: this.player.gridY }, 
                    { x: this.exitPoint.gridX, y: this.exitPoint.gridY },
                    true 
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
                this.coinText.setText('Koin: ' + this.coinCount); 
                this.isHintActive = true;
                
                // Cari jalan full dulu pakai Dijkstra
                const fullPath = findShortestPath(this.mapData, 
                    { x: this.player.gridX, y: this.player.gridY }, 
                    { x: this.exitPoint.gridX, y: this.exitPoint.gridY },
                    true 
                );

                // Potong array jadi SETENGAH saja
                const halfPathLength = Math.ceil(fullPath.length / 2);
                const halfPath = fullPath.slice(0, halfPathLength);

                const hintGraphics = []; 
                halfPath.forEach(node => {
                    const px = (node.x * this.tileSize) + (this.tileSize / 2);
                    const py = (node.y * this.tileSize) + (this.tileSize / 2);
                    // Warnanya aku bikin sedikit beda (hijau kekuningan) biar pemain sadar ini cuma setengah
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

        // Skill: Deploy Sound Decoy
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.activeDecoy) {
            this.activeDecoy = { gridX: this.player.gridX, gridY: this.player.gridY };
            const px = (this.activeDecoy.gridX * this.tileSize) + (this.tileSize / 2);
            const py = (this.activeDecoy.gridY * this.tileSize) + (this.tileSize / 2);
            
            const decoyGraphic = this.add.circle(px, py, 10, 0xffff00);
            
            this.time.delayedCall(5000, () => {
                decoyGraphic.destroy();
                this.activeDecoy = null;
            });
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
                winText = 'LEVEL 3 SELESAI!\nTekan N untuk Level TERAKHIR!';
                this.input.keyboard.once('keydown-N', () => {
                    this.scene.restart({ level: 4 });
                });
            } else {
                winText = 'SEMUA MISI SELESAI!\nKamu Adalah MASTER STEALTH.\nTekan R untuk Main Lagi';
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
}
