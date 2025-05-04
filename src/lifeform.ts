enum LifeFormState {
    SINGLE,
    BONDED_PAIR,
    BONDED_TO_PARENT
}

class LifeForm {
    public species: Species;
    public age: number = 0;
    public x: number;
    public y: number;
    public state: LifeFormState = LifeFormState.SINGLE;
    public bondedWith: LifeForm | null = null;
    public bondedToParent: LifeForm | null = null;
    public recentlyUnbonded: LifeForm | null = null; // Track recently unbonded partner
    public isOffspring: boolean = false;
    
    constructor(species: Species, x: number, y: number) {
        this.species = species;
        this.x = x;
        this.y = y;
        
        // Increment the born count for this species
        this.species.totalBorn++;
    }
    
    public getAgePercentage(): number {
        return this.age / this.species.maxLifespan;
    }
    
    public getColor(): string {
        const agePercentage = this.getAgePercentage();
        
        if (agePercentage < 0.2) {
            return "white";
        } else if (agePercentage < 0.4) {
            return "lightblue";
        } else if (agePercentage < 0.6) {
            return "green";
        } else if (agePercentage < 0.8) {
            return "orange";
        } else {
            return "red";
        }
    }
    
    public shouldDie(): boolean {
        // Base chance of death (1-5%)
        let deathChance = Math.random() * 4 + 1;
        
        // Additional chance based on age
        const agePercentage = this.getAgePercentage();
        
        if (agePercentage < 0.2) {
            // 1-10% chance for first 20% of life
            deathChance += Math.random() * 9 + 1;
        } else if (agePercentage < 0.4) {
            // 1-5% chance for next 20%
            deathChance += Math.random() * 4 + 1;
        } else if (agePercentage < 0.6) {
            // 1-5% chance for next 20%
            deathChance += Math.random() * 4 + 1;
        } else if (agePercentage < 0.8) {
            // 10-20% chance for next 20%
            deathChance += Math.random() * 10 + 10;
        } else {
            // 50% chance for final 20%
            deathChance += 50;
        }
        
        return Math.random() * 100 < deathChance;
    }
    
    public die(): void {
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
        } else if (this.state === LifeFormState.SINGLE) {
            this.species.totalSingles--;
        } else if (this.state === LifeFormState.BONDED_TO_PARENT) {
            // Handle death of offspring bonded to parent
            if (this.bondedToParent) {
                this.bondedToParent.bondedToParent = null;
            }
        }
        
        // Clear the recently unbonded reference
        this.recentlyUnbonded = null;
    }
    
    public bondWith(other: LifeForm): void {
        if (this.state === LifeFormState.SINGLE && other.state === LifeFormState.SINGLE) {
            this.bondedWith = other;
            other.bondedWith = this;
            
            this.state = LifeFormState.BONDED_PAIR;
            other.state = LifeFormState.BONDED_PAIR;
            
            this.species.totalSingles -= 2;
            this.species.totalBondedPairs++;
        }
    }
    
    public unbond(): void {
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
    
    public clearRecentlyUnbonded(): void {
        // Clear the recently unbonded reference after one cycle
        this.recentlyUnbonded = null;
    }
    
    public shouldUnbond(): boolean {
        // 5% chance of unbonding
        return Math.random() < 0.05;
    }
    
    public shouldMove(): boolean {
        // 10% chance of moving
        return Math.random() < 0.1;
    }
    
    public canReproduce(otherLifeForms: LifeForm[]): boolean {
        // Only bonded pairs can reproduce
        if (this.state !== LifeFormState.BONDED_PAIR || !this.bondedWith) {
            return false;
        }
        
        // Check if touching other life forms of the same species
        const touchingSameSpecies = otherLifeForms.some(lifeForm => {
            if (lifeForm === this || lifeForm === this.bondedWith) return false;
            if (lifeForm.species.id !== this.species.id) return false;
            
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
    
    public createOffspring(x: number, y: number): LifeForm {
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
    
    public unbondFromParent(): boolean {
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
    
    public canMutate(otherLifeForms: LifeForm[]): [boolean, LifeForm | null] {
        // Check for life forms of different species touching
        for (const lifeForm of otherLifeForms) {
            if (lifeForm === this) continue;
            if (lifeForm.species.id === this.species.id) continue;
            
            // Check if adjacent
            const dx = Math.abs(this.x - lifeForm.x);
            const dy = Math.abs(this.y - lifeForm.y);
            
            if (dx <= 1 && dy <= 1) {
                // Check if touching other life forms of the same species
                const touchingSameSpecies = otherLifeForms.some(other => {
                    if (other === this || other === lifeForm) return false;
                    if (other.species.id !== this.species.id) return false;
                    
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