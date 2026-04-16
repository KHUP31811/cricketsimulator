class Bowler {
    constructor(name) {
        this.name = name;
        this.stamina = 100; // Stamina from 0 to 100
        this.spells = 0;
        this.oversBowled = 0;
    }

    bowlOver() {
        if (this.stamina <= 0) {
            console.log(`${this.name} is too exhausted to bowl.`);
            return false;
        }
        this.oversBowled += 1;
        this.stamina -= 20; // Decrease stamina by 20 per over
        this.spells += 1;
        console.log(`${this.name} bowled an over. Remaining stamina: ${this.stamina}`);
        return true;
    }

    rest() {
        this.stamina = Math.min(this.stamina + 30, 100); // Restore stamina
        console.log(`${this.name} rested. Current stamina: ${this.stamina}`);
    }
}

class Match {
    constructor(format) {
        this.format = format;
        this.bowlers = [];
    }

    addBowler(bowler) {
        this.bowlers.push(bowler);
    }

    manageOvers() {
        console.log(`Managing bowlers for ${this.format} format`);
        // Implement format-specific logic for managing bowlers
        for (const bowler of this.bowlers) {
            if (this.format === 'T20' && bowler.oversBowled < 4) {
                bowler.bowlOver();
            } else if (this.format === 'ODI' && bowler.oversBowled < 10) {
                bowler.bowlOver();
            } else if (this.format === 'Test' && bowler.oversBowled < 20) {
                bowler.bowlOver();
            } else {
                console.log(`${bowler.name} has bowled enough overs for this format.`);
                bowler.rest();
            }
        }
    }
}

// Example usage:
const match = new Match('ODI');
const bowler1 = new Bowler('Bowler A');
const bowler2 = new Bowler('Bowler B');
match.addBowler(bowler1);
match.addBowler(bowler2);
match.manageOvers();