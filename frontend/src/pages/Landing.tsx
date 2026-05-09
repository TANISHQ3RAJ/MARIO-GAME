import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpDown, Trophy, ShieldAlert } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black text-center p-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-mario-blue) 0%, transparent 50%)', backgroundSize: '100% 100%' }} />

      <div className="z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-6 inline-block bg-zinc-800 px-4 py-1 rounded-full text-sm font-semibold border border-zinc-700 text-[var(--color-coin-gold)]">
          V1.0 Live Now — Global Leaderboards Active
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-press-start)' }}>
          <span className="text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">AntiGravity</span>
          <br />
          <span className="text-[var(--color-mario-red)] drop-shadow-[0_4px_0_#8B0000]">Mario</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Flip gravity to walk on ceilings. Survive endless procedural platforms. Compete globally.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/register" className="group relative px-8 py-4 bg-[var(--color-mario-red)] text-white font-bold text-lg rounded-xl shadow-[0_6px_0_#8B0000] hover:translate-y-1 hover:shadow-[0_2px_0_#8B0000] transition-all flex items-center justify-center gap-2">
            Start Playing <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/leaderboard" className="px-8 py-4 bg-zinc-800 text-white font-bold text-lg rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
            <Trophy className="text-[var(--color-coin-gold)]" /> View Rankings
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm text-left">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <ArrowUpDown className="text-[var(--color-mario-blue)]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Gravity Flipping</h3>
            <p className="text-zinc-400">Press Spacebar to instantly invert gravity. Master momentum to survive.</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm text-left">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="text-[var(--color-coin-gold)]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Score Multipliers</h3>
            <p className="text-zinc-400">Chain gravity flips to increase your multiplier. High risk, high reward.</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm text-left">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
              <ShieldAlert className="text-[var(--color-mario-red)]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Server Validated</h3>
            <p className="text-zinc-400">Every score is cryptographically checked. No cheating, pure skill.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
