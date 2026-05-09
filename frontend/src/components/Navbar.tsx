import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Gamepad2, Trophy, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 font-[var(--font-press-start)] text-sm tracking-tighter">
          <Gamepad2 className="text-[var(--color-mario-red)]" />
          ANTIGRAVITY <span className="text-[var(--color-mario-blue)]">MARIO</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/leaderboard" className="flex items-center gap-1 hover:text-[var(--color-coin-gold)] transition-colors">
            <Trophy size={18} /> <span className="hidden sm:inline">Leaderboard</span>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1 hover:text-[var(--color-mario-green)] transition-colors">
                <User size={18} /> <span className="hidden sm:inline">{profile?.username || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition-colors ml-4">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded bg-[var(--color-mario-red)] hover:bg-red-600 transition-colors text-white font-bold">Play Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
