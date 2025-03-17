import React from 'react';

interface ScoreProps {
  score: number
  style?: React.CSSProperties
}

const Score: React.FC<ScoreProps> = ({ score, style }) => {
  return (
    <div 
      className="score absolute top-8 left-1/2 transform -translate-x-1/2 z-50"
      style={style}
    >
      <div className="bg-yellow-500/90 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white">
          Score: {score}
        </h2>
      </div>
    </div>
  );
};

export default Score;