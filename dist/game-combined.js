"use strict";
var LifeFormState;
(function (LifeFormState) {
    LifeFormState[LifeFormState["SINGLE"] = 0] = "SINGLE";
    LifeFormState[LifeFormState["BONDED_PAIR"] = 1] = "BONDED_PAIR";
    LifeFormState[LifeFormState["BONDED_TO_PARENT"] = 2] = "BONDED_TO_PARENT";
})(LifeFormState || (LifeFormState = {}));
class LifeForm {
    constructor(species, x, y) {
        this.age = 0;
        this.state = LifeFormState.SINGLE;
        this.bondedWith = null;
        this.bondedToParent = null;
        this.species = species;
        this.x = x;
        this.y = y;
        // Increment the born count for this species
        this.species.totalBorn++;
    }
    getAgePercentage() {
        return this.age / this.species.maxLifespan;
    }
    getColor() {
        const agePercentage = this.getAgePercentage();
        if (agePercentage < 0.2) {
            return "white";
        }
        else if (agePercentage < 0.4) {
            return "lightblue";
        }
        else if (agePercentage < 0.6) {
            return "green";
        }
        else if (agePercentage < 0.8) {
            return "orange";
        }
        else {
            return "red";
        }
    }
    shouldDie() {
        // Base chance of death (1-5%)
        let deathChance = Math.random() * 4 + 1;
        // Additional chance based on age
        const agePercentage = this.getAgePercentage();
        if (agePercentage < 0.2) {
            // 1-10% chance for first 20% of life
            deathChance += Math.random() * 9 + 1;
        }
        else if (agePercentage < 0.4) {
            // 1-5% chance for next 20%
            deathChance += Math.random() * 4 + 1;
        }
        else if (agePercentage < 0.6) {
            // 1-5% chance for next 20%
            deathChance += Math.random() * 4 + 1;
        }
        else if (agePercentage < 0.8) {
            // 10-20% chance for next 20%
            deathChance += Math.random() * 10 + 10;
        }
        else {
            // 50% chance for final 20%
            deathChance += 50;
        }
        return Math.random() * 100 < deathChance;
    }
    die() {
        // Update species statistics
        this.species.totalDied++;
        this.species.sumAgeAtDeath += this.age;
        if (this.state === LifeFormState.BONDED_PAIR) {
            this.species.totalBondedPairs--;
            // Update the bonded partner
            if (this.bondedWith) {
                this.bondedWith.bondedWith = null;
                this.bondedWith.state = LifeFormState.SINGLE;
                this.species.totalSingles++;
            }
        }
        else if (this.state === LifeFormState.SINGLE) {
            this.species.totalSingles--;
        }
    }
    bondWith(other) {
        if (this.state === LifeFormState.SINGLE && other.state === LifeFormState.SINGLE) {
            this.bondedWith = other;
            other.bondedWith = this;
            this.state = LifeFormState.BONDED_PAIR;
            other.state = LifeFormState.BONDED_PAIR;
            this.species.totalSingles -= 2;
            this.species.totalBondedPairs++;
        }
    }
    unbond() {
        if (this.state === LifeFormState.BONDED_PAIR && this.bondedWith) {
            this.bondedWith.bondedWith = null;
            this.bondedWith.state = LifeFormState.SINGLE;
            this.bondedWith = null;
            this.state = LifeFormState.SINGLE;
            this.species.totalBondedPairs--;
            this.species.totalSingles += 2;
        }
    }
    shouldUnbond() {
        // 5% chance of unbonding
        return Math.random() < 0.05;
    }
    shouldMove() {
        // 10% chance of moving
        return Math.random() < 0.1;
    }
    canReproduce(otherLifeForms) {
        // Only bonded pairs can reproduce
        if (this.state !== LifeFormState.BONDED_PAIR || !this.bondedWith) {
            return false;
        }
        // Check if touching other life forms of the same species
        const touchingSameSpecies = otherLifeForms.some(lifeForm => {
            if (lifeForm === this || lifeForm === this.bondedWith)
                return false;
            if (lifeForm.species.id !== this.species.id)
                return false;
            // Check if adjacent
            const dx = Math.abs(this.x - lifeForm.x);
            const dy = Math.abs(this.y - lifeForm.y);
            return (dx <= 1 && dy <= 1);
        });
        if (touchingSameSpecies) {
            return false;
        }
        // 1-50% chance of spawning offspring
        return Math.random() < 0.5;
    }
    canMutate(otherLifeForms) {
        // Check for life forms of different species touching
        for (const lifeForm of otherLifeForms) {
            if (lifeForm === this)
                continue;
            if (lifeForm.species.id === this.species.id)
                continue;
            // Check if adjacent
            const dx = Math.abs(this.x - lifeForm.x);
            const dy = Math.abs(this.y - lifeForm.y);
            if (dx <= 1 && dy <= 1) {
                // Check if touching other life forms of the same species
                const touchingSameSpecies = otherLifeForms.some(other => {
                    if (other === this || other === lifeForm)
                        return false;
                    if (other.species.id !== this.species.id)
                        return false;
                    // Check if adjacent to this
                    const dx1 = Math.abs(this.x - other.x);
                    const dy1 = Math.abs(this.y - other.y);
                    return (dx1 <= 1 && dy1 <= 1);
                });
                if (!touchingSameSpecies) {
                    // 1% chance of mutation
                    if (Math.random() < 0.01) {
                        return [true, lifeForm];
                    }
                }
            }
        }
        return [false, null];
    }
}
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
class UI {
    constructor() {
        this.fieldWidth = 80;
        this.fieldHeight = 30;
        this.field = [];
        this.gameField = document.getElementById('game-field');
        this.statsPanel = document.getElementById('stats-panel');
        this.setupPanel = document.getElementById('setup-panel');
        this.gameContainer = document.getElementById('game-container');
        this.pauseResumeButton = document.getElementById('pause-resume');
        this.resetButton = document.getElementById('reset-game');
        this.leftPanel = document.getElementById('left-panel');
        this.eventLog = document.getElementById('event-log-content');
        this.lastUpdatedSpan = document.getElementById('last-updated');
        // Set the last updated date
        this.lastUpdatedSpan.textContent = new Date().toLocaleDateString();
        // Initialize the field with empty spaces
        this.initializeField();
        // Add window resize event listener
        window.addEventListener('resize', () => this.handleResize());
        // Initial resize
        this.handleResize();
    }
    handleResize() {
        // Adjust container height based on window size
        const container = document.querySelector('.container');
        if (container) {
            container.style.height = `${window.innerHeight - 60}px`;
        }
    }
    initializeField() {
        this.field = [];
        for (let y = 0; y < this.fieldHeight; y++) {
            this.field[y] = [];
            for (let x = 0; x < this.fieldWidth; x++) {
                this.field[y][x] = ' ';
            }
        }
    }
    showSetupPanel() {
        this.setupPanel.style.display = 'block';
        this.gameContainer.style.display = 'none';
        this.pauseResumeButton.style.display = 'none';
        this.resetButton.style.display = 'none';
    }
    showGamePanel() {
        this.setupPanel.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        this.pauseResumeButton.style.display = 'inline-block';
        this.resetButton.style.display = 'inline-block';
        // Clear the event log
        this.eventLog.innerHTML = '';
        // Trigger resize to ensure proper layout
        this.handleResize();
    }
    updateGameField(lifeForms) {
        // Clear the field
        this.initializeField();
        // First pass: mark bond connections with +
        for (const lifeForm of lifeForms) {
            if (lifeForm.bondedWith) {
                // Find the midpoint between bonded pairs
                const midX = Math.floor((lifeForm.x + lifeForm.bondedWith.x) / 2);
                const midY = Math.floor((lifeForm.y + lifeForm.bondedWith.y) / 2);
                // If they're adjacent, place a + between them
                if (Math.abs(lifeForm.x - lifeForm.bondedWith.x) <= 1 &&
                    Math.abs(lifeForm.y - lifeForm.bondedWith.y) <= 1 &&
                    midX >= 0 && midX < this.fieldWidth &&
                    midY >= 0 && midY < this.fieldHeight) {
                    this.field[midY][midX] = '+';
                }
            }
            // Also connect offspring to parents
            if (lifeForm.state === LifeFormState.BONDED_TO_PARENT && lifeForm.bondedToParent) {
                // Find the midpoint between offspring and parent
                const midX = Math.floor((lifeForm.x + lifeForm.bondedToParent.x) / 2);
                const midY = Math.floor((lifeForm.y + lifeForm.bondedToParent.y) / 2);
                // If they're adjacent, place a + between them
                if (Math.abs(lifeForm.x - lifeForm.bondedToParent.x) <= 1 &&
                    Math.abs(lifeForm.y - lifeForm.bondedToParent.y) <= 1 &&
                    midX >= 0 && midX < this.fieldWidth &&
                    midY >= 0 && midY < this.fieldHeight) {
                    this.field[midY][midX] = '+';
                }
            }
        }
        // Second pass: place life forms
        for (const lifeForm of lifeForms) {
            if (lifeForm.x >= 0 && lifeForm.x < this.fieldWidth &&
                lifeForm.y >= 0 && lifeForm.y < this.fieldHeight) {
                this.field[lifeForm.y][lifeForm.x] = lifeForm.species.symbol;
            }
        }
        // Render the field
        let html = '';
        for (let y = 0; y < this.fieldHeight; y++) {
            for (let x = 0; x < this.fieldWidth; x++) {
                // Find the life form at this position to get its color
                const lifeForm = lifeForms.find(lf => lf.x === x && lf.y === y);
                if (lifeForm) {
                    // Wrap life form symbol in square brackets
                    html += `<span style="color: ${lifeForm.getColor()}">[${this.field[y][x]}]</span>`;
                }
                else if (this.field[y][x] === '+') {
                    // Show connection symbol in white
                    html += `<span style="color: white">${this.field[y][x]}</span>`;
                }
                else {
                    html += this.field[y][x];
                }
            }
            html += '<br>';
        }
        this.gameField.innerHTML = html;
    }
    updateStats(species, totalCycles) {
        // Update the right panel with detailed species stats
        let statsHtml = '';
        for (const sp of species) {
            statsHtml += `<div class="species-stats">
                <h3>${sp.name} <span style="color: white">${sp.symbol}</span></h3>
                <p>Max Lifespan: ${sp.maxLifespan}</p>
                <p>Total Born: ${sp.totalBorn}</p>
                <p>Total Died: ${sp.totalDied}</p>
                <p>Alive: ${sp.totalBorn - sp.totalDied}</p>
                <p>Avg Age at Death: ${sp.getAverageAgeAtDeath().toFixed(1)}</p>
                <p>Bonded Pairs: ${sp.totalBondedPairs}</p>
                <p>Singles: ${sp.totalSingles}</p>
            </div>`;
        }
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = statsHtml;
        // Update the left panel with basic game info
        let gameInfoHtml = `
            <p><strong>Year / Iteration:</strong> ${totalCycles}</p>
            <p><strong>Species:</strong></p>
            <p>- Generated: ${species.length}</p>
            <p>- Alive: ${species.filter(s => s.totalBorn - s.totalDied > 0).length}</p>
            <p><strong>Life Forms:</strong></p>
        `;
        let totalBorn = 0;
        let totalAlive = 0;
        let totalDied = 0;
        for (const sp of species) {
            totalBorn += sp.totalBorn;
            totalDied += sp.totalDied;
            totalAlive += (sp.totalBorn - sp.totalDied);
            gameInfoHtml += `<p>${sp.symbol}: ${sp.totalBorn - sp.totalDied} alive</p>`;
        }
        gameInfoHtml += `
            <p><strong>Total Born:</strong> ${totalBorn}</p>
            <p><strong>Total Alive:</strong> ${totalAlive}</p>
            <p><strong>Total Died:</strong> ${totalDied}</p>
        `;
        const gameInfoContent = document.getElementById('game-info-content');
        if (gameInfoContent) {
            gameInfoContent.innerHTML = gameInfoHtml;
        }
        else {
            console.error("Could not find game-info-content element");
        }
    }
    logEvent(message) {
        if (!this.eventLog) {
            console.error("Event log element not found");
            return;
        }
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        this.eventLog.appendChild(logEntry);
        this.eventLog.scrollTop = this.eventLog.scrollHeight; // Auto-scroll to bottom
    }
    showGameOver(species, totalCycles) {
        let message = `<h2>Game Over</h2>
                      <p>Total Cycles: ${totalCycles}</p>`;
        if (species.length === 0) {
            message += '<p>All species have gone extinct!</p>';
            this.logEvent("GAME OVER: All species have gone extinct!");
        }
        else if (species.length === 1) {
            message += `<p>Only ${species[0].name} (${species[0].symbol}) survived!</p>`;
            this.logEvent(`GAME OVER: Only ${species[0].name} (${species[0].symbol}) survived!`);
        }
        this.gameField.innerHTML = message;
    }
    getFieldDimensions() {
        return [this.fieldWidth, this.fieldHeight];
    }
    setPauseButtonState(isPaused) {
        if (isPaused) {
            this.pauseResumeButton.textContent = 'Resume';
            this.pauseResumeButton.classList.add('paused');
            this.logEvent("Game paused");
        }
        else {
            this.pauseResumeButton.textContent = 'Pause';
            this.pauseResumeButton.classList.remove('paused');
            this.logEvent("Game resumed");
        }
    }
}
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
        this.ui.logEvent(`Game started with ${speciesCount} species`);
        this.gameInterval = window.setInterval(() => this.gameLoop(), 500);
    }
    initializeSpecies(count) {
        this.species = [];
        for (let i = 0; i < count; i++) {
            const newSpecies = new Species();
            this.species.push(newSpecies);
            this.ui.logEvent(`Created ${newSpecies.name} (${newSpecies.symbol}) with max lifespan of ${newSpecies.maxLifespan}`);
        }
    }
}
// This file contains the lifecycle methods for the Game class
// To be included with game_core.ts
Game.prototype.placeBondedPairs = function () {
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
Game.prototype.gameLoop = function () {
    if (this.isPaused)
        return;
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
Game.prototype.processBirths = function () {
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
                this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.symbol}) gave birth at (${x},${y})`);
            }
        }
    }
    this.lifeForms = [...this.lifeForms, ...newLifeForms];
};
// This file contains the mutation methods for the Game class
// To be included with game_core.ts and game_lifecycle.ts
Game.prototype.processMutations = function () {
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
                    this.ui.logEvent(`MUTATION: ${lifeForm.species.name} (${lifeForm.species.symbol}) and ${otherLifeForm.species.name} (${otherLifeForm.species.symbol}) created new species ${newSpecies.name} (${newSpecies.symbol})`);
                }
            }
        }
    }
    this.lifeForms = [...this.lifeForms, ...newLifeForms];
};
Game.prototype.processMovementAndUnbonding = function () {
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
// This file contains the event handling methods for the Game class
// To be included with game_core.ts, game_lifecycle.ts, and game_mutations.ts
Game.prototype.processDeathsAndAging = function () {
    // Process deaths
    const survivingLifeForms = [];
    for (const lifeForm of this.lifeForms) {
        // Age the life form
        lifeForm.age++;
        // Check if the life form should die
        if (lifeForm.age >= lifeForm.species.maxLifespan || lifeForm.shouldDie()) {
            this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.symbol}) died at age ${lifeForm.age} at position (${lifeForm.x},${lifeForm.y})`);
            lifeForm.die();
        }
        else {
            survivingLifeForms.push(lifeForm);
        }
    }
    this.lifeForms = survivingLifeForms;
    // Remove species with no life forms
    const beforeCount = this.species.length;
    this.species = this.species.filter(species => this.lifeForms.some(lifeForm => lifeForm.species.id === species.id));
    if (beforeCount > this.species.length) {
        this.ui.logEvent(`${beforeCount - this.species.length} species went extinct`);
    }
};
Game.prototype.processRandomEvents = function () {
    // 1% chance of a birth explosion
    if (Math.random() < 0.01) {
        this.birthExplosion();
    }
    // 0.5% chance of a death event
    if (Math.random() < 0.005) {
        this.deathEvent();
    }
};
Game.prototype.birthExplosion = function () {
    // Choose a random species for the birth explosion
    if (this.species.length === 0)
        return;
    const randomSpecies = this.species[Math.floor(Math.random() * this.species.length)];
    const newLifeForms = [];
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
Game.prototype.deathEvent = function () {
    // Choose a random species for the death event
    if (this.species.length === 0)
        return;
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
// This file contains utility methods for the Game class
// To be included with game_core.ts, game_lifecycle.ts, game_mutations.ts, and game_events.ts
Game.prototype.findNearbyEmptySpace = function (x, y) {
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
};
Game.prototype.checkGameOver = function () {
    return this.lifeForms.length === 0 || this.lifeForms.length === 1;
};
Game.prototype.endGame = function () {
    if (this.gameInterval !== null) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
    }
    this.ui.showGameOver(this.species, this.totalCycles);
};
Game.prototype.togglePause = function () {
    this.isPaused = !this.isPaused;
    this.ui.setPauseButtonState(this.isPaused);
};
Game.prototype.resetGame = function () {
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
