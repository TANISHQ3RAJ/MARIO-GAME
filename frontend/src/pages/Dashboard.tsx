import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Play, Trophy, Coins, Gamepad2 } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();

  if (!profile) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Player Stats */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <UserAvatar id={profile.avatar_id} size={120} />
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center border-2 border-zinc-700">
                <UserAvatar id={profile.avatar_id} size={64} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{profile.username}</h2>
                <span className="text-zinc-500 text-sm">Player ID: #{profile.id.substring(0, 8)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                <Trophy className="mx-auto text-[var(--color-coin-gold)] mb-2" size={24} />
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Best Score</div>
                <div className="text-2xl font-black">{profile.best_score.toLocaleString()}</div>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                <Coins className="mx-auto text-yellow-400 mb-2" size={24} />
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Coins</div>
                <div className="text-2xl font-black">{profile.total_coins.toLocaleString()}</div>
              </div>
              <div className="col-span-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center flex justify-between items-center px-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Gamepad2 size={20} /> <span className="font-bold">Games Played</span>
                </div>
                <div className="text-2xl font-black">{profile.total_games}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Recent */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="bg-gradient-to-r from-[var(--color-mario-blue)] to-blue-600 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between text-white shadow-xl">
            <div>
              <h3 className="text-2xl font-black font-[var(--font-press-start)] mb-2 tracking-tighter">Ready to Flip?</h3>
              <p className="text-blue-100 mb-4 sm:mb-0">Jump back into the action and beat your high score.</p>
            </div>
            <Link to="/play" className="px-8 py-4 bg-white text-blue-600 font-black rounded-xl hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2 text-lg">
              <Play fill="currentColor" /> PLAY NOW
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent Updates</h3>
            </div>
            <div className="text-zinc-400 text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
              No recent activity found. Play a game to see your history!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const UserAvatar = ({ id, size }: { id: number, size: number }) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500'];
  const color = colors[(id - 1) % colors.length] || colors[0];
  
  return (
    <div className={`${color} rounded-full flex items-center justify-center font-bold text-white shadow-inner border-4 border-black/20`} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      M{id}
    </div>
  );
}

export default Dashboard;
