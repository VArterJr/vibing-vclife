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