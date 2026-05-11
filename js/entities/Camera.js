export default class Camera {
    constructor(scene, gridX, gridY, direction, size, mapData) {
        this.scene = scene;
        this.size = size;
        this.gridX = gridX;
        this.gridY = gridY;
        this.mapData = mapData;
        
        // Direction: {dx, dy} contoh {dx: 0, dy: 1} menghadap bawah
        this.direction = direction; 
        
        const px = (gridX * size) + (size / 2);
        const py = (gridY * size) + (size / 2);
        
        // Visual Kamera (Kotak Putih Kecil)
        this.graphics = scene.add.rectangle(px, py, size * 0.6, size * 0.6, 0xffffff);
        
        this.visionLength = 4;
        this.visionCone = scene.add.graphics();
        
        // Cek update di setiap frame Phaser
        this.scene.events.on('update', this.update, this);
    }

    update() {
        if (this.scene.isGameOver || this.scene.isGameWon) return;

        const player = this.scene.player;
        if (!player) return;

        // Gambar vision cone (laser merah)
        this.visionCone.clear();
        this.visionCone.lineStyle(2, 0xff0000, 0.4);
        this.visionCone.fillStyle(0xff0000, 0.15);

        const startPx = (this.gridX * this.size) + (this.size / 2);
        const startPy = (this.gridY * this.size) + (this.size / 2);

        let endX = this.gridX;
        let endY = this.gridY;
        let distance = 0;

        // Raycast untuk mencari dinding terdekat agar sinar tidak tembus
        while (distance < this.visionLength) {
            endX += this.direction.dx;
            endY += this.direction.dy;
            if (this.mapData[endY] && this.mapData[endY][endX] === 1) {
                break;
            }
            distance++;
        }

        const endPx = (this.gridX + (this.direction.dx * distance)) * this.size + (this.size / 2);
        const endPy = (this.gridY + (this.direction.dy * distance)) * this.size + (this.size / 2);

        const spread = this.size * 0.8;
        let p1, p2, p3;
        
        // Segitiga sudut pandang
        if (this.direction.dx !== 0) { // Hadap horizontal
            p1 = { x: startPx, y: startPy };
            p2 = { x: endPx, y: endPy - spread };
            p3 = { x: endPx, y: endPy + spread };
        } else { // Hadap vertikal
            p1 = { x: startPx, y: startPy };
            p2 = { x: endPx - spread, y: endPy };
            p3 = { x: endPx + spread, y: endPy };
        }

        this.visionCone.fillTriangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

        // Deteksi Box Collision Player dengan garis pandang
        let playerDetected = false;
        if (this.direction.dx !== 0 && player.gridY === this.gridY) {
            let minX = Math.min(this.gridX, this.gridX + this.direction.dx * distance);
            let maxX = Math.max(this.gridX, this.gridX + this.direction.dx * distance);
            if (player.gridX >= minX && player.gridX <= maxX) playerDetected = true;
        } else if (this.direction.dy !== 0 && player.gridX === this.gridX) {
            let minY = Math.min(this.gridY, this.gridY + this.direction.dy * distance);
            let maxY = Math.max(this.gridY, this.gridY + this.direction.dy * distance);
            if (player.gridY >= minY && player.gridY <= maxY) playerDetected = true;
        }

        // Jika player terkena pandangan dan TIDAK bersembunyi di ventilasi (2)
        if (playerDetected && this.mapData[player.gridY][player.gridX] !== 2) {
            this.scene.triggerGameOver('TERTANGKAP KAMERA!');
        }
    }
}
