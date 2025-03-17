import React from 'react';

interface ObstacleProps {
  position: { x: number; y: number };
  gap: number;
  size: { width: number; height: number };
}

const Obstacle: React.FC<ObstacleProps> = ({ position, gap, size }) => {
  const pipeStyle = {
    position: 'absolute',
    width: `${size.width}px`,
    backgroundColor: '#2da44e',
    border: '2px solid #216e39',
    zIndex: 10,
  } as const;

  return (
    <>
      {/* Top pipe */}
      <div
        style={{
          ...pipeStyle,
          left: `${position.x}px`,
          top: 0,
          height: `${position.y}px`,
        }}
      />
      {/* Bottom pipe */}
      <div
        style={{
          ...pipeStyle,
          left: `${position.x}px`,
          top: `${position.y + gap}px`,
          height: `${size.height - (position.y + gap)}px`,
        }}
      />
    </>
  );
};

export default Obstacle;