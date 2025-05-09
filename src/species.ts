class Species {
    private static nextId: number = 1;
    
    public id: number;
    public symbol: string;
    public emoji: string;
    public maxLifespan: number;
    public name: string;
    
    // Statistics
    public totalBorn: number = 0;
    public totalDied: number = 0;
    public totalBondedPairs: number = 0;
    public totalUnbondedPairs: number = 0;
    public totalSingles: number = 0;
    public totalOffspring: number = 0;
    public totalOffspringDied: number = 0;
    public sumAgeAtDeath: number = 0;
    
    constructor(symbol?: string, maxLifespan?: number) {
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
    
    private generateRandomSymbol(): string {
        // ASCII printable characters (excluding space and control characters)
        const chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        return chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    private generateRandomEmoji(): string {
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
    
    private generateRandomLifespan(): number {
        // Random lifespan between 10 and 100
        return Math.floor(Math.random() * 91) + 10;
    }
    
    public getAverageAgeAtDeath(): number {
        if (this.totalDied === 0) return 0;
        return this.sumAgeAtDeath / this.totalDied;
    }
    
    public getStats(): string {
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
    
    public static createMutation(parent1: Species, parent2: Species): Species {
        // Create a new species based on the average properties of the parents
        const avgLifespan = Math.floor((parent1.maxLifespan + parent2.maxLifespan) / 2);
        
        // Create a new symbol by combining the parent symbols
        const newSymbol = String.fromCharCode(
            Math.floor((parent1.symbol.charCodeAt(0) + parent2.symbol.charCodeAt(0)) / 2)
        );
        
        // Create new species with the combined properties
        const newSpecies = new Species(newSymbol, avgLifespan);
        
        // The emoji is already randomly generated in the constructor
        
        return newSpecies;
    }
}