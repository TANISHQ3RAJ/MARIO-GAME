import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Crown } from 'lucide-react';

interface ScoreEntry {
  score: number;
  level_reached: number;
  coins_collected: number;
  played_at: string;
  profiles: {
    username: string;
    avatar_id: number;
  };
}

const Leaderboard = () => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all-time' | 'weekly'>('all-time');

  useEffect(() => {
    fetchScores();

    const subscription = supabase
      .channel('public:scores')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, () => {
        fetchScores();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeTab]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('scores')
        .select('score, level_reached, coins_collected, played_at, profiles(username, avatar_id)')
        .order('score', { ascending: false })
        .limit(100);

      if (data) {
        setScores(data as unknown as ScoreEntry[]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black font-[var(--font-press-start)] tracking-tighter text-white mb-2">Global Rankings</h1>
          <p className="text-zinc-400">The top 100 AntiGravity players.</p>
        </div>
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button 
            onClick={() => setActiveTab('all-time')}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${activeTab === 'all-time' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            All-Time
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${activeTab === 'weekly' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {loading && (
          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-coin-gold)]"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-zinc-800 w-16 text-center">Rank</th>
                <th className="p-4 font-bold border-b border-zinc-800">Player</th>
                <th className="p-4 font-bold border-b border-zinc-800 text-right">Score</th>
                <th className="p-4 font-bold border-b border-zinc-800 text-center hidden sm:table-cell">Level</th>
                <th className="p-4 font-bold border-b border-zinc-800 text-center hidden md:table-cell">Coins</th>
                <th className="p-4 font-bold border-b border-zinc-800 text-right hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {scores.map((entry, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                
                let RankIcon = null;
                let rankColor = "text-zinc-500";
                let rowBg = "hover:bg-zinc-800/50";
                
                if (rank === 1) {
                  RankIcon = <Crown className="text-yellow-400 mx-auto" size={24} />;
                  rankColor = "text-yellow-400 font-black text-xl";
                  rowBg = "bg-yellow-500/10 border-l-4 border-l-yellow-400 hover:bg-yellow-500/20";
                } else if (rank === 2) {
                  RankIcon = <Medal className="text-gray-300 mx-auto" size={24} />;
                  rankColor = "text-gray-300 font-black text-lg";
                  rowBg = "bg-gray-400/10 border-l-4 border-l-gray-300 hover:bg-gray-400/20";
                } else if (rank === 3) {
                  RankIcon = <Medal className="text-amber-600 mx-auto" size={24} />;
                  rankColor = "text-amber-600 font-black text-lg";
                  rowBg = "bg-amber-600/10 border-l-4 border-l-amber-600 hover:bg-amber-600/20";
                }

                return (
                  <tr key={`${entry.profiles?.username}-${index}`} className={`transition-colors ${rowBg}`}>
                    <td className={`p-4 text-center ${rankColor}`}>
                      {RankIcon ? RankIcon : rank}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-xs border border-zinc-700">
                           M{entry.profiles?.avatar_id || 1}
                        </div>
                        <span className={`font-bold ${isTop3 ? 'text-white' : 'text-zinc-300'}`}>
                          {entry.profiles?.username || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-black font-[var(--font-press-start)] tracking-tighter ${isTop3 ? 'text-[var(--color-coin-gold)]' : 'text-white'}`}>
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-center text-zinc-400 hidden sm:table-cell">{entry.level_reached}</td>
                    <td className="p-4 text-center text-zinc-400 hidden md:table-cell">{entry.coins_collected}</td>
                    <td className="p-4 text-right text-zinc-500 text-sm hidden lg:table-cell">
                      {new Date(entry.played_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {scores.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    <Trophy className="mx-auto mb-4 opacity-50" size={48} />
                    <p>No scores found. Be the first to play!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
