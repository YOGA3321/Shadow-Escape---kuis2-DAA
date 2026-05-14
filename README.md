# Shadow Escape: Advanced Stealth Game

Shadow Escape is a high-stakes 2D web-based stealth game built using the **Phaser 3** framework. Players must navigate through complex mazes, avoid advanced AI guards and CCTV systems, and reach the exit point to progress through 5 increasingly difficult levels.

## 📁 Project Structure & File Paths

```text
.
├── index.html              # Main entry point and Sidebar UI
├── style.css               # Styling for the UI and game container
├── README.md               # Technical documentation
└── js/
    ├── main.js             # Phaser configuration and scene launcher
    ├── phaser.min.js       # Phaser 3 Game Engine library
    ├── algorithms/
    │   └── dijkstra.js     # Shortest path algorithm for AI and hints
    ├── entities/
    │   ├── Player.js       # Player mechanics and input handling
    │   ├── Guard.js        # Advanced AI Guard logic and FOV
    │   └── Camera.js       # CCTV Camera sweep and detection logic
    ├── maps/
    │   ├── level1.js       # Level 1 layout (Intro)
    │   ├── level2.js       # Level 2 layout (Medium)
    │   ├── level3.js       # Level 3 layout (Complex)
    │   ├── level4.js       # Level 4 layout (Hard)
    │   └── level5.js       # Level 5 (The Mega Cube - DFS Generated)
    └── scenes/
        └── GameScene.js    # Main game scene and logic orchestration
```

## 🎮 Core Gameplay Mechanics

- **Stealth Navigation**: Move silently through the shadows. Use Vents (2) to hide from guards and Grass (5) to reduce your visibility.
- **AI Guard System**: Guards use the **Dijkstra Algorithm** for pathfinding. They have three states:
    - **PATROL**: Moving between random points or fixed paths (Orange).
    - **SUSPICIOUS**: Investigating a noise (Decoy) or a sighting (Yellow).
    - **CHASE**: Pursuing the player with high speed once detected (Red).
- **CCTV Systems**: Stationary white cameras with rotating laser sweeps. Crossing a laser triggers an immediate Game Over.
- **Light & Dark Areas**: Visibility is dynamic. Standing under Light sources (Yellow Tiles) makes you easier to spot.
- **Decoy System**: Press **Spacebar** to throw a decoy that distracts nearby guards.
- **Hint System**: Collect coins to unlock path hints. 
    - 2 Coins = Half-path hint.
    - 5 Coins = Full path to exit.
- **Pause System**: Press **'P'** to freeze all entities, tweens, and game logic.

## 🛠️ Technical Implementation

### Algorithms
1. **Dijkstra's Algorithm (`js/algorithms/dijkstra.js`)**: Used for calculating the most efficient path for Guards and the Player's hint line. It handles grid weights to avoid walls.
2. **DFS Recursive Backtracking (`js/maps/level5.js`)**: Generates a 81x81 "Perfect Maze" dynamically. It ensures that every part of the maze is reachable from the start (79,79) to the finish (1,1).
3. **Bresenham's Line Algorithm**: Implemented within `Guard.js` to handle Line-of-Sight (LoS) checks, ensuring guards cannot see through walls.

### OOP (Object Oriented Programming)
Each entity (Player, Guard, Camera) is a self-contained class, allowing for modular updates and high scalability. The `GameScene.js` acts as the Controller, managing the interaction between these objects.

---
*Developed for Design and Analysis of Algorithms (DAA) Course Project.*
