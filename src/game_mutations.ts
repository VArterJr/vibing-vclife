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
                
                // Calculate the midpoint between the two life forms
                const midX = Math.floor((lifeForm.x + otherLifeForm.x) / 2);
                const midY = Math.floor((lifeForm.y + otherLifeForm.y) / 2);
                
                // Check if the midpoint is empty
                const midpointEmpty = !this.lifeForms.some(lf => lf.x === midX && lf.y === midY);
                
                if (midpointEmpty) {
                    // Create a new life form of the mutated species at the midpoint
                    const mutatedLifeForm = new LifeForm(newSpecies, midX, midY);
                    newLifeForms.push(mutatedLifeForm);
                    
                    this.ui.logEvent(`MUTATION: ${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) and ${otherLifeForm.species.name} (${otherLifeForm.species.emoji || otherLifeForm.species.symbol}) created new species ${newSpecies.name} (${newSpecies.emoji || newSpecies.symbol})`);
                } else {
                    // Find a nearby empty space if midpoint is occupied
                    const x = this.findNearbyEmptySpace(lifeForm.x, lifeForm.y);
                    const y = this.findNearbyEmptySpace(lifeForm.y, lifeForm.y);
                    
                    if (x !== -1 && y !== -1) {
                        const mutatedLifeForm = new LifeForm(newSpecies, x, y);
                        newLifeForms.push(mutatedLifeForm);
                        
                        this.ui.logEvent(`MUTATION: ${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) and ${otherLifeForm.species.name} (${otherLifeForm.species.emoji || otherLifeForm.species.symbol}) created new species ${newSpecies.name} (${newSpecies.emoji || newSpecies.symbol})`);
                    }
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
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) pair unbonded`);
                
                // Unbond the pair - this will set recentlyUnbonded property
                lifeForm.unbond();
                
                // Keep them adjacent for this cycle with the - symbol between them
                // They'll move to random positions in the next cycle
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
                
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) pair moved from (${lifeForm.x},${lifeForm.y}) to (${newX1},${newY1})`);
                
                lifeForm.x = newX1;
                lifeForm.y = newY1;
                lifeForm.bondedWith.x = newX2;
                lifeForm.bondedWith.y = newY2;
            }
        } else if (lifeForm.recentlyUnbonded) {
            // Move recently unbonded life forms to random positions
            lifeForm.x = Math.floor(Math.random() * this.fieldWidth);
            lifeForm.y = Math.floor(Math.random() * this.fieldHeight);
            
            this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) moved to random position (${lifeForm.x},${lifeForm.y}) after unbonding`);
        }
    }
};