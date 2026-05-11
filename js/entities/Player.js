export default class Player {
    constructor(scene, gridX, gridY, size, mapData) {
        this.scene = scene;
        this.size = size;
        this.gridX = gridX;
        this.gridY = gridY;
        this.mapData = mapData;
        this.isMoving = false;
        
        // Kalkulasi posisi pixel tengah berdasarkan koordinat Grid
        const px = (gridX * size) + (size / 2);
        const py = (gridY * size) + (size / 2);

        // Placeholder Graphics: Kotak hijau untuk player
        this.graphics = scene.add.rectangle(px, py, size * 0.8, size * 0.8, 0x00ff00);
        
        // Kecepatan gerak antar tile dalam millisecond
        this.moveSpeed = 150; 
    }

    update(cursors, keys) {
        // Cegah input saat player masih bergerak (Snap to Grid)
        if (this.isMoving) return;

        let dx = 0;
        let dy = 0;

        // Logika 4-Arah murni
        if (cursors.left.isDown || keys.A.isDown) {
            dx = -1;
        } else if (cursors.right.isDown || keys.D.isDown) {
            dx = 1;
        } else if (cursors.up.isDown || keys.W.isDown) {
            dy = -1;
        } else if (cursors.down.isDown || keys.S.isDown) {
            dy = 1;
        }

        // Pindah jika ada input
        if (dx !== 0 || dy !== 0) {
            this.move(dx, dy);
        }
    }

    move(dx, dy) {
        const targetGridX = this.gridX + dx;
        const targetGridY = this.gridY + dy;

        // Cegah keluar dari batas frame canvas (out of bounds)
        if (targetGridY < 0 || targetGridY >= this.mapData.length || 
            targetGridX < 0 || targetGridX >= this.mapData[0].length) {
            return; 
        }

        // Cek Collision dengan Dinding (Angka 1 di array map = Wall)
        if (this.mapData[targetGridY][targetGridX] === 1) {
            return; 
        }

        this.isMoving = true;
        this.gridX = targetGridX;
        this.gridY = targetGridY;
        
        const targetPx = (this.gridX * this.size) + (this.size / 2);
        const targetPy = (this.gridY * this.size) + (this.size / 2);

        this.scene.tweens.add({
            targets: this.graphics,
            x: targetPx,
            y: targetPy,
            duration: this.moveSpeed,
            onComplete: () => {
                this.isMoving = false; // Boleh gerak lagi setelah tween selesai
            }
        });
    }
}
