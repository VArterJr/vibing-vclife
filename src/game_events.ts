// This file contains the event handling methods for the Game class
// To be included with game_core.ts, game_lifecycle.ts, and game_mutations.ts

// Add these methods to the Game class
interface Game {
    processDeathsAndAging(): void;
    processRandomEvents(): void;
    birthExplosion(): void;
    deathEvent(): void;
}

Game.prototype.processDeathsAndAging = function(): void {
    // Process deaths
    const survivingLifeForms: LifeForm[] = [];
    
    for (const lifeForm of this.lifeForms) {
        // Age the life form
        lifeForm.age++;
        
        // Check if the life form should die
        if (lifeForm.age >= lifeForm.species.maxLifespan || lifeForm.shouldDie()) {
            this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.symbol}) died at age ${lifeForm.age} at position (${lifeForm.x},${lifeForm.y})`);
            lifeForm.die();
        } else {
            survivingLifeForms.push(lifeForm);
        }
    }
    
    this.lifeForms = survivingLifeForms;
    
    // Remove species with no life forms
    const beforeCount = this.species.length;
    this.species = this.species.filter(species => 
        this.lifeForms.some(lifeForm => lifeForm.species.id === species.id)
    );
    
    if (beforeCount > this.species.length) {
        this.ui.logEvent(`${beforeCount - this.species.length} species went extinct`);
    }
};

Game.prototype.processRandomEvents = function(): void {
    // 1% chance of a birth explosion
    if (Math.random() < 0.01) {
        this.birthExplosion();
    }
    
    // 0.5% chance of a death event
    if (Math.random() < 0.005) {
        this.deathEvent();
    }
};

Game.prototype.birthExplosion = function(): void {
    // Choose a random species for the birth explosion
    if (this.species.length === 0) return;
    
    const randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
    const newLifeForms: LifeForm[] = [];
    
    // Create 5-10 new life forms of the selected species
    const count = Math.floor(Math.random() * 6) + 5;
    
    this.ui.logEvent(`BIRTH EXPLOSION: ${randomSpecies.name} (${randomSpecies.symbol}) is experiencing a birth explosion! ${count} new life forms created.`);
    
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * this.fieldWidth);
        const y = Math.floor(Math.random() * this.fieldHeight);
        
        const newLifeForm = new LifeForm(randomSpecies, x, y);
        newLifeForms.push(newLifeForm);
    }
    
    this.lifeForms = [...this.lifeForms, ...newLifeForms];
};

Game.prototype.deathEvent = function(): void {
    // Choose a random species for the death event
    if (this.species.length === 0) return;
    
    const randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
    
    // Kill 50-80% of the life forms of the selected species
    const deathRate = Math.random() * 0.3 + 0.5;
    const speciesCount = this.lifeForms.filter(lf => lf.species.id === randomSpecies.id).length;
    let deathCount = 0;
    
    this.ui.logEvent(`DEATH EVENT: ${randomSpecies.name} (${randomSpecies.symbol}) is experiencing a mass extinction!`);
    
    this.lifeForms = this.lifeForms.filter(lifeForm => {
        if (lifeForm.species.id === randomSpecies.id && Math.random() < deathRate) {
            lifeForm.die();
            deathCount++;
            return false;
        }
        return true;
    });
    
    this.ui.logEvent(`DEATH EVENT: ${deathCount} out of ${speciesCount} ${randomSpecies.name} (${randomSpecies.symbol}) life forms died`);
};