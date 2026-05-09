import { useState } from 'react';
import GameComponent from '../game/GameComponent';
import { useAuth } from '../context/AuthContext';

const Play = () => {
  const { user, profile } = useAuth();
  const [key, setKey] = useState(0);

  // Force remount game if needed
  const restartGame = () => {
    setKey(prev => prev + 1);
  };

  if (!user || !profile) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="flex-grow flex flex-col bg-black overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white font-[var(--font-press-start)] text-xs opacity-50 pointer-events-none">
        PLAYER: {profile.username}
      </div>
      
      {/* Game Container */}
      <div className="flex-grow w-full h-full flex items-center justify-center">
        <GameComponent key={key} userId={user.id} onRestart={restartGame} />
      </div>
    </div>
  );
};

export default Play;
