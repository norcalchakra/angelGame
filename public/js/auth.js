// Auth related DOM elements
const authStatus = document.getElementById('auth-status');
const userInfo = document.getElementById('user-info');
const usernameSpan = document.getElementById('username');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');

// Modal elements
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeBtns = document.querySelectorAll('.close');

// Forms
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Auth state
let currentUser = null;

// Event listeners
loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
  signupModal.style.display = 'block';
});

logoutBtn.addEventListener('click', async () => {
  const { error } = await db.logoutUser();
  if (!error) {
    updateAuthState(null);
    showMessage('Logged out successfully!', 'success');
  } else {
    showMessage('Error logging out: ' + error.message, 'error');
  }
});

closeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
  });
});

// Click outside modal to close
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
  if (e.target === signupModal) {
    signupModal.style.display = 'none';
  }
});

// Form submissions
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Basic validation
  if (!email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  const { user, error } = await db.loginUser(email, password);
  
  if (error) {
    showMessage('Login error: ' + error.message, 'error');
    return;
  }
  
  updateAuthState(user);
  loginModal.style.display = 'none';
  loginForm.reset();
  showMessage('Logged in successfully!', 'success');
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const username = document.getElementById('signup-username').value;
  
  // Basic validation
  if (!email || !password || !username) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }
  
  const { user, error } = await db.createUser(email, password, username);
  
  if (error) {
    showMessage('Signup error: ' + error.message, 'error');
    return;
  }
  
  updateAuthState(user);
  signupModal.style.display = 'none';
  signupForm.reset();
  showMessage('Account created successfully!', 'success');
});

// Update UI based on auth state
function updateAuthState(user) {
  currentUser = user;
  
  if (user) {
    authStatus.style.display = 'none';
    userInfo.style.display = 'flex';
    
    // Get user data from Supabase
    const userData = user.user_metadata || {};
    usernameSpan.textContent = userData.username || user.email;
    
    // Show game options
    document.querySelector('.game-options').style.display = 'grid';
  } else {
    authStatus.style.display = 'flex';
    userInfo.style.display = 'none';
    
    // Hide game options
    document.querySelector('.game-options').style.display = 'none';
  }
}

// Check auth state on page load
async function checkAuth() {
  const user = await db.getCurrentUser();
  updateAuthState(user);
}

// Simple notification function
function showMessage(message, type = 'info') {
  // Create message element if it doesn't exist
  let messageDiv = document.getElementById('message-div');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'message-div';
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '1000';
    document.body.appendChild(messageDiv);
  }
  
  // Set style based on message type
  switch(type) {
    case 'success':
      messageDiv.style.backgroundColor = '#4CAF50';
      messageDiv.style.color = 'white';
      break;
    case 'error':
      messageDiv.style.backgroundColor = '#f44336';
      messageDiv.style.color = 'white';
      break;
    default:
      messageDiv.style.backgroundColor = '#2196F3';
      messageDiv.style.color = 'white';
  }
  
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Initialize auth
checkAuth();
