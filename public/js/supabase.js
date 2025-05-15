// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Database functions
const db = {
  // User functions
  async createUser(email, password, username) {
    try {
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) throw error;
      
      // Create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: user.id, username, created_at: new Date() }
        ]);
      
      if (profileError) throw profileError;
      
      return { user, error: null };
    } catch (error) {
      console.error('Error creating user:', error);
      return { user: null, error };
    }
  },
  
  async loginUser(email, password) {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { user, error: null };
    } catch (error) {
      console.error('Error logging in:', error);
      return { user: null, error };
    }
  },
  
  async logoutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error logging out:', error);
      return { error };
    }
  },
  
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Puzzle functions
  async savePuzzle(userId, imageUrl, gridSize = 3) {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .insert([
          { 
            user_id: userId, 
            image_url: imageUrl, 
            grid_size: gridSize,
            created_at: new Date()
          }
        ])
        .select();
      
      if (error) throw error;
      
      return { puzzle: data[0], error: null };
    } catch (error) {
      console.error('Error saving puzzle:', error);
      return { puzzle: null, error };
    }
  },
  
  async getPuzzleById(puzzleId) {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*, profiles(username)')
        .eq('id', puzzleId)
        .single();
      
      if (error) throw error;
      
      return { puzzle: data, error: null };
    } catch (error) {
      console.error('Error getting puzzle:', error);
      return { puzzle: null, error };
    }
  },
  
  async getUserPuzzles(userId) {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { puzzles: data, error: null };
    } catch (error) {
      console.error('Error getting user puzzles:', error);
      return { puzzles: [], error };
    }
  }
};
