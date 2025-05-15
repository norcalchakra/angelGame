-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add Row Level Security (RLS) to profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles - users can read all profiles
CREATE POLICY "Users can read all profiles" ON public.profiles
    FOR SELECT USING (true);

-- Create policy for profiles - users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for profiles - users can only insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create puzzles table
CREATE TABLE IF NOT EXISTS public.puzzles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    grid_size INTEGER DEFAULT 3 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add Row Level Security (RLS) to puzzles table
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;

-- Create policy for puzzles - users can read all puzzles
CREATE POLICY "Users can read all puzzles" ON public.puzzles
    FOR SELECT USING (true);

-- Create policy for puzzles - users can only insert their own puzzles
CREATE POLICY "Users can insert their own puzzles" ON public.puzzles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for puzzles - users can only update their own puzzles
CREATE POLICY "Users can update their own puzzles" ON public.puzzles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for puzzles - users can only delete their own puzzles
CREATE POLICY "Users can delete their own puzzles" ON public.puzzles
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster puzzle lookup by user ID
CREATE INDEX puzzles_user_id_idx ON public.puzzles (user_id);
