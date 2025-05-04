// This file contains utility methods for the Game class
// To be included with game_core.ts, game_lifecycle.ts, game_mutations.ts, and game_events.ts

// Add these methods to the Game class
interface Game {
    findNearbyEmptySpace(x: number, y: number): number;
    checkGameOver(): boolean;
    endGame(): void;
    togglePause(): void;
    resetGame(): void;
}

Game.prototype.findNearbyEmptySpace = function(x: number, y: number): number {
    const positions = [
        [x-1, y-1], [x, y-1], [x+1, y-1],
        [x-1, y],             [x+1, y],
        [x-1, y+1], [x, y+1], [x+1, y+1]
    ];
    
    // Filter valid positions
    const validPositions = positions.filter(([nx, ny]) => 
        nx >= 0 && nx < this.fieldWidth && ny >= 0 && ny < this.fieldHeight
    );
    
    // Check if any position is empty
    for (const [nx, ny] of validPositions) {
        if (!this.lifeForms.some(lf => lf.x === nx && lf.y === ny)) {
            return nx;
        }
    }
    
    return -1;
};

Game.prototype.checkGameOver = function(): boolean {
    return this.lifeForms.length === 0 || this.lifeForms.length === 1;
};

Game.prototype.endGame = function(): void {
    if (this.gameInterval !== null) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
    }
    
    this.ui.showGameOver(this.species, this.totalCycles);
};

Game.prototype.togglePause = function(): void {
    this.isPaused = !this.isPaused;
    this.ui.setPauseButtonState(this.isPaused);
};

Game.prototype.resetGame = function(): void {
    if (this.gameInterval !== null) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
    }
    
    this.species = [];
    this.lifeForms = [];
    this.totalCycles = 0;
    this.isPaused = false;
    
    this.ui.logEvent("Game reset");
    this.ui.showSetupPanel();
};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});