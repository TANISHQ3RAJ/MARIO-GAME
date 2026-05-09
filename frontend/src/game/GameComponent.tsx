import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

interface GameComponentProps {
  userId: string;
  onRestart: () => void;
}

const GameComponent: React.FC<GameComponentProps> = ({ userId, onRestart }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800, x: 0 },
          debug: false
        }
      },
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      backgroundColor: '#1a1a2e'
    };

    const game = new Phaser.Game(config);

    game.registry.set('userId', userId);
    game.registry.set('onGameOver', (data: any) => {
      setScoreData(data);
      setGameOver(true);
    });

    return () => {
      game.destroy(true);
    };
  }, [userId]);

  const handleSubmitScore = async () => {
    if (!scoreData) return;

    try {
      const response = await fetch('http://localhost:3000/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...scoreData
        })
      });

      if (response.ok) {
        alert('Score submitted successfully!');
        onRestart();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit score');
    }
  };

  return (
    <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-[0_0_50px_rgba(4,156,216,0.3)] border-4 border-zinc-800">
      <div ref={gameRef} className="w-full h-full" />
      
      {/* Game Over Overlay */}
      {gameOver && scoreData && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <h2 className="text-4xl font-black text-[var(--color-mario-red)] mb-2 font-[var(--font-press-start)]">GAME OVER</h2>
            
            <div className="bg-zinc-950 rounded-xl p-4 my-6 border border-zinc-800 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Distance</span>
                <span className="font-bold">{Math.floor(scoreData.distance_travelled)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Coins</span>
                <span className="font-bold text-yellow-400">{scoreData.coins_collected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Gravity Flips</span>
                <span className="font-bold text-blue-400">{scoreData.gravity_flips}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-800">
                <span className="text-zinc-300 font-bold">Multiplier</span>
                <span className="font-black text-purple-400">x{Math.min(1 + scoreData.gravity_flips * 0.1, 3.0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-800">
                <span className="text-zinc-300 font-bold text-xl">Final Score</span>
                <span className="font-black text-white text-2xl font-[var(--font-press-start)] tracking-tighter">{scoreData.score}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={onRestart}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={handleSubmitScore}
                className="flex-1 bg-[var(--color-mario-blue)] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors shadow-[0_4px_0_#005B82] hover:translate-y-1 hover:shadow-[0_0px_0_#005B82]"
              >
                Submit Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameComponent;
