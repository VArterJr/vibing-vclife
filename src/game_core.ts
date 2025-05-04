class Game {
    private species: Species[] = [];
    private lifeForms: LifeForm[] = [];
    private ui: UI;
    private gameInterval: number | null = null;
    private isPaused: boolean = false;
    private totalCycles: number = 0;
    private fieldWidth: number;
    private fieldHeight: number;
    
    constructor() {
        this.ui = new UI();
        [this.fieldWidth, this.fieldHeight] = this.ui.getFieldDimensions();
        
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        const startButton = document.getElementById('start-game') as HTMLElement;
        startButton.addEventListener('click', () => this.startGame());
        
        const pauseResumeButton = document.getElementById('pause-resume') as HTMLElement;
        pauseResumeButton.addEventListener('click', () => this.togglePause());
        
        const resetButton = document.getElementById('reset-game') as HTMLElement;
        resetButton.addEventListener('click', () => this.resetGame());
    }
    
    private startGame(): void {
        const speciesCountInput = document.getElementById('species-count') as HTMLInputElement;
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
    
    private initializeSpecies(count: number): void {
        this.species = [];
        
        for (let i = 0; i < count; i++) {
            const newSpecies = new Species();
            this.species.push(newSpecies);
            this.ui.logEvent(`Created ${newSpecies.name} (${newSpecies.emoji || newSpecies.symbol}) with max lifespan of ${newSpecies.maxLifespan}`);
        }
    }
}