import React, { memo } from 'react';
import { PowerUpType } from '@/types/gameTypes';
import { POWER_UP_SETTINGS } from '@/constants/gameConstants';

interface PowerUpProps {
  position: { x: number; y: number };
  type: PowerUpType;
  size: number;
}

interface PowerUpStatusProps {
  type: PowerUpType;
  remainingTime: number;
  maxDuration: number;
}

export const PowerUpStatus: React.FC<PowerUpStatusProps> = ({ type, remainingTime, maxDuration }) => {
  const settings = POWER_UP_SETTINGS[type];
  const progress = (remainingTime / maxDuration) * 100;

  return (
    <div className="flex items-center gap-2 bg-gray-800/80 rounded-full px-3 py-1">
      <span className="text-lg">{settings.icon}</span>
      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-200 ease-linear"
          style={{ 
            width: `${progress}%`,
            backgroundColor: settings.color
          }} 
        />
      </div>
    </div>
  );
};

const PowerUp: React.FC<PowerUpProps> = ({ position, type, size }) => {
  const settings = POWER_UP_SETTINGS[type];

  return (
    <div
      className="absolute animate-bounce"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        zIndex: 15
      }}
    >
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center text-xl"
        style={{
          background: `radial-gradient(circle, ${settings.color}80 0%, ${settings.color} 70%)`,
          boxShadow: `0 0 15px ${settings.color}80`,
          border: `2px solid ${settings.color}`,
        }}
      >
        {settings.icon}
      </div>
    </div>
  );
};

export default memo(PowerUp);