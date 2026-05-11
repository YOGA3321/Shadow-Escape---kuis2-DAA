import { findShortestPath } from '../algorithms/dijkstra.js';

// Fungsi bantuan: Bresenham's Line Algorithm untuk mengecek dinding (Line of Sight)
function hasLineOfSight(x0, y0, x1, y1, mapData) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        // Terhalang dinding = tidak bisa melihat
        if (mapData[y0] !== undefined && mapData[y0][x0] === 1) return false;
        
        if (x0 === x1 && y0 === y1) break;
        
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
    return true; // Lolos = bisa melihat jelas
}

export default class Guard {
    constructor(scene, gridX, gridY, size, mapData) {
        this.scene = scene;
        this.size = size;
        this.gridX = gridX;
        this.gridY = gridY;
        this.mapData = mapData;
        
        const px = (gridX * size) + (size / 2);
        const py = (gridY * size) + (size / 2);
        // Default Patroli: Warna Oranye Gelap
        this.graphics = scene.add.rectangle(px, py, size * 0.8, size * 0.8, 0xffaa00);
        
        this.moveSpeed = 300; 
        this.isMoving = false;
        this.state = 'PATROL';
        this.visionRadius = 6; // Hanya bisa melihat sejauh 6 kotak
        
        this.scene.time.addEvent({
            delay: 400,
            callback: this.think,
            callbackScope: this,
            loop: true
        });

        this.pathLine = scene.add.graphics();
    }

    think() {
        if (this.isMoving || this.scene.isGameOver || this.scene.isGameWon) return;

        const player = this.scene.player;
        if (!player) return;

        // Kalkulasi jarak Euclidean ke player
        const distToPlayer = Math.sqrt(Math.pow(this.gridX - player.gridX, 2) + Math.pow(this.gridY - player.gridY, 2));

        // Cek Pandangan: Apakah jarak dekat DAN tidak ada dinding yang menutupi garis pandang
        const canSeePlayer = (distToPlayer <= this.visionRadius) && hasLineOfSight(this.gridX, this.gridY, player.gridX, player.gridY, this.mapData);

        // Prioritas 1: Lihat player secara langsung
        if (canSeePlayer) {
            this.state = 'CHASE';
            this.graphics.setFillStyle(0xff0000); // Merah Terang = Peringatan/Mengejar
        } 
        // Prioritas 2: Mendengar suara decoy
        else if (this.scene.activeDecoy) {
            this.state = 'SUSPICIOUS';
            this.graphics.setFillStyle(0xffff00); // Kuning = Curiga/Mencari Suara
        } 
        // Prioritas 3: Kembali Normal
        else {
            this.state = 'PATROL';
            this.graphics.setFillStyle(0xffaa00); // Oranye = Tenang/Patroli Acak
            this.pathLine.clear();
        }

        if (this.state === 'CHASE') {
            const start = { x: this.gridX, y: this.gridY };
            const target = { x: player.gridX, y: player.gridY };
            
            const path = findShortestPath(this.mapData, start, target);
            this.drawDebugPath(path);

            if (path.length > 0) {
                const nextStep = path[0];
                const dx = nextStep.x - this.gridX;
                const dy = nextStep.y - this.gridY;
                this.move(dx, dy);
            }
        } else if (this.state === 'SUSPICIOUS') {
            const start = { x: this.gridX, y: this.gridY };
            const target = { x: this.scene.activeDecoy.gridX, y: this.scene.activeDecoy.gridY };
            
            // Menjalankan Dijkstra menuju titik lemparan Decoy
            const path = findShortestPath(this.mapData, start, target);
            this.drawDebugPath(path);

            if (path.length > 0) {
                const nextStep = path[0];
                const dx = nextStep.x - this.gridX;
                const dy = nextStep.y - this.gridY;
                this.move(dx, dy);
            } else {
                this.pathLine.clear(); // Sudah sampai tujuan decoy
            }
        } else if (this.state === 'PATROL') {
            // Inisialisasi memori arah jalan jika belum ada
            if (!this.patrolDir) {
                this.patrolDir = { dx: -1, dy: 0 }; // Default mulai jalan ke kiri
            }

            const directions = [
                { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
            ];
            
            let validMoves = [];

            // Kumpulkan semua arah yang tidak terhalang dinding
            for (const dir of directions) {
                const targetX = this.gridX + dir.dx;
                const targetY = this.gridY + dir.dy;
                
                if (targetY >= 0 && targetY < this.mapData.length && 
                    targetX >= 0 && targetX < this.mapData[0].length &&
                    this.mapData[targetY][targetX] !== 1) {
                    validMoves.push(dir);
                }
            }

            if (validMoves.length > 0) {
                // Cek apakah arah maju saat ini masih ada di daftar move yang valid
                const canGoForward = validMoves.some(d => d.dx === this.patrolDir.dx && d.dy === this.patrolDir.dy);
                let chosenDir = null;

                if (canGoForward) {
                    // Jika di persimpangan (pilihan jalan > 2), ada 25% kemungkinan dia iseng belok
                    if (validMoves.length > 2 && Math.random() < 0.25) {
                        const turns = validMoves.filter(d => !(d.dx === -this.patrolDir.dx && d.dy === -this.patrolDir.dy));
                        chosenDir = turns[Math.floor(Math.random() * turns.length)];
                    } else {
                        chosenDir = this.patrolDir; // Lurus terus
                    }
                } else {
                    // Jika mentok dinding (harus belok), JANGAN putar balik kecuali terpaksa (jalan buntu)
                    const turns = validMoves.filter(d => !(d.dx === -this.patrolDir.dx && d.dy === -this.patrolDir.dy));
                    
                    if (turns.length > 0) {
                        chosenDir = turns[Math.floor(Math.random() * turns.length)];
                    } else {
                        // Jalan buntu, putar balik
                        chosenDir = { dx: -this.patrolDir.dx, dy: -this.patrolDir.dy };
                    }
                }

                this.patrolDir = chosenDir; // Ingat arah jalannya
                this.move(chosenDir.dx, chosenDir.dy);
            }
        }
    }

    move(dx, dy) {
        this.isMoving = true;
        
        this.gridX += dx;
        this.gridY += dy;
        
        const targetPx = (this.gridX * this.size) + (this.size / 2);
        const targetPy = (this.gridY * this.size) + (this.size / 2);

        this.scene.tweens.add({
            targets: this.graphics,
            x: targetPx,
            y: targetPy,
            duration: this.moveSpeed,
            onComplete: () => {
                this.isMoving = false;
            }
        });
    }

    drawDebugPath(path) {
        this.pathLine.clear();
        this.pathLine.lineStyle(2, 0xffaa00, 0.5);

        if (path.length === 0) return;

        this.pathLine.beginPath();
        const startPx = (this.gridX * this.size) + (this.size / 2);
        const startPy = (this.gridY * this.size) + (this.size / 2);
        this.pathLine.moveTo(startPx, startPy);

        for (const node of path) {
            const px = (node.x * this.size) + (this.size / 2);
            const py = (node.y * this.size) + (this.size / 2);
            this.pathLine.lineTo(px, py);
        }
        
        this.pathLine.strokePath();
    }
}
