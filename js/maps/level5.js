// js/maps/level5.js
// FINAL LEVEL: "THE MEGA CUBE" (81x81 Perfect Maze)
// Menggunakan algoritma DFS untuk menjamin jalur selalu ada.

const size = 81; // Harus ganjil agar grid-based maze rapi
const grid = Array.from({ length: size }, () => Array(size).fill(1));

function generateMaze(x, y) {
    grid[y][x] = 0;

    const dirs = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
            grid[y + dy / 2][x + dx / 2] = 0; // Hancurkan tembok di antara
            generateMaze(nx, ny);
        }
    }
}

// Mulai generate dari titik Finish (Top Left) agar jalur utama terbentuk
generateMaze(1, 1);

// Tambahkan beberapa "lubang" ekstra agar labirin tidak terlalu linear (opsional)
for (let i = 0; i < 150; i++) {
    const rx = Math.floor(Math.random() * (size - 2)) + 1;
    const ry = Math.floor(Math.random() * (size - 2)) + 1;
    if (grid[ry][rx] === 1) grid[ry][rx] = 0;
}

// Tambahkan elemen gameplay (Lampu, Rumput, Vent)
for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] === 0) {
            const rand = Math.random();
            if (rand < 0.05) grid[y][x] = 3; // Light
            else if (rand < 0.10) grid[y][x] = 5; // Grass
            else if (rand < 0.12) grid[y][x] = 2; // Vent
        }
    }
}

// Pastikan titik Start dan Finish bersih
grid[1][1] = 0;
grid[size - 2][size - 2] = 0;

export default grid;


