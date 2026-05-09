import express, { Router } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const router = Router();

app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation Logic
const validateScore = (data: any): boolean => {
  const { score, level_reached, coins_collected, gravity_flips, duration_seconds } = data;
  const distance = data.distance_travelled || (duration_seconds * 100);
  const baseScore = (distance * 10) + (coins_collected * 50) + (level_reached * 500);
  const multiplier = Math.min(1 + (gravity_flips * 0.1), 3.0);
  const expectedScore = Math.round(baseScore * multiplier);
  const tolerance = expectedScore * 0.05;
  return Math.abs(score - expectedScore) <= tolerance;
};

// Routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', serverless: true });
});

router.post('/scores', async (req, res) => {
  try {
    const { user_id, score, level_reached, coins_collected, gravity_flips, duration_seconds, distance_travelled } = req.body;

    if (!user_id || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = validateScore({ score, level_reached, coins_collected, gravity_flips, duration_seconds, distance_travelled });

    if (!isValid) {
      return res.status(400).json({ error: 'Score validation failed. Stop cheating!' });
    }

    const { data, error } = await supabase
      .from('scores')
      .insert([{ user_id, score, level_reached, coins_collected, gravity_flips, duration_seconds }])
      .select()
      .single();

    if (error) throw error;

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
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

app.use('/api', router);
app.use('/.netlify/functions/api', router); // Support both local and Netlify paths

export const handler = serverless(app);
