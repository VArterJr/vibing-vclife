// UI Stats - Handles updating game statistics displays
interface UI {
    updateStats(species: Species[], totalCycles: number): void;
    updateGameStats(species: Species[], totalCycles: number): void;
    updateSpeciesStats(species: Species[]): void;
    allSpecies: Species[]; // Add a property to track all species including extinct ones
}

// Initialize the allSpecies array
UI.prototype.allSpecies = [];

// Update both left and right panels with statistics
UI.prototype.updateStats = function(species: Species[], totalCycles: number): void {
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
UI.prototype.updateGameStats = function(species: Species[], totalCycles: number): void {
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
    
    const gameInfoContent = document.getElementById('game-info-content') as HTMLElement;
    if (gameInfoContent) {
        gameInfoContent.innerHTML = gameInfoHtml;
    } else {
        console.error("Could not find game-info-content element");
    }
};

// Update right panel with per-species statistics
UI.prototype.updateSpeciesStats = function(allSpecies: Species[]): void {
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
    
    const statsContent = document.getElementById('stats-content') as HTMLElement;
    statsContent.innerHTML = statsHtml;
};