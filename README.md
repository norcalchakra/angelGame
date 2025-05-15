# Social Puzzle Game

A multiplayer puzzle game built with Phaser, Supabase, and JavaScript. Users can upload images, create puzzles, and share them with friends.

## Features

- User authentication with Supabase
- Upload your own images to create puzzles
- Share puzzles with friends via unique IDs
- Sliding puzzle gameplay using Phaser game engine
- Responsive design for both desktop and mobile

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd social-puzzle-game
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project in Supabase (https://supabase.io)
2. Create the following tables in your Supabase database:

#### profiles table
- id (uuid, primary key, references auth.users)
- username (text, not null)
- created_at (timestamp with time zone, default: now())

#### puzzles table
- id (uuid, primary key, default: uuid_generate_v4())
- user_id (uuid, not null, references profiles)
- image_url (text, not null)
- grid_size (integer, default: 3)
- created_at (timestamp with time zone, default: now())

3. Set up Row Level Security (RLS) policies for your tables

### 4. Configure environment variables

Rename `.env.example` to `.env` and update the values:

```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### 5. Update Supabase configuration

In `public/js/supabase.js`, replace the placeholders with your Supabase project URL and anon key:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 6. Start the server

```bash
npm start
```

The application will be available at http://localhost:3000

## Deployment to Hostinger

1. Create a ZIP file of your project (excluding node_modules)
2. Log in to your Hostinger account
3. Go to Website > Auto Installer > Custom Website
4. Upload and extract your ZIP file
5. Set up a Node.js environment in Hostinger
6. Install dependencies: `npm install`
7. Start the server: `npm start`

Alternatively, you can use Hostinger's Git deployment if your project is in a Git repository.

## Project Structure

- `server.js` - Express server setup
- `public/` - Front-end files
  - `index.html` - Main HTML file
  - `css/` - CSS styles
  - `js/` - JavaScript files
    - `supabase.js` - Supabase configuration and database functions
    - `auth.js` - Authentication handling
    - `puzzle.js` - Puzzle game mechanics
    - `game.js` - Phaser game setup
    - `main.js` - Main application logic

## License

MIT
