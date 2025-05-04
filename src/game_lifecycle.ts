// This file contains the lifecycle methods for the Game class
// To be included with game_core.ts

// Add these methods to the Game class
interface Game {
    placeBondedPairs(): void;
    gameLoop(): void;
    processBirths(): void;
}

Game.prototype.placeBondedPairs = function(): void {
    this.lifeForms = [];
    
    for (const species of this.species) {
        // Place two bonded pairs for each species
        for (let i = 0; i < 2; i++) {
            // Find a random position for the pair
            const x = Math.floor(Math.random() * (this.fieldWidth - 2));
            const y = Math.floor(Math.random() * (this.fieldHeight - 1));
            
            const lifeForm1 = new LifeForm(species, x, y);
            const lifeForm2 = new LifeForm(species, x + 1, y);
            
            lifeForm1.bondWith(lifeForm2);
            
            this.lifeForms.push(lifeForm1);
            this.lifeForms.push(lifeForm2);
            
            species.totalSingles += 2; // They start as singles
            lifeForm1.bondWith(lifeForm2); // Then bond them
            
            this.ui.logEvent(`Created bonded pair of ${species.name} (${species.symbol}) at position (${x},${y})`);
        }
    }

    this.ui.updateGameField(this.lifeForms);
    this.ui.updateStats(this.species, this.totalCycles);
};

Game.prototype.gameLoop = function(): void {
    if (this.isPaused) return;
    
    this.totalCycles++;
    this.ui.logEvent(`--- Year / Iteration ${this.totalCycles} ---`);
    
    // Process births
    this.processBirths();
    
    // Process mutations
    this.processMutations();
    
    // Process movement and unbonding
    this.processMovementAndUnbonding();
    
    // Process deaths and aging
    this.processDeathsAndAging();
    
    // Process random events
    this.processRandomEvents();
    
    // Check for game over
    if (this.checkGameOver()) {
        this.endGame();
        return;
    }
    
    // Update UI
    this.ui.updateGameField(this.lifeForms);
    this.ui.updateStats(this.species, this.totalCycles);
};

Game.prototype.processBirths = function(): void {
    const newLifeForms: LifeForm[] = [];
    
    for (const lifeForm of this.lifeForms) {
        if (lifeForm.canReproduce(this.lifeForms)) {
            // Create offspring
            const x = this.findNearbyEmptySpace(lifeForm.x, lifeForm.y);
            const y = this.findNearbyEmptySpace(lifeForm.y, lifeForm.y);
            
            if (x !== -1 && y !== -1) {
                const offspring = new LifeForm(lifeForm.species, x, y);
                
                // Bond offspring to parent for first 20% of life
                offspring.state = LifeFormState.BONDED_TO_PARENT;
                offspring.bondedToParent = lifeForm;
                
                newLifeForms.push(offspring);
                
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.symbol}) gave birth at (${x},${y})`);
            }
        }
    }
    
    this.lifeForms = [...this.lifeForms, ...newLifeForms];
};