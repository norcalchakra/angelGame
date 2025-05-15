// Puzzle mechanics class
class PuzzleGame {
  constructor(config) {
    this.scene = config.scene;
    this.image = config.image;
    this.gridSize = config.gridSize || 3;
    this.tileSize = config.tileSize || 100;
    this.padding = config.padding || 10;
    
    this.tiles = [];
    this.emptyTile = { row: this.gridSize - 1, col: this.gridSize - 1 };
    this.isInitialized = false;
    this.moves = 0;
    this.gameCompleted = false;
    
    // Event emitter
    this.events = new Phaser.Events.EventEmitter();
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    // Load the image
    await this.loadImage();
    
    // Create the tiles
    this.createTiles();
    
    // Shuffle the tiles
    this.shuffleTiles();
    
    this.isInitialized = true;
    this.moves = 0;
    this.gameCompleted = false;
    
    // Emit initialization event
    this.events.emit('initialized');
  }
  
  async loadImage() {
    return new Promise((resolve) => {
      // Create a temporary image element to get dimensions
      const img = new Image();
      img.onload = () => {
        // Determine the game size based on image dimensions
        this.imageWidth = img.width;
        this.imageHeight = img.height;
        
        // Calculate the tile size
        const aspectRatio = this.imageWidth / this.imageHeight;
        if (aspectRatio > 1) {
          // Landscape
          this.gameWidth = this.tileSize * this.gridSize;
          this.gameHeight = this.gameWidth / aspectRatio;
        } else {
          // Portrait
          this.gameHeight = this.tileSize * this.gridSize;
          this.gameWidth = this.gameHeight * aspectRatio;
        }
        
        // Calculate the individual tile dimensions
        this.tileWidth = this.gameWidth / this.gridSize;
        this.tileHeight = this.gameHeight / this.gridSize;
        
        resolve();
      };
      img.src = this.image;
    });
  }
  
  createTiles() {
    // Clear existing tiles
    this.tiles = [];
    
    // Calculate offset to center the puzzle
    const offsetX = (this.scene.cameras.main.width - this.gameWidth) / 2;
    const offsetY = (this.scene.cameras.main.height - this.gameHeight) / 2;
    
    // Create sprites for each tile
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        // Skip the last tile (empty space)
        if (row === this.gridSize - 1 && col === this.gridSize - 1) continue;
        
        // Create a sprite with a section of the image
        const x = offsetX + col * this.tileWidth + this.tileWidth / 2;
        const y = offsetY + row * this.tileHeight + this.tileHeight / 2;
        
        const tile = this.scene.add.sprite(x, y, 'puzzleImage');
        
        // Set the tile's frame to show only a portion of the image
        tile.setDisplaySize(this.tileWidth - this.padding, this.tileHeight - this.padding);
        
        // Store tile's grid position
        tile.originalPosition = { row, col };
        tile.currentPosition = { row, col };
        
        // Set tile's texture frame
        this.setTileFrame(tile);
        
        // Make the tile interactive
        tile.setInteractive();
        
        // Add the tile to our array
        this.tiles.push(tile);
      }
    }
    
    // Set up input handler
    this.scene.input.on('gameobjectdown', this.onTileClicked, this);
  }
  
  setTileFrame(tile) {
    const { row, col } = tile.currentPosition;
    
    // Calculate the crop rectangle based on the tile's position
    const frameWidth = this.imageWidth / this.gridSize;
    const frameHeight = this.imageHeight / this.gridSize;
    
    // Create a texture frame for the tile
    tile.setCrop(
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight
    );
  }
  
  shuffleTiles() {
    // Only do this if we're not in debug mode
    if (this.scene.game.config.debug) return;
    
    // Perform a series of random valid moves to shuffle
    for (let i = 0; i < 100; i++) {
      const possibleTiles = this.getMovableTiles();
      const randomTile = Phaser.Utils.Array.GetRandom(possibleTiles);
      if (randomTile) {
        this.moveTile(randomTile, false);
      }
    }
  }
  
  onTileClicked(pointer, gameObject) {
    if (this.gameCompleted) return;
    
    // Check if the clicked tile can be moved
    const tile = gameObject;
    const { row, col } = tile.currentPosition;
    
    // Check if this tile is adjacent to the empty space
    if (this.canMoveTile(row, col)) {
      this.moveTile(tile, true);
    }
  }
  
  canMoveTile(row, col) {
    const { row: emptyRow, col: emptyCol } = this.emptyTile;
    
    // A tile can move if it's adjacent to the empty space (horizontally or vertically)
    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  }
  
  moveTile(tile, countMove = true) {
    const { row: tileRow, col: tileCol } = tile.currentPosition;
    const { row: emptyRow, col: emptyCol } = this.emptyTile;
    
    // Calculate new position
    const offsetX = (this.scene.cameras.main.width - this.gameWidth) / 2;
    const offsetY = (this.scene.cameras.main.height - this.gameHeight) / 2;
    
    const newX = offsetX + emptyCol * this.tileWidth + this.tileWidth / 2;
    const newY = offsetY + emptyRow * this.tileHeight + this.tileHeight / 2;
    
    // Animate the tile movement
    this.scene.tweens.add({
      targets: tile,
      x: newX,
      y: newY,
      duration: 200,
      ease: 'Power2'
    });
    
    // Update positions
    tile.currentPosition = { row: emptyRow, col: emptyCol };
    this.emptyTile = { row: tileRow, col: tileCol };
    
    // Count the move if requested
    if (countMove) {
      this.moves++;
      this.events.emit('move', this.moves);
      
      // Check if the puzzle is solved
      this.checkPuzzleCompletion();
    }
  }
  
  getMovableTiles() {
    const movableTiles = [];
    const { row: emptyRow, col: emptyCol } = this.emptyTile;
    
    // Check all tiles and find those that are adjacent to the empty space
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const { row, col } = tile.currentPosition;
      
      if (this.canMoveTile(row, col)) {
        movableTiles.push(tile);
      }
    }
    
    return movableTiles;
  }
  
  checkPuzzleCompletion() {
    // Check if all tiles are in their original positions
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const { row: currentRow, col: currentCol } = tile.currentPosition;
      const { row: originalRow, col: originalCol } = tile.originalPosition;
      
      if (currentRow !== originalRow || currentCol !== originalCol) {
        // Puzzle not completed
        return false;
      }
    }
    
    // If we get here, the puzzle is completed
    this.gameCompleted = true;
    this.events.emit('completed', this.moves);
    return true;
  }
  
  destroy() {
    // Remove all tiles
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].destroy();
    }
    
    // Clear the array
    this.tiles = [];
    
    // Remove input handler
    this.scene.input.off('gameobjectdown', this.onTileClicked, this);
    
    this.isInitialized = false;
  }
}
