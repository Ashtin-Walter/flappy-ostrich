import React from 'react';

interface ScoreProps {
  score: number;
}

const Score: React.FC<ScoreProps> = ({ score }) => {
  return (
    <div className="score">
      <h2 className="text-2xl font-bold">Score: {score}</h2>
    </div>
  );
};

export default Score;