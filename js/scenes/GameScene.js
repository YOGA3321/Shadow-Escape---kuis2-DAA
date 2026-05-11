import Player from '../entities/Player.js';
import Guard from '../entities/Guard.js';
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

        // Draw walls based on mapData
        for (let row = 0; row < this.mapData.length; row++) {
            for (let col = 0; col < this.mapData[row].length; col++) {
                if (this.mapData[row][col] === 1) {
                    const px = (col * this.tileSize) + (this.tileSize / 2);
                    const py = (row * this.tileSize) + (this.tileSize / 2);
                    // Draw a grey box for wall
                    this.add.rectangle(px, py, this.tileSize, this.tileSize, 0x777777);
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
            this.isGameOver = true;
            this.player.graphics.setFillStyle(0xff0000); // Player berdarah/mati
            
            // Pop-up UI Game Over
            this.add.rectangle(400, 300, 800, 150, 0x000000, 0.8);
            this.add.text(400, 300, 'TERTANGKAP!\nTekan R untuk Restart', { 
                fontSize: '32px', 
                fill: '#ff0000', 
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5);

            // Listener tombol R untuk reset
            this.input.keyboard.once('keydown-R', () => {
                this.isGameOver = false;
                this.scene.restart();
            });
        }
    }
}
