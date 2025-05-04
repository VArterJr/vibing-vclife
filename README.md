# Game of Life - Evolution
An Vibe Coded (using Monica Code) interactive implementation of Conway's Game of Life with unique evolutionary twists. This project is built using pure HTML5, TypeScript, and CSS without any external libraries or frameworks.

## NOTE: Version History is at the bottom of this file. It's just an experiement, so I didn't want to clog up the start with Version History as people are probably more interested in the background.

## Overview
This Game of Life simulation extends the traditional cellular automaton with species, bonding, reproduction, aging, and mutation mechanics. Life forms evolve, reproduce, and die based on complex rules that create an ever-changing ecosystem.

## Vibe Coding
This project's design and ideas are all mine, but as a professional programmer and software architect of over 35 years, I wanted to play with Vibe Coding with AI. I've used GitHub Copilot for small tasks (checking code, making a few suggestions) since its release, but I wanted to experiement all out.

The rules I gave myself:
* Use Vibe Coding with AI and NO custom coding. The AI has to do it all.
* Use Monica Code (since I own it) in VS Code.
* I cannot do ANY coding, not matter how bad I want to clean this crud up.
* Even bugs must be fixed via prompts. I'm not allowed to touch the code.
* No matter how angry or sad I get, finish the product.
  
## Features
- Multiple species with unique characteristics
- Life forms represented by different ASCII characters
- Age-based coloring system (white → light blue → green → orange → red)
- Bonded pairs that move and reproduce together
- Mutations when different species interact
- Random events like birth explosions and mass extinctions
- Detailed statistics tracking

## How to Play
1. Choose how many species to generate
2. Watch as life forms interact, reproduce, and evolve
3. Track statistics for each species
4. Game ends when all life forms are extinct or only one remains

## Getting Started
1. Clone this repository
2. Open `index.html` in your browser
3. Select the number of species and click "Start Game"
4. Use the Pause and Reset buttons to control the simulation

## Game Rules

### Life Forms and Species
- Each species is represented by a unique ASCII character
- Species have different lifespans (randomly assigned)
- Life forms age and change color based on their age percentage

### Game Mechanics
- Bonded pairs have a chance to reproduce when not touching other members of their species
- Life forms have age-based chances of death
- Bonded pairs can move together or separate
- Different species can mutate to form new species when they interact

## Project Structure
- `index.html` - Main HTML file
- `styles.css` - CSS styling
- `src/` - TypeScript source files
  - `game.ts` - Main game logic
  - `species.ts` - Species class definition
  - `lifeform.ts` - Life form class definition
  - `ui.ts` - User interface handling
- `dist/` - Compiled JavaScript files

## Development
This project uses TypeScript. To compile the TypeScript files:

```
tsc
```

## Initial Project Requirements Prompt (My Initial Prompt)
Below is the initial prompt that defined the scope and rules for this Game of Life implementation. I did not get too detailed. I wanted to write pseudocode and very detailed specs, but I wanted to see how an average story based prompt would do. I may do pseudocode in future phases.

```
This project, in this folder, is going to be HTML5, TypeScript, and CSS only. PURE, please. I'm going to work with you on creating the Game of Life, but with some unique changes. You will create all of the files (main page will be index.html) and code. Please keep the code clean and organzied and use an object oriented design where possible.

Let's start with you creating the game UI and basic rules:
* Player means the human player running the game.
* I want this to be a basic game of life game. At the beginning the player gets to choose from how many Species (types of Life Forms) to create. Each Species will be represented by a different ASCII character.
* Each Species will have different Lifespans. One may live up to 10 cycles and one species may live 100 cycles. Just randomly pick a max Lifespan for each Species you create. Eventually, we'll add UI to let the Player choose each Species' ASCII character, Lifespan and such, but for now, make it random.
* For now, each species can live UP to the max for it, but doesn't have to live that long. Each tick (game cycle) will have random chances of death.
* For each age range... use colors of the ASCII characters to show a given Life Form's age. Use white for newborn through 20% of its life, then light blue for it's next 20%, green for the next 20%, orange for the next 20%, and red for the last 20% of each life form's life.

Game Start:
* Once the player has chosen how many species to generate, and clicks Start Game, you will place two of each species next to each other at random parts of the play field. This is a "Bonded Pair" that will live and move together, except in the exceptions listed in the Game Loop / Game Cycle section below.
* Keep track of statistics for each species (like total number born, total number died, age at death, Bonded Pairs vs Singles, and averages and such. Display those on the screen in the upper right of the Game Field.

Game Loop / Game Cycle:
* Each cycle of going through and looking for possible Offspring is a game cycle (or tick). After checking for Offspring, then also check if any Life Forms should die this loop / cycle. There is a 1-5% chance any age of creature can die. On top of that this increases with age. Choose a percentage for each Loop.
* Each Bonded Pair of Life Forms has a random 1-50% chance of spawning an offspring. Chance for offspring only happens when two life forms / creatures of the same species touch during a cycle and if they aren't touching others of their same species. See Mutations below for more info. These Offspring will be bonded to the Parents for the first 20% of their life.
* For Life Forms in the first 20% of their life there is a 1-10% chance of death. For the next 20% of life, there is a 1-5% chance of death. For the next 20% there is a 1-5% chance of death. In the next 20% of life, there is a 10-20% change of death. In the final 20% of life, there is a 50% chance of death.
* Each Loop of the game (meaning a cycle of checking for birth and death) all life forms / creatures get one tick / Loop older. As noted before, their max age is based on their species.
* There is a 10% chance that during any cycle of the Game Loop, each individual Bonded Pair of Life Forms will move on the screen by a few ASCII character spaces, in a random direction. There is a 5% change that Bonded Pair Life Forms will de-pair (divorce) and move to random spots on the screen alone.
  
Mutations and Events:
* If two life forms from different species touch, and they aren't touching members of their own species, there is a 1% chance they form a new species based on the status of each of them (averages).
* Random events should happen that cause things like birth explosions (much higher birth rate chances) and death events that will kill off large numbers of certain species. For now, these will be random events.

End Game:
* If there are no more lifeforms, or there is only one life form left, the game is over and stats should be displayed.
```

## Possible Future Enhancements
- Custom species creation UI
- Game speed controls
- Visual effects for events
- Save/load game state
- More detailed statistics and graphs

## License
GNU General Public License v3
https://www.gnu.org/licenses/gpl-3.0.en.html

## Author
Vincent Lee Arter, Jr.
https://github.com/varterjr
Created with the assistance of AI (actually all of it is AI generated at this point and I just did the prompts, formatting, and rules and such. Oh and lots of yelling at the AI.)

## Acknowledgments
- AI assistance for the project structure and code generation from Monica Code (https://monica.im/code) using Antrhopic's Claude 3.7 Sonnet. I find that model to be pretty decent for this type of work.

## Version History
* Version 1.0.0 (04-May-2025): The first committed "version" of the game. This is based on 100% Monica Code AI generation using Anthropic's Claude 3.7 Sonnet. I did the prompts, formatting, and rules and such. Oh and lots of yelling at the AI. But at this point, 100% of the code is AI generated.
