"use strict";
class Game {
    constructor() {
        this.species = [];
        this.lifeForms = [];
        this.gameInterval = null;
        this.isPaused = false;
        this.totalCycles = 0;
        this.ui = new UI();
        [this.fieldWidth, this.fieldHeight] = this.ui.getFieldDimensions();
        this.setupEventListeners();
    }
    setupEventListeners() {
        const startButton = document.getElementById('start-game');
        startButton.addEventListener('click', () => this.startGame());
        const pauseResumeButton = document.getElementById('pause-resume');
        pauseResumeButton.addEventListener('click', () => this.togglePause());
        const resetButton = document.getElementById('reset-game');
        resetButton.addEventListener('click', () => this.resetGame());
    }
    startGame() {
        const speciesCountInput = document.getElementById('species-count');
        const speciesCount = parseInt(speciesCountInput.value, 10);
        if (isNaN(speciesCount) || speciesCount < 1) {
            alert('Please enter a valid number of species');
            return;
        }
        this.ui.showGamePanel();
        this.initializeSpecies(speciesCount);
        this.placeBondedPairs();
        this.gameInterval = window.setInterval(() => this.gameLoop(), 500);
    }
    initializeSpecies(count) {
        this.species = [];
        for (let i = 0; i < count; i++) {
            this.species.push(new Species());
        }
    }
    placeBondedPairs() {
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
            }
        }
        this.ui.updateGameField(this.lifeForms);
        this.ui.updateStats(this.species, this.totalCycles);
    }
    gameLoop() {
        if (this.isPaused)
            return;
        this.totalCycles++;
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
    }
    processBirths() {
        const newLifeForms = [];
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
                }
            }
        }
        this.lifeForms = [...this.lifeForms, ...newLifeForms];
    }
    processMutations() {
        const newLifeForms = [];
        const processedPairs = new Set();
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
                    }
                }
            }
        }
        this.lifeForms = [...this.lifeForms, ...newLifeForms];
    }
    processMovementAndUnbonding() {
        // Process bonded pairs for movement and unbonding
        const processedPairs = new Set();
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
                    lifeForm.x = newX1;
                    lifeForm.y = newY1;
                    lifeForm.bondedWith.x = newX2;
                    lifeForm.bondedWith.y = newY2;
                }
            }
        }
    }
    processDeathsAndAging() {
        // Process deaths
        const survivingLifeForms = [];
        for (const lifeForm of this.lifeForms) {
            // Age the life form
            lifeForm.age++;
            // Check if the life form should die
            if (lifeForm.age >= lifeForm.species.maxLifespan || lifeForm.shouldDie()) {
                lifeForm.die();
            }
            else {
                survivingLifeForms.push(lifeForm);
            }
        }
        this.lifeForms = survivingLifeForms;
        // Remove species with no life forms
        this.species = this.species.filter(species => this.lifeForms.some(lifeForm => lifeForm.species.id === species.id));
    }
    processRandomEvents() {
        // 1% chance of a birth explosion
        if (Math.random() < 0.01) {
            this.birthExplosion();
        }
        // 0.5% chance of a death event
        if (Math.random() < 0.005) {
            this.deathEvent();
        }
    }
    birthExplosion() {
        // Choose a random species for the birth explosion
        if (this.species.length === 0)
            return;
        const randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
        const newLifeForms = [];
        // Create 5-10 new life forms of the selected species
        const count = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * this.fieldWidth);
            const y = Math.floor(Math.random() * this.fieldHeight);
            const newLifeForm = new LifeForm(randomSpecies, x, y);
            newLifeForms.push(newLifeForm);
        }
        this.lifeForms = [...this.lifeForms, ...newLifeForms];
    }
    deathEvent() {
        // Choose a random species for the death event
        if (this.species.length === 0)
            return;
        const randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
        // Kill 50-80% of the life forms of the selected species
        const deathRate = Math.random() * 0.3 + 0.5;
        this.lifeForms = this.lifeForms.filter(lifeForm => {
            if (lifeForm.species.id === randomSpecies.id && Math.random() < deathRate) {
                lifeForm.die();
                return false;
            }
            return true;
        });
    }
    findNearbyEmptySpace(x, y) {
        const positions = [
            [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
            [x - 1, y], [x + 1, y],
            [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
        ];
        // Filter valid positions
        const validPositions = positions.filter(([nx, ny]) => nx >= 0 && nx < this.fieldWidth && ny >= 0 && ny < this.fieldHeight);
        // Check if any position is empty
        for (const [nx, ny] of validPositions) {
            if (!this.lifeForms.some(lf => lf.x === nx && lf.y === ny)) {
                return nx;
            }
        }
        return -1;
    }
    checkGameOver() {
        return this.lifeForms.length === 0 || this.lifeForms.length === 1;
    }
    endGame() {
        if (this.gameInterval !== null) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.ui.showGameOver(this.species, this.totalCycles);
    }
    togglePause() {
        this.isPaused = !this.isPaused;
        this.ui.setPauseButtonState(this.isPaused);
    }
    resetGame() {
        if (this.gameInterval !== null) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.species = [];
        this.lifeForms = [];
        this.totalCycles = 0;
        this.isPaused = false;
        this.ui.showSetupPanel();
    }
}
// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
