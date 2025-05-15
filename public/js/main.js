// DOM Elements
const uploadForm = document.getElementById('upload-form');
const imageUpload = document.getElementById('image-upload');
const connectBtn = document.getElementById('connect-btn');
const friendId = document.getElementById('friend-id');
const copyBtn = document.getElementById('copy-btn');

// Global state
let currentImageUrl = null;

// Event listeners
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Check if user is logged in
  const user = await db.getCurrentUser();
  if (!user) {
    showMessage('Please log in to upload images', 'error');
    return;
  }
  
  // Check if file is selected
  if (!imageUpload.files.length) {
    showMessage('Please select an image file', 'error');
    return;
  }
  
  const file = imageUpload.files[0];
  
  // Validate file type
  if (!file.type.match('image.*')) {
    showMessage('Please select an image file', 'error');
    return;
  }
  
  // Show loading message
  showMessage('Uploading image...', 'info');
  
  // Create form data
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    // Upload the image
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    currentImageUrl = data.imageUrl;
    
    // Save puzzle to database
    const { puzzle, error } = await db.savePuzzle(user.id, currentImageUrl);
    
    if (error) {
      throw error;
    }
    
    // Start the game with the uploaded image
    startNewPuzzle(currentImageUrl, puzzle.id);
    
    showMessage('Image uploaded successfully!', 'success');
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error uploading image: ' + error.message, 'error');
  }
});

connectBtn.addEventListener('click', async () => {
  const id = friendId.value.trim();
  
  if (!id) {
    showMessage('Please enter a valid puzzle ID', 'error');
    return;
  }
  
  try {
    // Get puzzle from database
    const { puzzle, error } = await db.getPuzzleById(id);
    
    if (error || !puzzle) {
      throw new Error('Puzzle not found');
    }
    
    // Start the game with the friend's puzzle
    startNewPuzzle(puzzle.image_url, puzzle.id, puzzle.grid_size);
    
    showMessage('Connected to friend\'s puzzle!', 'success');
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error finding puzzle: ' + error.message, 'error');
  }
});

copyBtn.addEventListener('click', () => {
  const puzzleId = document.getElementById('puzzle-id').textContent;
  
  // Create a temporary input element
  const tempInput = document.createElement('input');
  tempInput.value = puzzleId;
  document.body.appendChild(tempInput);
  
  // Select the input value
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices
  
  // Copy the text
  document.execCommand('copy');
  
  // Remove the temporary input
  document.body.removeChild(tempInput);
  
  showMessage('Puzzle ID copied to clipboard!', 'success');
});

// Initialize game options
function initGameOptions() {
  // Hide game options until logged in
  document.querySelector('.game-options').style.display = 'none';
  document.getElementById('share-container').style.display = 'none';
}

// Initialize the app
initGameOptions();
