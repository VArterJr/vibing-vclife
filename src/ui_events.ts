// UI Events - Handles event logging and game over states
interface UI {
    logEvent(message: string): void;
    showGameOver(species: Species[], totalCycles: number): void;
}

// Log an event to the event log
UI.prototype.logEvent = function(message: string): void {
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
UI.prototype.showGameOver = function(species: Species[], totalCycles: number): void {
    let message = `<h2>Game Over</h2>
                  <p>Total Cycles: ${totalCycles}</p>`;
    
    if (species.length === 0) {
        message += '<p>All species have gone extinct!</p>';
        this.logEvent("GAME OVER: All species have gone extinct!");
    } else if (species.length === 1) {
        message += `<p>Only ${species[0].name} (${species[0].emoji || species[0].symbol}) survived!</p>`;
        this.logEvent(`GAME OVER: Only ${species[0].name} (${species[0].emoji || species[0].symbol}) survived!`);
    }
    
    this.gameField.innerHTML = message;
};