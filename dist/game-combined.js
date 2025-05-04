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
        this.recentlyUnbonded = null; // Track recently unbonded partner
        this.isOffspring = false;
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
        // Update offspring statistics if this is an offspring
        if (this.isOffspring) {
            this.species.totalOffspringDied++;
        }
        if (this.state === LifeFormState.BONDED_PAIR) {
            this.species.totalUnbondedPairs++;
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
        else if (this.state === LifeFormState.BONDED_TO_PARENT) {
            // Handle death of offspring bonded to parent
            if (this.bondedToParent) {
                this.bondedToParent.bondedToParent = null;
            }
        }
        // Clear the recently unbonded reference
        this.recentlyUnbonded = null;
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
            // Store reference to the partner that's being unbonded
            this.recentlyUnbonded = this.bondedWith;
            this.bondedWith.recentlyUnbonded = this;
            // Update state
            this.bondedWith.bondedWith = null;
            this.bondedWith.state = LifeFormState.SINGLE;
            this.bondedWith = null;
            this.state = LifeFormState.SINGLE;
            this.species.totalUnbondedPairs++;
            this.species.totalSingles += 2;
        }
    }
    clearRecentlyUnbonded() {
        // Clear the recently unbonded reference after one cycle
        this.recentlyUnbonded = null;
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
    createOffspring(x, y) {
        // Create a new life form of the same species
        const offspring = new LifeForm(this.species, x, y);
        // Mark as offspring and bond to parent
        offspring.isOffspring = true;
        offspring.state = LifeFormState.BONDED_TO_PARENT;
        offspring.bondedToParent = this;
        // Update species statistics
        this.species.totalOffspring++;
        return offspring;
    }
    unbondFromParent() {
        // Only unbond if in second 20% of life
        if (this.state === LifeFormState.BONDED_TO_PARENT &&
            this.bondedToParent &&
            this.getAgePercentage() >= 0.2) {
            // Update parent's reference
            if (this.bondedToParent.bondedToParent === this) {
                this.bondedToParent.bondedToParent = null;
            }
            // Update own state
            this.bondedToParent = null;
            this.state = LifeFormState.SINGLE;
            this.species.totalSingles++;
            return true;
        }
        return false;
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
        this.totalUnbondedPairs = 0;
        this.totalSingles = 0;
        this.totalOffspring = 0;
        this.totalOffspringDied = 0;
        this.sumAgeAtDeath = 0;
        this.id = Species.nextId++;
        // Generate a random ASCII character if not provided
        this.symbol = symbol || this.generateRandomSymbol();
        // Generate a random emoji
        this.emoji = this.generateRandomEmoji();
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
    generateRandomEmoji() {
        // Curated array of emoji characters that display properly
        const emojis = [
            // Smileys & Emotion
            "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌",
            "😍", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
            "😎", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫",
            "😩", "😢", "😭", "😤", "😠", "😡", "😳", "😱", "😨",
            // People & Body
            "👋", "✋", "🖐️", "👌", "✌️", "👈", "👉", "👆",
            "👇", "☝️", "👍", "👎", "✊", "👊", "👏", "🙌", "👐", "🙏", "✍️",
            "💪", "👂", "🦻", "👃", "👀",
            // Animals & Nature
            "🐶", "🐱", "🐭", "🐹", "🐰", "🐻", "🐼", "🐨", "🐯", "🐮", "🐷", "🐸",
            "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥",
            "🌵", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌺", "🌻", "🌹",
            // Food & Drink
            "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🍍",
            "🍅", "🍆", "🌶️", "🌽",
            "🍞", "🍳", "🍔", "🍟",
            // Travel & Places
            "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜",
            "🚲", "🏍️", "🚨", "🚔", "🚍", "🚘", "🚖", "✈️", "🛫", "🛬", "🛩️", "💺",
            "🚀", "🚁", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "⛽", "🚧",
            // Activities
            "⚽", "🏀", "🏈", "⚾", "🎾", "🏉", "🎱",
            "⛳", "🎣", "🎽",
            // Objects
            "⌚", "📱", "💻", "⌨️", "🖥️", "🖱️", "🖨️", "🖋️", "✒️", "🔍", "💡", "🔦",
            "🔬", "🔭", "📚", "📙", "📘", "📗", "📕", "📒", "📔", "📓", "📰",
            // Symbols
            "❤️", "💛", "💚", "💙", "💜", "💔", "❣️", "💕", "💞", "💓",
            "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️",
            "☦️", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔",
            // Flags (common subset)
            "🏁", "🚩", "🎌", "🏴", "🏳️"
        ];
        return emojis[Math.floor(Math.random() * emojis.length)];
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
Species: ${this.name} (${this.emoji || this.symbol})
Max Lifespan: ${this.maxLifespan}
Total Born: ${this.totalBorn}
Total Died: ${this.totalDied}
Avg Age at Death: ${this.getAverageAgeAtDeath().toFixed(1)}
Bonded Pairs: ${this.totalBondedPairs - this.totalUnbondedPairs} / ${this.totalBondedPairs}
Singles: ${this.totalSingles}
Offspring: ${this.totalOffspring - this.totalOffspringDied} / ${this.totalOffspring}
        `.trim();
    }
    static createMutation(parent1, parent2) {
        // Create a new species based on the average properties of the parents
        const avgLifespan = Math.floor((parent1.maxLifespan + parent2.maxLifespan) / 2);
        // Create a new symbol by combining the parent symbols
        const newSymbol = String.fromCharCode(Math.floor((parent1.symbol.charCodeAt(0) + parent2.symbol.charCodeAt(0)) / 2));
        // Create new species with the combined properties
        const newSpecies = new Species(newSymbol, avgLifespan);
        // The emoji is already randomly generated in the constructor
        return newSpecies;
    }
}
Species.nextId = 1;
// UI Base class - Contains core UI functionality and properties
class UI {
    constructor() {
        // Game field dimensions
        this.fieldWidth = 80;
        this.fieldHeight = 30;
        this.field = [];
        // Game statistics
        this.totalSpeciesGenerated = 0;
        this.totalSpeciesExtinct = 0;
        this.totalLifeFormsBorn = 0;
        this.totalLifeFormsDead = 0;
        this.totalPairsBorn = 0;
        this.totalPairsDead = 0;
        this.totalOffspringBorn = 0;
        this.totalOffspringDead = 0;
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
    }
    showGamePanel() {
        this.setupPanel.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        // Clear the event log
        this.eventLog.innerHTML = '';
        // Reset statistics
        this.resetStatistics();
        // Trigger resize to ensure proper layout
        this.handleResize();
    }
    resetStatistics() {
        this.totalSpeciesGenerated = 0;
        this.totalSpeciesExtinct = 0;
        this.totalLifeFormsBorn = 0;
        this.totalLifeFormsDead = 0;
        this.totalPairsBorn = 0;
        this.totalPairsDead = 0;
        this.totalOffspringBorn = 0;
        this.totalOffspringDead = 0;
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
UI.prototype.updateGameField = function (lifeForms) {
    // Clear the field
    this.initializeField();
    // First pass: mark bond connections
    for (const lifeForm of lifeForms) {
        // Handle bonded pairs with + sign
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
        // Handle unbonded pairs with - sign (for one cycle)
        if (lifeForm.recentlyUnbonded) {
            const midX = Math.floor((lifeForm.x + lifeForm.recentlyUnbonded.x) / 2);
            const midY = Math.floor((lifeForm.y + lifeForm.recentlyUnbonded.y) / 2);
            if (Math.abs(lifeForm.x - lifeForm.recentlyUnbonded.x) <= 1 &&
                Math.abs(lifeForm.y - lifeForm.recentlyUnbonded.y) <= 1 &&
                midX >= 0 && midX < this.fieldWidth &&
                midY >= 0 && midY < this.fieldHeight) {
                this.field[midY][midX] = '-';
            }
        }
        // Connect offspring to parents with + sign
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
            // Use emoji instead of ASCII characters
            this.field[lifeForm.y][lifeForm.x] = lifeForm.species.emoji || lifeForm.species.symbol;
        }
    }
    // Render the field
    let html = '';
    for (let y = 0; y < this.fieldHeight; y++) {
        for (let x = 0; x < this.fieldWidth; x++) {
            // Find the life form at this position to get its color
            const lifeForm = lifeForms.find(lf => lf.x === x && lf.y === y);
            if (lifeForm) {
                // Display life form emoji without square brackets
                html += `<span style="color: ${lifeForm.getColor()}">${this.field[y][x]}</span>`;
            }
            else if (this.field[y][x] === '+') {
                // Show connection symbol in white with bold styling
                html += `<span class="connection-symbol" style="color: white">+</span>`;
            }
            else if (this.field[y][x] === '-') {
                // Show unbonding symbol in red with bold styling
                html += `<span class="connection-symbol" style="color: red">-</span>`;
            }
            else {
                html += this.field[y][x];
            }
        }
        html += '<br>';
    }
    this.gameField.innerHTML = html;
};
// Initialize the allSpecies array
UI.prototype.allSpecies = [];
// Update both left and right panels with statistics
UI.prototype.updateStats = function (species, totalCycles) {
    // Keep track of all species, including extinct ones
    for (const sp of species) {
        if (!this.allSpecies.some(existingSp => existingSp.id === sp.id)) {
            this.allSpecies.push(sp);
        }
    }
    // Update left panel with game-wide statistics
    this.updateGameStats(species, totalCycles);
    // Update right panel with per-species statistics (including extinct ones)
    this.updateSpeciesStats(this.allSpecies);
};
// Update left panel with game-wide statistics
UI.prototype.updateGameStats = function (species, totalCycles) {
    // Count active species (those with living life forms)
    const activeSpecies = species.filter(s => s.totalBorn - s.totalDied > 0).length;
    // Calculate totals
    let totalBorn = 0;
    let totalDied = 0;
    let totalAlive = 0;
    let totalPairsBorn = 0;
    let totalPairsDead = 0;
    let totalPairsActive = 0;
    let totalOffspringBorn = 0;
    let totalOffspringDead = 0;
    let totalOffspringActive = 0;
    for (const sp of species) {
        totalBorn += sp.totalBorn;
        totalDied += sp.totalDied;
        totalAlive += (sp.totalBorn - sp.totalDied);
        totalPairsBorn += sp.totalBondedPairs;
        totalPairsDead += sp.totalUnbondedPairs;
        totalPairsActive += (sp.totalBondedPairs - sp.totalUnbondedPairs);
        totalOffspringBorn += sp.totalOffspring;
        totalOffspringDead += sp.totalOffspringDied;
        totalOffspringActive += (sp.totalOffspring - sp.totalOffspringDied);
    }
    // Update statistics tracking
    this.totalSpeciesGenerated = this.allSpecies.length;
    this.totalSpeciesExtinct = this.totalSpeciesGenerated - activeSpecies;
    this.totalLifeFormsBorn = totalBorn;
    this.totalLifeFormsDead = totalDied;
    this.totalPairsBorn = totalPairsBorn;
    this.totalPairsDead = totalPairsDead;
    this.totalOffspringBorn = totalOffspringBorn;
    this.totalOffspringDead = totalOffspringDead;
    // Create HTML for left panel
    let gameInfoHtml = `
        <p><strong>Year / Iteration:</strong> ${totalCycles}</p>
        <p><strong>Species:</strong></p>
        <ul>
            <li>Generated: ${this.totalSpeciesGenerated}</li>
            <li>Extinct: ${this.totalSpeciesExtinct}</li>
            <li>Total Active: ${activeSpecies}</li>
        </ul>
        <p><strong>Life Forms:</strong></p>
        <ul>
            <li>Born: ${this.totalLifeFormsBorn}</li>
            <li>Dead: ${this.totalLifeFormsDead}</li>
            <li>Total Alive: ${totalAlive}</li>
        </ul>
        <p><strong>Pairs:</strong></p>
        <ul>
            <li>Born: ${this.totalPairsBorn}</li>
            <li>Dead: ${this.totalPairsDead}</li>
            <li>Total Active: ${totalPairsActive}</li>
        </ul>
        <p><strong>Offspring:</strong></p>
        <ul>
            <li>Born: ${this.totalOffspringBorn}</li>
            <li>Dead: ${this.totalOffspringDead}</li>
            <li>Total Active: ${totalOffspringActive}</li>
        </ul>
    `;
    const gameInfoContent = document.getElementById('game-info-content');
    if (gameInfoContent) {
        gameInfoContent.innerHTML = gameInfoHtml;
    }
    else {
        console.error("Could not find game-info-content element");
    }
};
// Update right panel with per-species statistics
UI.prototype.updateSpeciesStats = function (allSpecies) {
    // Create table for species statistics
    let statsHtml = `
        <table class="species-table">
            <thead>
                <tr>
                    <th>Species</th>
                    <th>Born</th>
                    <th>Dead</th>
                    <th>Alive</th>
                    <th>Pairs</th>
                    <th>Offspring</th>
                </tr>
            </thead>
            <tbody>
    `;
    for (const sp of allSpecies) {
        const alive = sp.totalBorn - sp.totalDied;
        const isExtinct = alive <= 0;
        const bondedPercent = sp.totalBondedPairs > 0
            ? Math.round((sp.totalBondedPairs - sp.totalUnbondedPairs) / sp.totalBondedPairs * 100)
            : 0;
        const offspringPercent = sp.totalOffspring > 0
            ? Math.round((sp.totalOffspring - sp.totalOffspringDied) / sp.totalOffspring * 100)
            : 0;
        statsHtml += `
            <tr${isExtinct ? ' class="extinct"' : ''}>
                <td>
                    <strong>${sp.name}</strong> 
                    <span style="color: white">${sp.emoji || sp.symbol}</span>
                    ${isExtinct ? ' <span class="extinct-label">(Extinct)</span>' : ''}
                </td>
                <td>${sp.totalBorn}</td>
                <td>${sp.totalDied}</td>
                <td>${alive}</td>
                <td>${bondedPercent}% bonded</td>
                <td>${offspringPercent}% alive</td>
            </tr>
        `;
        // Add detailed stats for each species
        statsHtml += `
            <tr${isExtinct ? ' class="extinct"' : ''}>
                <td colspan="6" class="species-details">
                    <p>Max Lifespan: ${sp.maxLifespan}</p>
                    <p>Avg Age at Death: ${sp.getAverageAgeAtDeath().toFixed(1)}</p>
                    <p>Bonded Pairs: ${sp.totalBondedPairs - sp.totalUnbondedPairs} / ${sp.totalBondedPairs}</p>
                    <p>Singles: ${sp.totalSingles}</p>
                </td>
            </tr>
        `;
    }
    statsHtml += `
            </tbody>
        </table>
    `;
    const statsContent = document.getElementById('stats-content');
    statsContent.innerHTML = statsHtml;
};
// Log an event to the event log
UI.prototype.logEvent = function (message) {
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
};
// Show game over message
UI.prototype.showGameOver = function (species, totalCycles) {
    let message = `<h2>Game Over</h2>
                  <p>Total Cycles: ${totalCycles}</p>`;
    if (species.length === 0) {
        message += '<p>All species have gone extinct!</p>';
        this.logEvent("GAME OVER: All species have gone extinct!");
    }
    else if (species.length === 1) {
        message += `<p>Only ${species[0].name} (${species[0].emoji || species[0].symbol}) survived!</p>`;
        this.logEvent(`GAME OVER: Only ${species[0].name} (${species[0].emoji || species[0].symbol}) survived!`);
    }
    this.gameField.innerHTML = message;
};
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
            this.ui.logEvent(`Created ${newSpecies.name} (${newSpecies.emoji || newSpecies.symbol}) with max lifespan of ${newSpecies.maxLifespan}`);
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
Game.prototype.gameLoop = function () {
    if (this.isPaused)
        return;
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
Game.prototype.processOffspringUnbonding = function () {
    for (const lifeForm of this.lifeForms) {
        if (lifeForm.state === LifeFormState.BONDED_TO_PARENT && lifeForm.unbondFromParent()) {
            // Move to a random location
            lifeForm.x = Math.floor(Math.random() * this.fieldWidth);
            lifeForm.y = Math.floor(Math.random() * this.fieldHeight);
            this.ui.logEvent(`Offspring ${lifeForm.species.emoji || lifeForm.species.symbol} matured and moved to position (${lifeForm.x},${lifeForm.y})`);
        }
    }
};
Game.prototype.processBirths = function () {
    const newLifeForms = [];
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
            }
            else {
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
                }
                else {
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
Game.prototype.processMovementAndUnbonding = function () {
    // Process bonded pairs for movement and unbonding
    const processedPairs = new Set();
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
        }
        else if (lifeForm.recentlyUnbonded) {
            // Move recently unbonded life forms to random positions
            lifeForm.x = Math.floor(Math.random() * this.fieldWidth);
            lifeForm.y = Math.floor(Math.random() * this.fieldHeight);
            this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) moved to random position (${lifeForm.x},${lifeForm.y}) after unbonding`);
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
            this.ui.logEvent(`${lifeForm.species.name} (${lifeForm.species.emoji || lifeForm.species.symbol}) died at age ${lifeForm.age} at position (${lifeForm.x},${lifeForm.y})`);
            lifeForm.die();
        }
        else {
            survivingLifeForms.push(lifeForm);
        }
    }
    this.lifeForms = survivingLifeForms;
    // Remove species with no life forms
    const beforeCount = this.species.length;
    const extinctSpecies = this.species.filter(species => !this.lifeForms.some(lifeForm => lifeForm.species.id === species.id));
    // Update extinct species count
    if (extinctSpecies.length > 0) {
        for (const species of extinctSpecies) {
            this.ui.logEvent(`Species ${species.name} (${species.emoji || species.symbol}) went extinct`);
        }
    }
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
    this.ui.logEvent(`BIRTH EXPLOSION: ${randomSpecies.name} (${randomSpecies.emoji || randomSpecies.symbol}) is experiencing a birth explosion! ${count} new life forms created.`);
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * this.fieldWidth);
        const y = Math.floor(Math.random() * this.fieldHeight);
        // Check if position is empty
        if (!this.lifeForms.some(lf => lf.x === x && lf.y === y)) {
            const newLifeForm = new LifeForm(randomSpecies, x, y);
            newLifeForms.push(newLifeForm);
        }
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
    this.ui.logEvent(`DEATH EVENT: ${randomSpecies.name} (${randomSpecies.emoji || randomSpecies.symbol}) is experiencing a mass extinction!`);
    this.lifeForms = this.lifeForms.filter(lifeForm => {
        if (lifeForm.species.id === randomSpecies.id && Math.random() < deathRate) {
            lifeForm.die();
            deathCount++;
            return false;
        }
        return true;
    });
    this.ui.logEvent(`DEATH EVENT: ${deathCount} out of ${speciesCount} ${randomSpecies.name} (${randomSpecies.emoji || randomSpecies.symbol}) life forms died`);
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
