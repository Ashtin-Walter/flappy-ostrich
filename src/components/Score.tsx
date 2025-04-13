import React, { memo } from 'react';

interface ScoreProps {
  score: number;
}

const Score: React.FC<ScoreProps> = ({ score }) => {
  return (
    <div 
      className="absolute top-4 right-4 text-4xl font-bold text-white text-shadow-lg"
      style={{
        textShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
        zIndex: 20,
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))',
        padding: '6px 12px',
        borderRadius: '8px',
        backdropFilter: 'blur(3px)',
      }}
    >
      {score.toString().padStart(3, '0')}
    </div>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(Score);