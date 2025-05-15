// Game configuration
const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#f8f8f8',
  scene: {
    preload: preload,
    create: create
  }
};

// Game instance
let game = null;
let puzzle = null;
let currentPuzzleId = null;
let gameText = null;
let movesText = null;
let imageUrl = null;

// Function to initialize the game
function initGame(imageUrl, gridSize = 3) {
  if (game) {
    game.destroy(true);
  }
  
  game = new Phaser.Game(gameConfig);
  game.imageUrl = imageUrl;
  game.gridSize = gridSize;
}

// Preload function for Phaser scene
function preload() {
  // Load puzzle image
  this.load.image('puzzleImage', game.imageUrl);
  
  // Load UI elements
  this.load.image('buttonBg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAyCAYAAAAZUZThAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEI5OEI5ODkwNzBFMTFFQTk0NkFDNjJGNDhBMzc3OUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEI5OEI5OEEwNzBFMTFFQTk0NkFDNjJGNDhBMzc3OUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4Qjk4Qjk4NzA3MEUxMUVBOTQ2QUM2MkY0OEEzNzc5QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4Qjk4Qjk4ODA3MEUxMUVBOTQ2QUM2MkY0OEEzNzc5QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pm2YvycAAAQxSURBVHja7JxdSBRRFMd3191VE6OgD6Isgh4CQQpKooeEHoJMw15KKHwIfOjFjFLMh8AnIXoqLEiix0ACISL7IigioYdEfAiUQPqgVNDUdNvz39xZhtm5M7uzM+uM5w+/cWfm3vOfPfO/595z77ohLS0tuQgyyZhH38/oQG8uDVaZbvq+Rn16U7lPfxbZ7ug+YKbpzaZ3HcB6ZNNbQi/oAjJNbx8Abe+F9LZq52aUuuWIcWshfT/zQIUBqcPUPgKgj+T9+JjJ76r2fcgEMDOaFkk8qQxCUBv93zxEj+v2TS0qAHpDr4LeZwP4H+m9I+89erf1D9YSr6HqXSGjdIFxR+IDdvq4jjZGz30F7uVYJqj9Gr6lQPqifYBpXTyLVJHOAZhvtLOPxk/T+0XGPIXXdtLbqbQv1AKKkN5ptY/G95LRFkDuQ3OP9g2F5EvgBdYA5Dq9s2QovXe1/o6QcWVwmtK2Qp1L5yS9M2SgLo7m9OWNwBbAKwJIF71Tctt9pQ13SHsTxWpqDyArTpuClO30bqNtnrQtlW/6Gu75nNL+WK+DQ4vIXDaAHKXRyQBIFdp/Q1+b3g46WG0A0onPFPo+w1oFrDsw7gXW4SX9QCnWRSnzMB2nYBKglPDtcB2flbo0KZbB/9sEjwHoC3E6FKSUAbTEY/xMJnUpXaBXUcIzugDIEQAsxhd6iyZOh2LARpVkwXXqUkiCqyEZ5XVfVj9TgpyHmFRYyXjHcWwDIXkdE6tPXXaE5PpERokk8Cmp0rlA60dC+n6TKl0k1bo4Sbc2Rp0tHDdDcG7mWxfgXJmNKp0Nt1gPQiKuxKknpE6HZWKVKl1ekPFzpErXpEsXYFwLcG6dLl2sACn0mMlFPlTpMqCkXI1SpXOli1TpYuliBUihhyLdbtRFpEqXSpcuVngU0nss1bowQE5Alc5Kl2Kq0o1BlW59uriQYqVI4PnKE9LY+UpRVerIcK+lSgdA3uhSpUuxvBVY9VKlGx8gRZ6XWqYuDEghUqsRuVaXKt0EVOliAdLmcTVrRrp0YUCa4RkSrdJJlW58VbpcqNI1SpUutS7TpYsVHo0YfNYSr8qWKt3461JKY2cp7bpQgnUYA+CiBlWLVOmiulRBlS6nUxerS+VnUqVLjS5+VOli4VEL73/FmK5YUqVL/7oUO6jSzXFdOvFcqlDZHkVnQDk3kSvJmJOKKp1U6WYHIOvQeVaeY8UDJIXnmHOoSsdmNhNXMlKlm/m65Fg8l+KOQCkBKaKDBUiz4rVQpZv5uuR4PJdiA9p4kVxPrxmexWvD6WyRn5kDvIYMmHGVLv9TanKjPMxLVGDliUBdwgDZHOOd1akKTL7l0XYhixkw9sGSC1EcG1L/h1T8L8AA1PJGbceUdXwAAAAASUVORK5CYII=');
  
  // Add loading text
  this.loadingText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Loading...', {
    font: '32px Arial',
    fill: '#444'
  }).setOrigin(0.5);
}

// Create function for Phaser scene
function create() {
  const self = this;
  
  // Center coordinates
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // Create background
  this.add.rectangle(centerX, centerY, this.cameras.main.width - 40, this.cameras.main.height - 40, 0xffffff, 0.8)
    .setStrokeStyle(2, 0x4a69bd);
  
  // Add game title
  this.add.text(centerX, 50, 'Puzzle Challenge', {
    font: '28px Arial',
    fill: '#4a69bd'
  }).setOrigin(0.5);
  
  // Initialize puzzle
  puzzle = new PuzzleGame({
    scene: this,
    image: game.imageUrl,
    gridSize: game.gridSize,
    tileSize: 100
  });
  
  puzzle.initialize().then(() => {
    // Remove loading text
    if (this.loadingText) this.loadingText.destroy();
    
    // Add moves counter
    movesText = this.add.text(centerX, this.cameras.main.height - 40, 'Moves: 0', {
      font: '18px Arial',
      fill: '#333'
    }).setOrigin(0.5);
    
    // Listen for puzzle events
    puzzle.events.on('move', function(moves) {
      movesText.setText('Moves: ' + moves);
    }, this);
    
    puzzle.events.on('completed', function(moves) {
      // Show completion message
      gameText = self.add.text(centerX, 100, 'Puzzle Completed!', {
        font: '24px Arial',
        fill: '#22aa22'
      }).setOrigin(0.5);
      
      // Show play again button
      const playAgainButton = self.add.image(centerX, self.cameras.main.height - 80, 'buttonBg')
        .setDisplaySize(200, 50)
        .setInteractive({ useHandCursor: true });
      
      self.add.text(centerX, self.cameras.main.height - 80, 'Play Again', {
        font: '18px Arial',
        fill: '#ffffff'
      }).setOrigin(0.5);
      
      playAgainButton.on('pointerdown', function() {
        // Reset the puzzle
        puzzle.destroy();
        puzzle.initialize();
        
        // Reset moves
        movesText.setText('Moves: 0');
        
        // Remove completion message and button
        gameText.destroy();
        playAgainButton.destroy();
        this.destroy();
      });
    }, this);
  });
}

// Function to start a new puzzle
function startNewPuzzle(imageUrl, puzzleId, gridSize = 3) {
  currentPuzzleId = puzzleId;
  initGame(imageUrl, gridSize);
  
  // Show the share container
  const shareContainer = document.getElementById('share-container');
  const puzzleIdSpan = document.getElementById('puzzle-id');
  
  shareContainer.style.display = 'block';
  puzzleIdSpan.textContent = puzzleId;
}
