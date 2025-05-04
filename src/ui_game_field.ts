// UI Game Field - Handles rendering the game field and life forms
interface UI {
    updateGameField(lifeForms: LifeForm[]): void;
}

UI.prototype.updateGameField = function(lifeForms: LifeForm[]): void {
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
            } else if (this.field[y][x] === '+') {
                // Show connection symbol in white with bold styling
                html += `<span class="connection-symbol" style="color: white">+</span>`;
            } else if (this.field[y][x] === '-') {
                // Show unbonding symbol in red with bold styling
                html += `<span class="connection-symbol" style="color: red">-</span>`;
            } else {
                html += this.field[y][x];
            }
        }
        html += '<br>';
    }
    
    this.gameField.innerHTML = html;
};