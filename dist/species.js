"use strict";
class Species {
    constructor(symbol, maxLifespan) {
        // Statistics
        this.totalBorn = 0;
        this.totalDied = 0;
        this.totalBondedPairs = 0;
        this.totalSingles = 0;
        this.sumAgeAtDeath = 0;
        this.id = Species.nextId++;
        // Generate a random ASCII character if not provided
        this.symbol = symbol || this.generateRandomSymbol();
        // Generate a random lifespan between 10 and 100 if not provided
        this.maxLifespan = maxLifespan || this.generateRandomLifespan();
        // Generate a simple name based on ID
        this.name = `Species-${this.id}`;
    }
    generateRandomSymbol() {
        // ASCII printable characters (excluding space and control characters)
        const chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        return chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generateRandomLifespan() {
        // Random lifespan between 10 and 100
        return Math.floor(Math.random() * 91) + 10;
    }
    getAverageAgeAtDeath() {
        if (this.totalDied === 0)
            return 0;
        return this.sumAgeAtDeath / this.totalDied;
    }
    getStats() {
        return `
Species: ${this.name} (${this.symbol})
Max Lifespan: ${this.maxLifespan}
Total Born: ${this.totalBorn}
Total Died: ${this.totalDied}
Avg Age at Death: ${this.getAverageAgeAtDeath().toFixed(1)}
Bonded Pairs: ${this.totalBondedPairs}
Singles: ${this.totalSingles}
        `.trim();
    }
    static createMutation(parent1, parent2) {
        // Create a new species based on the average properties of the parents
        const avgLifespan = Math.floor((parent1.maxLifespan + parent2.maxLifespan) / 2);
        // Create a new symbol by combining the parent symbols
        const newSymbol = String.fromCharCode(Math.floor((parent1.symbol.charCodeAt(0) + parent2.symbol.charCodeAt(0)) / 2));
        return new Species(newSymbol, avgLifespan);
    }
}
Species.nextId = 1;
