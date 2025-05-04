// This file contains the mutation methods for the Game class
// To be included with game_core.ts and game_lifecycle.ts

// Add these methods to the Game class
interface Game {
    processMutations(): void;
    processMovementAndUnbonding(): void;
}

Game.prototype.processMutations = function(): void {
    const newLifeForms: LifeForm[] = [];
    const processedPairs = new Set<string>();
    
    for (const lifeForm of this.lifeForms) {
        const [canMutate, otherLifeForm] = lifeForm.canMutate(this.lifeForms);
        
        if (canMutate && otherLifeForm) {
            // Create unique pair ID to avoid processing the same pair twice
            const pairId = [lifeForm.x, lifeForm.y, otherLifeForm.x, otherLifeForm.y].sort().join('-');
            
            if (!processedPairs.has(pairId)) {
                processedPairs.add(pairId);
                
                // Create a new species from mutation
                const newSpecies = Species.createMutation(lifeForm.species, otherLifeForm.species);
                this.species.push(newSpecies);
                
                // Create a new life form of the mutated species
                const x = this.findNearbyEmptySpace(lifeForm.x, lifeForm.y);
                const y = this.findNearbyEmptySpace(lifeForm.y, lifeForm.y);
                
                if (x !== -1 && y !== -1) {
                    const mutatedLifeForm = new LifeForm(newSpecies, x, y);
                    newLifeForms.push(mutatedLifeForm);
                    
                    this.ui.logEvent(`MUTATION: ${lifeForm.species.name} (${lifeForm.species.symbol}) and ${otherLifeForm.species.name} (${otherLifeForm.species.symbol}) created new species ${newSpecies.name} (${newSpecies.symbol})`);
                }
            }
        }
    }
    
    this.lifeForms = [...this.lifeForms, ...newLifeForms];
};

Game.prototype.processMovementAndUnbonding = function(): void {
    // Process bonded pairs for movement and unbonding
    const processedPairs = new Set<LifeForm>();
    
    for (const lifeForm of this.lifeForms) {
        if (lifeForm.state === LifeFormState.BONDED_PAIR && lifeForm.bondedWith && !processedPairs.has(lifeForm)) {
            processedPairs.add(lifeForm);
            processedPairs.add(lifeForm.bondedWith);
            
            // Check for unbonding
            if (lifeForm.shouldUnbond()) {
                lifeForm.unbond();
                
                // Move to random positions
                lifeForm.x = Math.floor(Math.random() * this.fieldWidth);
                lifeForm.y = Math.floor(Math.random() * this.fieldHeight);
                
                if (lifeForm.bondedWith) {
                    lifeForm.bondedWith.x = Math.floor(Math.random() * this.fieldWidth);
                    lifeForm.bondedWith.y = Math.floor(Math.random() * this.fieldHeight);
                }
                
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.symbol}) pair unbonded`);
            }
            // Check for movement
            else if (lifeForm.shouldMove()) {
                // Move in a random direction
                const dx = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                const dy = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                
                const newX1 = Math.max(0, Math.min(this.fieldWidth - 1, lifeForm.x + dx));
                const newY1 = Math.max(0, Math.min(this.fieldHeight - 1, lifeForm.y + dy));
                
                // Move bonded partner together
                const newX2 = Math.max(0, Math.min(this.fieldWidth - 1, lifeForm.bondedWith.x + dx));
                const newY2 = Math.max(0, Math.min(this.fieldHeight - 1, lifeForm.bondedWith.y + dy));
                
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.symbol}) pair moved from (${lifeForm.x},${lifeForm.y}) to (${newX1},${newY1})`);
                
                lifeForm.x = newX1;
                lifeForm.y = newY1;
                lifeForm.bondedWith.x = newX2;
                lifeForm.bondedWith.y = newY2;
            }
        }
    }
};