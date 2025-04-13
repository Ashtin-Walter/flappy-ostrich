import React, { memo, useEffect, useState } from 'react';
import { MOVING_OBSTACLE_SETTINGS } from '@/constants/gameConstants';

interface ObstacleProps {
  position: { x: number; y: number };
  gap: number;
  size: { width: number; height: number };
  type?: 'standard' | 'moving' | 'breakable';
  pattern?: 'single' | 'double' | 'zigzag';
}

const Obstacle: React.FC<ObstacleProps> = ({ position, gap, size, type = 'standard', pattern = 'single' }) => {
  const [breakState, setBreakState] = useState(0);
  const [offset, setOffset] = useState(0);

  // Handle moving obstacles
  useEffect(() => {
    if (type === 'moving') {
      let animationFrame: number;
      let startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const newOffset = Math.sin(elapsed * MOVING_OBSTACLE_SETTINGS.frequency) 
                         * MOVING_OBSTACLE_SETTINGS.amplitude;
        setOffset(newOffset);
        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [type]);

  const getObstacleStyle = (isTop: boolean) => {
    const baseStyle = {
      position: 'absolute',
      width: `${size.width}px`,
      left: `${position.x}px`,
      background: type === 'breakable' 
        ? `linear-gradient(90deg, #b45309 0%, #92400e 100%)`
        : `linear-gradient(90deg, #2da44e 0%, #238636 100%)`,
      border: type === 'breakable'
        ? '2px solid #78350f'
        : '2px solid #216e39',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2), inset 0 0 5px rgba(255,255,255,0.2)',
      zIndex: 10,
      transform: type === 'moving' ? `translateY(${offset}px)` : undefined,
      transition: type === 'moving' ? 'transform 0.1s linear' : undefined,
      opacity: type === 'breakable' ? 1 - breakState * 0.25 : 1,
    } as const;

    if (isTop) {
      return {
        ...baseStyle,
        top: 0,
        height: `${position.y}px`,
      };
    }

    return {
      ...baseStyle,
      top: `${position.y + gap}px`,
      height: `${size.height - (position.y + gap)}px`,
    };
  };

  const pipeCapStyle = {
    position: 'absolute',
    width: `${size.width + 10}px`,
    height: '15px',
    left: `${position.x - 5}px`,
    background: type === 'breakable'
      ? 'linear-gradient(90deg, #b45309 0%, #92400e 100%)'
      : 'linear-gradient(90deg, #2c974b 0%, #216e39 100%)',
    border: type === 'breakable'
      ? '2px solid #78350f'
      : '2px solid #165c2a',
    borderRadius: '6px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    zIndex: 11,
    transform: type === 'moving' ? `translateY(${offset}px)` : undefined,
    transition: type === 'moving' ? 'transform 0.1s linear' : undefined,
    opacity: type === 'breakable' ? 1 - breakState * 0.25 : 1,
  } as const;

  const handleBreak = () => {
    if (type === 'breakable' && breakState < 3) {
      setBreakState(prev => prev + 1);
    }
  };

  return (
    <>
      {/* Top pipe */}
      <div
        style={getObstacleStyle(true)}
        className={`transition-transform duration-200 ${
          type === 'breakable' ? 'cursor-pointer hover:brightness-110' : ''
        }`}
        onClick={type === 'breakable' ? handleBreak : undefined}
      />
      {/* Top pipe cap */}
      <div
        style={{
          ...pipeCapStyle,
          top: `${position.y - 12}px`,
        }}
      />
      
      {/* Bottom pipe */}
      <div
        style={getObstacleStyle(false)}
        className={`transition-transform duration-200 ${
          type === 'breakable' ? 'cursor-pointer hover:brightness-110' : ''
        }`}
        onClick={type === 'breakable' ? handleBreak : undefined}
      />
      {/* Bottom pipe cap */}
      <div
        style={{
          ...pipeCapStyle,
          top: `${position.y + gap - 3}px`,
        }}
      />
    </>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default memo(Obstacle);