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
            
            // Place the pair horizontally adjacent to each other
            const lifeForm1 = new LifeForm(species, x, y);
            const lifeForm2 = new LifeForm(species, x + 1, y);
            
            // Add them to the life forms array
            this.lifeForms.push(lifeForm1);
            this.lifeForms.push(lifeForm2);
            
            // Update species statistics
            species.totalSingles += 2; // They start as singles
            
            // Bond them together
            lifeForm1.bondWith(lifeForm2);
            
            this.ui.logEvent(`Created bonded pair of ${species.name} (${species.emoji || species.symbol}) at position (${x},${y})`);
        }
    }

    this.ui.updateGameField(this.lifeForms);
    this.ui.updateStats(this.species, this.totalCycles);
};

Game.prototype.gameLoop = function(): void {
    if (this.isPaused) return;
    
    this.totalCycles++;
    this.ui.logEvent(`--- Year / Iteration ${this.totalCycles} ---`);
    
    // Clear recently unbonded status from previous cycle
    for (const lifeForm of this.lifeForms) {
        lifeForm.clearRecentlyUnbonded();
    }
    
    // Process offspring unbonding from parents
    this.processOffspringUnbonding();
    
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

Game.prototype.processOffspringUnbonding = function(): void {
    for (const lifeForm of this.lifeForms) {
        if (lifeForm.state === LifeFormState.BONDED_TO_PARENT && lifeForm.unbondFromParent()) {
            // Move to a random location
            lifeForm.x = Math.floor(Math.random() * this.fieldWidth);
            lifeForm.y = Math.floor(Math.random() * this.fieldHeight);
            
            this.ui.logEvent(`Offspring ${lifeForm.species.emoji || lifeForm.species.symbol} matured and moved to position (${lifeForm.x},${lifeForm.y})`);
        }
    }
};

Game.prototype.processBirths = function(): void {
    const newLifeForms: LifeForm[] = [];
    
    for (const lifeForm of this.lifeForms) {
        if (lifeForm.canReproduce(this.lifeForms)) {
            // Find the midpoint between the bonded pair
            const midX = Math.floor((lifeForm.x + lifeForm.bondedWith.x) / 2);
            const midY = Math.floor((lifeForm.y + lifeForm.bondedWith.y) / 2);
            
            // Check if the midpoint is empty
            const midpointEmpty = !this.lifeForms.some(lf => lf.x === midX && lf.y === midY);
            
            if (midpointEmpty) {
                // Create offspring at the midpoint between parents
                const offspring = lifeForm.createOffspring(midX, midY);
                newLifeForms.push(offspring);
                
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) gave birth at (${midX},${midY})`);
            } else {
                // If midpoint is not empty, try to find a nearby empty space
                const x = this.findNearbyEmptySpace(lifeForm.x, lifeForm.y);
                const y = this.findNearbyEmptySpace(lifeForm.y, lifeForm.y);
                
                if (x !== -1 && y !== -1) {
                    const offspring = lifeForm.createOffspring(x, y);
                    newLifeForms.push(offspring);
                    
                    this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) gave birth at (${x},${y})`);
                }
            }
        }
    }
    
    this.lifeForms = [...this.lifeForms, ...newLifeForms];
};