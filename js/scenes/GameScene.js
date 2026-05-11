import Player from '../entities/Player.js';
import Guard from '../entities/Guard.js';
import Camera from '../entities/Camera.js';
import level1 from '../maps/level1.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.tileSize = 40;
    }

    create() {
        // Create simple grid background (placeholder map)
        this.add.grid(400, 300, 800, 600, this.tileSize, this.tileSize, 0x3d3d3d, 1, 0x4d4d4d, 1);

        this.mapData = level1;

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

        // Create player instance at Grid X=1, Y=1
        this.player = new Player(this, 1, 1, this.tileSize, this.mapData);

        // Create Exit Point (Kotak Biru)
        this.exitPoint = { gridX: 18, gridY: 1 };
        const exitPx = (this.exitPoint.gridX * this.tileSize) + (this.tileSize / 2);
        const exitPy = (this.exitPoint.gridY * this.tileSize) + (this.tileSize / 2);
        this.add.rectangle(exitPx, exitPy, this.tileSize * 0.8, this.tileSize * 0.8, 0x00aaff);

        // Create Guard (AI) instance at Grid X=18, Y=13
        this.guard = new Guard(this, 18, 13, this.tileSize, this.mapData);

        // Create Cameras (CCTV)
        this.camerasEntities = [
            new Camera(this, 9, 3, {dx: 0, dy: 1}, this.tileSize, this.mapData), // Hadap Bawah
            new Camera(this, 14, 11, {dx: -1, dy: 0}, this.tileSize, this.mapData) // Hadap Kiri
        ];

        // Setup input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.isGameOver = false;
        this.isGameWon = false;
        
        // State Decoy aktif
        this.activeDecoy = null;
    }

    update(time, delta) {
        if (this.isGameOver || this.isGameWon) return;

        // Update player movement logic
        this.player.update(this.cursors, this.keys);

        // Skill: Deploy Sound Decoy (Tekan Spasi)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.activeDecoy) {
            // Pasang decoy di lokasi player saat ini
            this.activeDecoy = { gridX: this.player.gridX, gridY: this.player.gridY };
            const px = (this.activeDecoy.gridX * this.tileSize) + (this.tileSize / 2);
            const py = (this.activeDecoy.gridY * this.tileSize) + (this.tileSize / 2);
            
            // Visual Decoy (Lingkaran Kuning)
            const decoyGraphic = this.add.circle(px, py, 10, 0xffff00);
            
            // Hancurkan decoy setelah 5 detik
            this.time.delayedCall(5000, () => {
                decoyGraphic.destroy();
                this.activeDecoy = null;
            });
        }

        // Win Logic: Cek jika Player mencapai Exit
        if (this.player.gridX === this.exitPoint.gridX && this.player.gridY === this.exitPoint.gridY) {
            this.isGameWon = true;
            this.player.graphics.setFillStyle(0x00aaff); // Ubah warna jadi biru
            
            this.add.rectangle(400, 300, 800, 150, 0x000000, 0.8);
            this.add.text(400, 300, 'MISI SELESAI!\nTekan R untuk Main Lagi', { 
                fontSize: '32px', 
                fill: '#00aaff', 
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);

            this.input.keyboard.once('keydown-R', () => {
                this.isGameWon = false;
                this.scene.restart();
            });
            return;
        }

        // Game Over Logic: Cek apakah Guard berada di kotak yang sama dengan Player
        if (this.player.gridX === this.guard.gridX && this.player.gridY === this.guard.gridY) {
            this.triggerGameOver('TERTANGKAP GUARD!');
        }
    }

    triggerGameOver(reason) {
        if (this.isGameOver || this.isGameWon) return;
        this.isGameOver = true;
        this.player.graphics.setFillStyle(0xff0000); // Player mati
        
        this.add.rectangle(400, 300, 800, 150, 0x000000, 0.8);
        this.add.text(400, 300, reason + '\nTekan R untuk Restart', { 
            fontSize: '32px', 
            fill: '#ff0000', 
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-R', () => {
            this.isGameOver = false;
            this.scene.restart();
        });
    }
}
