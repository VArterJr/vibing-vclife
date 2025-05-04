For version 1.0.2 I wanted to make the following changes. Please note that if individual files get too large for you to change, split the file into logical logic areas and move them to a new file.

1. Add a link to the bottom of the page that will take you to the scrolling log of all events.
2. Let's clean up the right and left panels.
   1. The left should be high level stats only for the whole game.
      1. The current Year / Iteration.
      2. Total number of Species:
         1. Generated Species
         2. Extinct Species
         3. Total Species
      3. Total number of Life Forms:
         1. Born Life Forms
         2. Dead Life Forms
         3. Total Life Forms
      4. Total number of Pairs:         
      5. Born Pairs
         1. Dead Pairs
         2. Total Pairs
      6. Total number of Offspring:
         1. Born Offspring
         2. Dead Offspring
         3. Total Offspring
      7. Note: This panel on the left shouldn't need to be vertically scrolled as it should be a small amount of data. You can add vertical and horizontal scroll bars if needed at run time.
   2. The right should be a scrolling panel of per Species stats. Feel free to put this in a table if it makes sense for layout.
      1. Species Name
      2. Number of Life Forms
         1. Born Life Forms
         2. Dead Life Forms
         3. Total Life Forms
      3. Pairs: % Bonded vs % De-Bonded
      4. Offspring: % Born vs % Dead
      5. Note: This panel on the right should be vertically scrolled as it will be a large amount of data. You can add horizontal scroll bars if needed at run time.
3. Move the Pause and Reset Game buttons to be right under the left panel.
4. Fix the height of the Event Log to be 25% of the browser height and the Game Field to be 75% of the browser height. The Event Log should be scrollable both horizontally and vertically.
6. If Life Forms are pair bonded, they should be connected by a plus sign +. If they get un-bound (like divorced) they should be connected by a minus sign - for one Loop / cycle and then will be split apart for the next to a random location.
7. Offspring should be born in the middle of the parents with their own square brackets and plus signs between each parent. Once the Offspring is in the second 20% of its life, it should be able to bond with another Life Form and unbounded with its parents who will be re-bonded just with themselves and showing a plus sign between them. The Offspring that was just un-bonded will move to a random location on the Game Field.
8. Can we use Emoji instead of ASCII characters for the Life Forms?
9. Make the emoji array contain all of these:
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
10. Just a few more minor changes after some testing.
    1. Do not remove Species from the right pane when they go extinct. Leave them there so I can refer back to it.
    2. For some reason the Event Log is no longer showing up. I had want it to be 25% of the middle column's height in relation to the browser document window height and 75% for the Game Field in height. Now it doesn't show up at all!
