// UI Base class - Contains core UI functionality and properties
class UI {
    // UI elements
    protected gameField: HTMLElement;
    protected statsPanel: HTMLElement;
    protected setupPanel: HTMLElement;
    protected gameContainer: HTMLElement;
    protected pauseResumeButton: HTMLElement;
    protected resetButton: HTMLElement;
    protected leftPanel: HTMLElement;
    protected eventLog: HTMLElement;
    protected lastUpdatedSpan: HTMLElement;
    
    // Game field dimensions
    protected fieldWidth: number = 80;
    protected fieldHeight: number = 30;
    protected field: string[][] = [];
    
    // Game statistics
    protected totalSpeciesGenerated: number = 0;
    protected totalSpeciesExtinct: number = 0;
    protected totalLifeFormsBorn: number = 0;
    protected totalLifeFormsDead: number = 0;
    protected totalPairsBorn: number = 0;
    protected totalPairsDead: number = 0;
    protected totalOffspringBorn: number = 0;
    protected totalOffspringDead: number = 0;
    
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
    
    protected handleResize(): void {
        // Adjust container height based on window size
        const container = document.querySelector('.container') as HTMLElement;
        if (container) {
            container.style.height = `${window.innerHeight - 60}px`;
        }
    }
    
    protected initializeField(): void {
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
    }
    
    public showGamePanel(): void {
        this.setupPanel.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        
        // Clear the event log
        this.eventLog.innerHTML = '';
        
        // Reset statistics
        this.resetStatistics();
        
        // Trigger resize to ensure proper layout
        this.handleResize();
    }
    
    protected resetStatistics(): void {
        this.totalSpeciesGenerated = 0;
        this.totalSpeciesExtinct = 0;
        this.totalLifeFormsBorn = 0;
        this.totalLifeFormsDead = 0;
        this.totalPairsBorn = 0;
        this.totalPairsDead = 0;
        this.totalOffspringBorn = 0;
        this.totalOffspringDead = 0;
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