"use strict";
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
        // Initialize the field with empty spaces
        this.initializeField();
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
    }
    updateGameField(lifeForms) {
        // Clear the field
        this.initializeField();
        // Place life forms on the field
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
                    html += `<span style="color: ${lifeForm.getColor()}">${this.field[y][x]}</span>`;
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
        let html = `<p>Game Cycles: ${totalCycles}</p>`;
        for (const sp of species) {
            html += `<div class="species-stats">
                <h3>${sp.name} <span style="color: white">${sp.symbol}</span></h3>
                <p>Max Lifespan: ${sp.maxLifespan}</p>
                <p>Total Born: ${sp.totalBorn}</p>
                <p>Total Died: ${sp.totalDied}</p>
                <p>Avg Age at Death: ${sp.getAverageAgeAtDeath().toFixed(1)}</p>
                <p>Bonded Pairs: ${sp.totalBondedPairs}</p>
                <p>Singles: ${sp.totalSingles}</p>
            </div>`;
        }
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = html;
    }
    showGameOver(species, totalCycles) {
        let message = `<h2>Game Over</h2>
                      <p>Total Cycles: ${totalCycles}</p>`;
        if (species.length === 0) {
            message += '<p>All species have gone extinct!</p>';
        }
        else if (species.length === 1) {
            message += `<p>Only ${species[0].name} (${species[0].symbol}) survived!</p>`;
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
        }
        else {
            this.pauseResumeButton.textContent = 'Pause';
            this.pauseResumeButton.classList.remove('paused');
        }
    }
}
