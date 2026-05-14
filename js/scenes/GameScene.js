import Player from '../entities/Player.js';
import Guard from '../entities/Guard.js';
import Camera from '../entities/Camera.js';
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
        } else {
            this.mapData = level4;
            this.tileSize = 18; // 80x50 map, tile terkecil
        }


        // Update UI Text
        const uiTitle = document.querySelector('#ui-container h3');
        if (uiTitle) uiTitle.innerText = `Shadow Escape - Level ${this.currentLevel}`;

        // 1. Hitung total ukuran map dalam pixel secara otomatis
        const mapWidthInPixels = this.mapData[0].length * this.tileSize; 
        const mapHeightInPixels = this.mapData.length * this.tileSize;

        // --- ZOOM KAMERA ---
        // Hitung zoom agar map terlihat lebih luas
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
                } else {
                    this.add.rectangle(px + this.tileSize/2, py + this.tileSize/2, this.tileSize, this.tileSize, 0x2d2d2d).setStrokeStyle(1, 0x444444);
                }
            }
        }

        // Create player instance at Start Point
        this.player = new Player(this, 1, 1, this.tileSize, this.mapData);

        // --- SETUP KAMERA ---
        // Kunci kamera game agar TIDAK BISA keluar dari area map
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
                new Camera(this, 35, 11, {dx: 0, dy: 1}, this.tileSize, this.mapData), // Fixed
                new Camera(this, 15, 19, {dx: -1, dy: 0}, this.tileSize, this.mapData), // Fixed
                new Camera(this, 2, 28, {dx: 1, dy: 0}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 38, gridY: 28 }; 
        } else if (this.currentLevel === 3) {
            // LEVEL 3 - Cameras moved away from exit corridor
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
            // LEVEL 4 - ZONE ASSAULT (Manual Design by USER)
            this.guards = [
                // Zona A
                new Guard(this, 5, 3, this.tileSize, this.mapData),
                new Guard(this, 25, 3, this.tileSize, this.mapData),
                new Guard(this, 45, 3, this.tileSize, this.mapData),
                new Guard(this, 65, 3, this.tileSize, this.mapData),
                // Zona B
                new Guard(this, 15, 18, this.tileSize, this.mapData),
                new Guard(this, 28, 13, this.tileSize, this.mapData),
                // Zona C
                new Guard(this, 55, 18, this.tileSize, this.mapData),
                new Guard(this, 68, 13, this.tileSize, this.mapData),
                // Jembatan D
                new Guard(this, 39, 27, this.tileSize, this.mapData),
                // Zona E
                new Guard(this, 19, 35, this.tileSize, this.mapData),
                new Guard(this, 7, 43, this.tileSize, this.mapData),
                // Zona F
                new Guard(this, 48, 33, this.tileSize, this.mapData),
                new Guard(this, 67, 44, this.tileSize, this.mapData)
            ];
            // Level 4: Master AI (Sangat Agresif)
            this.guards.forEach(g => { 
                g.moveSpeed = 130; 
                g.visionRadius = 9; 
            });

            this.camerasEntities = [
                // Jembatan D
                new Camera(this, 8, 27, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 70, 27, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                // Entry F
                new Camera(this, 55, 33, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 55, 43, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                // Zona A
                new Camera(this, 1, 3, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 3, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                // Zona B
                new Camera(this, 1, 18, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 38, 18, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                // Zona C
                new Camera(this, 40, 18, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 18, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                // Zona E
                new Camera(this, 1, 36, {dx: 1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 38, 43, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                // Zona F
                new Camera(this, 78, 33, {dx: -1, dy: 0}, this.tileSize, this.mapData),
                new Camera(this, 78, 43, {dx: -1, dy: 0}, this.tileSize, this.mapData)
            ];
            this.exitPoint = { gridX: 77, gridY: 48 };
        }





        const exitPx = (this.exitPoint.gridX * this.tileSize) + (this.tileSize / 2);
        const exitPy = (this.exitPoint.gridY * this.tileSize) + (this.tileSize / 2);
        this.add.rectangle(exitPx, exitPy, this.tileSize * 0.8, this.tileSize * 0.8, 0x00aaff);


        // Setup input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.isGameOver = false;
        this.isGameWon = false;
        this.activeDecoy = null;
    }

    update(time, delta) {
        if (this.isGameOver || this.isGameWon) return;

        // Update player movement logic
        this.player.update(this.cursors, this.keys);

        // Update camera vision logic
        this.camerasEntities.forEach(cam => cam.update());

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


        // Game Over Logic: Cek collision dengan Guard
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
