import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black mb-6 text-center font-[var(--font-press-start)] text-[var(--color-mario-red)] tracking-tight">LOGIN</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-zinc-400 mb-1 text-sm font-bold">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-mario-blue)] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 text-sm font-bold">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-mario-blue)] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full mt-4 bg-[var(--color-mario-blue)] hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-[0_4px_0_#005B82] hover:translate-y-1 hover:shadow-[0_0px_0_#005B82] transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Enter Game'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500">
          Don't have an account? <Link to="/register" className="text-[var(--color-mario-red)] hover:underline font-bold">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
