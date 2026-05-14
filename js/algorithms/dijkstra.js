/**
 * Mengubah coordinate grid menjadi ID string (contoh: "1,2")
 */
function toId(x, y) {
    return `${x},${y}`;
}

/**
 * Memecah ID kembali menjadi objek coordinate {x, y}
 */
function fromId(id) {
    const parts = id.split(',');
    return { x: parseInt(parts[0]), y: parseInt(parts[1]) };
}

/**
 * Algoritma Dijkstra murni untuk Grid 4-Arah
 * Mencari rute terpendek dengan menghindari dinding.
 * * @param {Array} mapData Array 2D grid map
 * @param {Object} start Posisi awal {x, y} dalam Grid
 * @param {Object} target Posisi tujuan {x, y} dalam Grid
 * @param {Boolean} allowVent Apakah boleh melewati ventilasi (kode 2)? (Default: false)
 * @returns {Array} Jalur Array berisi object {x, y} yang harus dilalui
 */
export function findShortestPath(mapData, start, target, allowVent = false) {
    const rows = mapData.length;
    const cols = mapData[0].length;

    // Jika target berada di dinding (1), ventilasi (2), atau di luar batas, batalkan
    if (target.y < 0 || target.y >= rows || target.x < 0 || target.x >= cols) {
        return []; 
    }
    
    const targetTile = mapData[target.y][target.x];
    if (targetTile === 1 || (!allowVent && targetTile === 2)) {
        return [];
    }

    const unvisited = new Set();
    const distances = {};
    const previous = {};

    // Inisialisasi graf
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r >= 0 && r < mapData.length && c >= 0 && c < mapData[0].length) {
                const tile = mapData[r][c];
                
                // Guard bisa jalan di Floor (0), Light (3), dan TALL GRASS (5).
                // Fitur Hint bisa jalan tembus Vent (2) jika allowVent = true
                if (tile === 0 || tile === 3 || tile === 5 || (allowVent && tile === 2)) {
                    const id = toId(c, r);
                    distances[id] = Infinity;
                    previous[id] = null;
                    unvisited.add(id);
                }
            }
        }
    }

    const startId = toId(start.x, start.y);
    if (distances[startId] === undefined) return [];

    distances[startId] = 0;

    while (unvisited.size > 0) {
        // Ambil node dengan jarak minimum
        let currentId = null;
        let minDistance = Infinity;
        
        for (const id of unvisited) {
            if (distances[id] < minDistance) {
                minDistance = distances[id];
                currentId = id;
            }
        }

        // Jika tidak ada jalan atau target tercapai
        if (currentId === null || currentId === toId(target.x, target.y)) {
            break;
        }

        unvisited.delete(currentId);
        const curr = fromId(currentId);

        // Tetangga murni 4-Arah
        const neighbors = [
            { x: curr.x, y: curr.y - 1 }, // Up
            { x: curr.x, y: curr.y + 1 }, // Down
            { x: curr.x - 1, y: curr.y }, // Left
            { x: curr.x + 1, y: curr.y }  // Right
        ];

        for (const n of neighbors) {
            const nId = toId(n.x, n.y);
            
            // Validasi: Apakah n bukan dinding (ada di dalam set unvisited)
            if (unvisited.has(nId)) {
                // Cost default lantai/rumput = 1 
                let cost = 1;
                
                const altDistance = distances[currentId] + cost;
                
                if (altDistance < distances[nId]) {
                    distances[nId] = altDistance;
                    previous[nId] = currentId;
                }
            }
        }
    }

    // Rekonstruksi rute dari target ke start
    const path = [];
    let currId = toId(target.x, target.y);
    
    // Jika tujuan tidak tercapai
    if (previous[currId] === undefined || (previous[currId] === null && currId !== startId)) {
        return [];
    }

    while (currId !== null) {
        path.unshift(fromId(currId));
        currId = previous[currId];
    }

    // Hapus titik posisi saat ini (start) dari jalur langkah yang akan diambil
    if (path.length > 0) {
        path.shift(); 
    }

    return path;
}
