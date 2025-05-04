class UI {
    private gameField: HTMLElement;
    private statsPanel: HTMLElement;
    private setupPanel: HTMLElement;
    private gameContainer: HTMLElement;
    private pauseResumeButton: HTMLElement;
    private resetButton: HTMLElement;
    private leftPanel: HTMLElement;
    private eventLog: HTMLElement;
    private lastUpdatedSpan: HTMLElement;
    
    private fieldWidth: number = 80;
    private fieldHeight: number = 30;
    private field: string[][] = [];
    
    constructor() {
        this.gameField = document.getElementById('game-field') as HTMLElement;
        this.statsPanel = document.getElementById('stats-panel') as HTMLElement;
        this.setupPanel = document.getElementById('setup-panel') as HTMLElement;
        this.gameContainer = document.getElementById('game-container') as HTMLElement;
        this.pauseResumeButton = document.getElementById('pause-resume') as HTMLElement;
        this.resetButton = document.getElementById('reset-game') as HTMLElement;
        this.leftPanel = document.getElementById('left-panel') as HTMLElement;
        this.eventLog = document.getElementById('event-log-content') as HTMLElement;
        this.lastUpdatedSpan = document.getElementById('last-updated') as HTMLElement;
        
        // Set the last updated date
        this.lastUpdatedSpan.textContent = new Date().toLocaleDateString();
        
        // Initialize the field with empty spaces
        this.initializeField();
        
        // Add window resize event listener
        window.addEventListener('resize', () => this.handleResize());
        
        // Initial resize
        this.handleResize();
    }
    
    private handleResize(): void {
        // Adjust container height based on window size
        const container = document.querySelector('.container') as HTMLElement;
        if (container) {
            container.style.height = `${window.innerHeight - 60}px`;
        }
    }
    
    private initializeField(): void {
        this.field = [];
        for (let y = 0; y < this.fieldHeight; y++) {
            this.field[y] = [];
            for (let x = 0; x < this.fieldWidth; x++) {
                this.field[y][x] = ' ';
            }
        }
    }
    
    public showSetupPanel(): void {
        this.setupPanel.style.display = 'block';
        this.gameContainer.style.display = 'none';
        this.pauseResumeButton.style.display = 'none';
        this.resetButton.style.display = 'none';
    }
    
    public showGamePanel(): void {
        this.setupPanel.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        this.pauseResumeButton.style.display = 'inline-block';
        this.resetButton.style.display = 'inline-block';
        
        // Clear the event log
        this.eventLog.innerHTML = '';
        
        // Trigger resize to ensure proper layout
        this.handleResize();
    }
    
    public updateGameField(lifeForms: LifeForm[]): void {
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
                } else if (this.field[y][x] === '+') {
                    // Show connection symbol in white
                    html += `<span style="color: white">${this.field[y][x]}</span>`;
                } else {
                    html += this.field[y][x];
                }
            }
            html += '<br>';
        }
        
        this.gameField.innerHTML = html;
    }
    
    public updateStats(species: Species[], totalCycles: number): void {
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
        
        const statsContent = document.getElementById('stats-content') as HTMLElement;
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
        
        const gameInfoContent = document.getElementById('game-info-content') as HTMLElement;
        if (gameInfoContent) {
            gameInfoContent.innerHTML = gameInfoHtml;
        } else {
            console.error("Could not find game-info-content element");
        }
    }
    
    public logEvent(message: string): void {
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
    
    public showGameOver(species: Species[], totalCycles: number): void {
        let message = `<h2>Game Over</h2>
                      <p>Total Cycles: ${totalCycles}</p>`;
        
        if (species.length === 0) {
            message += '<p>All species have gone extinct!</p>';
            this.logEvent("GAME OVER: All species have gone extinct!");
        } else if (species.length === 1) {
            message += `<p>Only ${species[0].name} (${species[0].symbol}) survived!</p>`;
            this.logEvent(`GAME OVER: Only ${species[0].name} (${species[0].symbol}) survived!`);
        }
        
        this.gameField.innerHTML = message;
    }
    
    public getFieldDimensions(): [number, number] {
        return [this.fieldWidth, this.fieldHeight];
    }
    
    public setPauseButtonState(isPaused: boolean): void {
        if (isPaused) {
            this.pauseResumeButton.textContent = 'Resume';
            this.pauseResumeButton.classList.add('paused');
            this.logEvent("Game paused");
        } else {
            this.pauseResumeButton.textContent = 'Pause';
            this.pauseResumeButton.classList.remove('paused');
            this.logEvent("Game resumed");
        }
    }
}