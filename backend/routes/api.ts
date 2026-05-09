import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase with Service Role Key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Score Validation Formula Check
 * Final Score Formula: base_score = (distance * 10) + (coins * 50) + (level * 500)
 * flip_multiplier = 1 + (flips * 0.1) [capped at 3.0]
 * final = round(base_score * flip_multiplier)
 */
const validateScore = (data: any): boolean => {
  const { score, level_reached, coins_collected, gravity_flips, duration_seconds } = data;
  
  // Note: Since distance isn't explicitly passed separately in the request, 
  // we estimate distance_travelled based on duration or other metrics, or expect it in the payload.
  const distance = data.distance_travelled || (duration_seconds * 100); // Approximation if not provided

  const baseScore = (distance * 10) + (coins_collected * 50) + (level_reached * 500);
  const multiplier = Math.min(1 + (gravity_flips * 0.1), 3.0);
  const expectedScore = Math.round(baseScore * multiplier);

  // Allow 5% tolerance
  const tolerance = expectedScore * 0.05;
  
  return Math.abs(score - expectedScore) <= tolerance;
};

// POST /api/scores - Validate and insert a new score
router.post('/scores', async (req, res) => {
  try {
    const { user_id, score, level_reached, coins_collected, gravity_flips, duration_seconds, distance_travelled } = req.body;

    if (!user_id || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = validateScore({ score, level_reached, coins_collected, gravity_flips, duration_seconds, distance_travelled });

    if (!isValid) {
      console.warn(`[Cheat Detected] Invalid score payload from user ${user_id}:`, req.body);
      return res.status(400).json({ error: 'Score validation failed. Stop cheating!' });
    }

    // Insert into Supabase (bypasses RLS because we use Service Role Key)
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          user_id,
          score,
          level_reached,
          coins_collected,
          gravity_flips,
          duration_seconds
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Also update profile's best_score, total_games, total_coins
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
    if (profile) {
      const newBest = Math.max(profile.best_score || 0, score);
      await supabase.from('profiles').update({
        best_score: newBest,
        total_games: (profile.total_games || 0) + 1,
        total_coins: (profile.total_coins || 0) + coins_collected
      }).eq('id', user_id);
    }

    res.status(201).json({ message: 'Score submitted successfully', data });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard - Top 100 all-time
router.get('/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('score, level_reached, coins_collected, played_at, profiles(username, avatar_id)')
      .order('score', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/leaderboard/weekly - Top 100 current week
router.get('/leaderboard/weekly', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('weekly_leaderboard')
      .select('*')
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

// GET /api/profile/:username - Public profile stats
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_id, best_score, total_games, total_coins, created_at')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Profile not found' });
      throw error;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
