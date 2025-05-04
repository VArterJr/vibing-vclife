# Game of Life - Evolution
A Vibe Coded (using Monica Code) interactive implementation of Conway's Game of Life with unique evolutionary twists. This project is built using pure HTML5, TypeScript, and CSS without any external libraries or frameworks.

## NOTE: Version History is at the bottom of this file. It's just an experiment, so I didn't want to clog up the start with Version History as people are probably more interested in the background.

## Overview
This Game of Life simulation extends the traditional cellular automaton with species, bonding, reproduction, aging, and mutation mechanics. Life forms evolve, reproduce, and die based on complex rules that create an ever-changing ecosystem.

## Vibe Coding
This project's design and ideas are all mine, but as a professional programmer and software architect of over 35 years, I wanted to play with Vibe Coding using AI. I've used GitHub Copilot for small tasks (checking code, making a few suggestions) since its release, but I wanted to experiment all out.

### The rules I gave myself:
* Use Vibe Coding with AI and NO custom coding. The AI has to do it all.
* Use Monica Code (since I own it) in VS Code.
* I cannot do ANY coding, not matter how bad I want to clean this crud up.
* Even bugs must be fixed via prompts. I'm not allowed to touch the code.
* No matter how angry or sad I get, finish the product.
  
## Features
- Multiple species with unique characteristics
- Life forms represented by different emoji characters
- Age-based coloring system (white → light blue → green → orange → red) - May not be working with emoji.
- Bonded pairs that move and reproduce together
- Mutations when different species interact
- Random events like birth explosions and mass extinctions
- Detailed statistics tracking
- Event logging system for all game activities
- Responsive layout with resizable panels
- Visual indicators for bonded pairs and offspring connections

## How to Play
1. Choose how many species to generate
2. Watch as life forms interact, reproduce, and evolve
3. Track statistics for each species
4. Monitor events in the event log
5. Game ends when all life forms are extinct or only one remains

## Getting Started
1. Clone this repository
2. Open `index.html` in your browser
3. Select the number of species and click "Start Game"
4. Use the Pause and Reset buttons to control the simulation

## Game Rules

### Life Forms and Species
- Each species is represented by a unique ASCII character surrounded by square brackets
- Species have different lifespans (randomly assigned)
- Life forms age and change color based on their age percentage
- Bonded pairs and parent-offspring connections are shown with + symbols

### Game Mechanics
- Bonded pairs have a chance to reproduce when not touching other members of their species
- Life forms have age-based chances of death
- Bonded pairs can move together or separate
- Different species can mutate to form new species when they interact
- Offspring remain bonded to parents for the first 20% of their life

### User Interface
- Left panel: Basic game information (Year/Iteration, species counts, life form counts)
- Center: Game field showing life forms and their connections
- Bottom: Event log showing all game activities
- Right panel: Detailed species statistics
- All panels are scrollable and resize with the browser window

## Project Structure
- `index.html` - Main HTML file
- `styles.css` - CSS styling
- `src/` - TypeScript source files
  - `lifeform.ts` - Life form class definition
  - `species.ts` - Species class definition
  - `ui.ts` - User interface handling
  - `game_core.ts` - Core game functionality
  - `game_lifecycle.ts` - Life cycle methods
  - `game_mutations.ts` - Mutation and movement methods
  - `game_events.ts` - Random event methods
  - `game_utils.ts` - Utility functions
- `dist/` - Compiled JavaScript files
  - `game-combined.js` - Combined output of all TypeScript files

## Development
This project uses TypeScript. To compile the TypeScript files:
```
tsc
```

## Prompts
The major prompts I'm using are in the folder `prompts`.
* `prompts/100-initial-setup.md` - Initial setup of the project structure and basic game functionality.
* `prompts/101-basic-refinements.md` - Refinements to the basic game functionality, including species, life forms, and game mechanics.
* `prompts/102-enhancements.md` - Further refinements to the game, including UI improvements and additional game mechanics. Fixed a lot of bugs and layout issues.

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
* Version 1.0.2 (04-May-2025): `prompts/102-enhancements.md` lists details. Further refinements to the game, including UI improvements and additional game mechanics. Fixed a lot of bugs and layout issues.
* Version 1.0.1 (04-May-2025): Some minor enhancements and changes as noted in the prompt file `prompts/101-basic-refinements.md`.
* Version 1.0.0 (04-May-2025): The first committed "version" of the game. This is based on 100% Monica Code AI generation using Anthropic's Claude 3.7 Sonnet. I did the prompts, formatting, and rules and such. Oh and lots of yelling at the AI. But at this point, 100% of the code is AI generated. The initial game is based on the prompts in `prompts/100-initial-setup.md`.
