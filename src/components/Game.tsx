'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Ostrich from './Ostrich'
import Obstacle from './Obstacle'
import Score from './Score'
import { Settings } from './Settings'
import type { GameState, Position, PowerUpType, Obstacle as ObstacleType, PowerUp as PowerUpInterface, ActivePowerUp } from '../types/gameTypes'
import { GRAVITY, JUMP_FORCE, GAME_WIDTH, GAME_HEIGHT, OSTRICH_SIZE, OBSTACLE_WIDTH, 
         OBSTACLE_GAP, HORIZON_Y, DIFFICULTY_SETTINGS, POWER_UP_SETTINGS } from '../constants/gameConstants'
import useGameLoop from '@/hooks/useGameLoop' // Import the custom hook
import { checkCollision, generateObstacle } from '../utils/gameHelpers';
import PowerUp, { PowerUpStatus } from './PowerUp'

const INITIAL_STATE: GameState = {
  ostrichPosition: { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.5 },
  obstacles: [],
  velocity: 0,
  difficulty: 'medium',
  backgroundElements: [],
  powerUps: [],
  activePowerUps: []
}

// Updated sound hooks for better game experience
const useSound = (src: string) => {
  const soundRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    soundRef.current = new Audio(src);
    // Preload the sound for better performance
    soundRef.current.load(); 
  }, [src]);
  
  const play = () => {
    if (soundRef.current) {
      // Reset the audio to the beginning for quick successive plays
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(err => console.error(`Error playing sound: ${src}`, err));
    }
  };
  
  return play;
};

const generateBackgroundElement = (type: 'cloud' | 'bush') => {
  const baseY = type === 'cloud' 
    ? Math.random() * (HORIZON_Y - 100) // Clouds above horizon
    : HORIZON_Y - 10 // Trees along the horizon line
  
  return {
    id: Math.random(),
    x: GAME_WIDTH,
    y: baseY,
    type,
    size: type === 'cloud' 
      ? 0.8 + Math.random() * 0.4 
      : 0.6 + Math.random() * 0.3 // Slightly smaller trees
  }
}

const generatePowerUp = () => {
  const powerUpTypes = Object.keys(POWER_UP_SETTINGS) as PowerUpType[];
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  
  return {
    id: Math.random(),
    x: GAME_WIDTH,
    y: Math.random() * (GAME_HEIGHT - 100) + 50,
    type,
    size: 30,
    speed: 2 + Math.random()
  };
};

const generateObstaclePattern = (baseHeight: number, pattern: 'single' | 'double' | 'zigzag') => {
  const obstacles: Array<Omit<ObstacleType, 'id'>> = [];
  
  switch (pattern) {
    case 'single':
      obstacles.push({
        x: GAME_WIDTH,
        y: baseHeight,
        height: GAME_HEIGHT,
        type: 'standard'
      });
      break;
    case 'double':
      obstacles.push(
        {
          x: GAME_WIDTH,
          y: baseHeight,
          height: GAME_HEIGHT,
          type: 'standard'
        },
        {
          x: GAME_WIDTH + OBSTACLE_WIDTH + 80,
          y: baseHeight + (Math.random() > 0.5 ? 50 : -50),
          height: GAME_HEIGHT,
          type: 'standard'
        }
      );
      break;
    case 'zigzag':
      obstacles.push(
        {
          x: GAME_WIDTH,
          y: baseHeight,
          height: GAME_HEIGHT,
          type: 'moving'
        }
      );
      break;
  }
  
  return obstacles;
};

export const Game = () => {
  const jumpSound = useSound('/sounds/jump.mp3');
  const collisionSound = useSound('/sounds/collision.mp3');
  const collectSound = useSound('/sounds/collect.mp3');
  const powerUpSound = useSound('/sounds/powerup.mp3');

  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [gameStatus, setGameStatus] = useState({
    isPlaying: false,
    score: 0,
    highScore: 0,
    gameOver: false
  })
  const [nextObstacleId, setNextObstacleId] = useState(0)

  const [isPaused, setIsPaused] = useState(false);
  const [collectibles, setCollectibles] = useState<{ id: number; x: number; y: number; size: number; speed: number }[]>([]);
  const [isNightMode, setIsNightMode] = useState(false);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const generateCollectible = () => {
    return {
      id: Math.random(),
      x: GAME_WIDTH,
      y: Math.random() * (GAME_HEIGHT - 100) + 50,
      size: 20,
      speed: 2 + Math.random(), // Variable speed for more dynamic gameplay
    };
  };

  useEffect(() => {
    if (gameStatus.isPlaying && !isPaused) {
      const interval = setInterval(() => {
        setCollectibles((prev) => [...prev, generateCollectible()]);
      }, 10000); // Generate a collectible every 10 seconds

      return () => clearInterval(interval);
    }
  }, [gameStatus.isPlaying, isPaused]);

  useEffect(() => {
    if (gameStatus.score >= 30) {
      setIsNightMode(true);
    } else {
      setIsNightMode(false);
    }
  }, [gameStatus.score]);

  const handleCollectibleCollision = (ostrichBox: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }) => {
    setCollectibles((prev) =>
      prev.filter((item) => {
        const isColliding =
          ostrichBox.left < item.x + item.size &&
          ostrichBox.right > item.x &&
          ostrichBox.top < item.y + item.size &&
          ostrichBox.bottom > item.y;

        if (isColliding) {
          collectSound(); // Play collection sound
          setGameStatus((gs) => ({ ...gs, score: gs.score + 10 })); // Increased bonus points
        }

        return !isColliding;
      })
    );
  };

  const handlePowerUpCollision = (ostrichBox: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }) => {
    setGameState((prev) => {
      const collidedPowerUps: Array<PowerUpInterface> = [];
      const remainingPowerUps = prev.powerUps.filter((powerUp) => {
        const isColliding =
          ostrichBox.left < powerUp.x + powerUp.size &&
          ostrichBox.right > powerUp.x &&
          ostrichBox.top < powerUp.y + powerUp.size &&
          ostrichBox.bottom > powerUp.y;

        if (isColliding) {
          collidedPowerUps.push(powerUp);
          powerUpSound();
        }
        return !isColliding;
      });

      if (collidedPowerUps.length > 0) {
        const now = performance.now();
        const newActivePowerUps = [
          ...prev.activePowerUps.filter(p => p.startTime + p.duration > now),
          ...collidedPowerUps.map(p => ({
            type: p.type,
            startTime: now,
            duration: POWER_UP_SETTINGS[p.type].duration
          }))
        ];

        return {
          ...prev,
          powerUps: remainingPowerUps,
          activePowerUps: newActivePowerUps
        };
      }

      return prev;
    });
  };

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore')
    if (savedHighScore) setGameStatus(prev => ({ ...prev, highScore: parseInt(savedHighScore) }))
  }, [])

  useEffect(() => {
    if (gameStatus.gameOver && gameStatus.score > gameStatus.highScore) {
      setGameStatus(prev => ({ ...prev, highScore: gameStatus.score }))
      localStorage.setItem('highScore', gameStatus.score.toString())
    }
  }, [gameStatus.gameOver, gameStatus.score, gameStatus.highScore])

  const startGame = () => {
    setGameState({
      ...INITIAL_STATE,
      difficulty: gameState.difficulty, 
      backgroundElements: [], 
    });
    setGameStatus({
      isPlaying: true,
      score: 0,
      highScore: gameStatus.highScore,
      gameOver: false
    });
    setNextObstacleId(0);
    setCollectibles([]);
    setIsPaused(false);
  }

  const lastJumpRef = useRef<number | null>(null);

  // Quick reusable function to handle jumping with debounce protection
  const jump = useCallback(() => {
    if (!gameStatus.isPlaying || gameStatus.gameOver || isPaused) return false;
    
    // Only jump if not in a transition state
    if (lastJumpRef.current && performance.now() - lastJumpRef.current < 100) {
      return false;
    }
    
    lastJumpRef.current = performance.now();
    
    // Use requestAnimationFrame for better sync with rendering cycle
    requestAnimationFrame(() => {
      jumpSound();
      setGameState(prev => ({ ...prev, velocity: JUMP_FORCE }));
    });
    
    return true;
  }, [gameStatus.isPlaying, gameStatus.gameOver, isPaused, jumpSound]);

  const gameTick = useCallback((deltaTime: number) => {
    if (!gameStatus.isPlaying || isPaused) return;

    const dt = Math.min(deltaTime / (1000 / 60), 5);
    const now = performance.now();

    // Update power-ups positions and active status
    setGameState((prev) => {
      // Clean up expired power-ups
      const activeNow = prev.activePowerUps.filter(
        p => p.startTime + p.duration > now
      );

      // Update power-up positions
      const updatedPowerUps = prev.powerUps
        .map((powerUp) => ({
          ...powerUp,
          x: powerUp.x - powerUp.speed * dt
        }))
        .filter((powerUp) => powerUp.x > -powerUp.size);

      // Apply power-up effects
      let speedMultiplier = 1;
      let isInvincible = false;
      let hasDoubleJump = false;

      activeNow.forEach(active => {
        switch (active.type) {
          case 'slowMotion':
            speedMultiplier *= 0.5;
            break;
          case 'invincibility':
            isInvincible = true;
            break;
          case 'doubleJump':
            hasDoubleJump = true;
            break;
        }
      });

      // Update collectibles positions
      setCollectibles((prevCollectibles) =>
        prevCollectibles
          .map((item) => ({ 
            ...item, 
            x: item.x - item.speed * dt 
          }))
          .filter((item) => item.x > -item.size)
      );

      const newVelocity = prev.velocity + GRAVITY * dt;
      const newY = prev.ostrichPosition.y + newVelocity * dt;

      // Boundary check
      if (newY > GAME_HEIGHT - OSTRICH_SIZE.height || newY < 0) {
        collisionSound();
        setGameStatus((gs) => ({ ...gs, isPlaying: false, gameOver: true }));
        return prev;
      }

      const ostrichBox = {
        x: prev.ostrichPosition.x,
        y: newY,
        width: OSTRICH_SIZE.width,
        height: OSTRICH_SIZE.height
      };

      const currentSpeed = (DIFFICULTY_SETTINGS[prev.difficulty]?.speed ?? 3) * speedMultiplier;
      const currentSpacing = DIFFICULTY_SETTINGS[prev.difficulty]?.spacing ?? 300;

      // Update obstacles
      let scoreIncrement = 0;
      const newObstacles = prev.obstacles
        .map((obs) => {
          const newX = obs.x - currentSpeed * dt;
          if (!obs.passed && newX + OBSTACLE_WIDTH < prev.ostrichPosition.x) {
            obs.passed = true;
            scoreIncrement += 1;
          }
          return { ...obs, x: newX };
        })
        .filter((obs) => obs.x > -OBSTACLE_WIDTH);

      // Create new obstacles if needed
      if (
        newObstacles.length === 0 ||
        newObstacles[newObstacles.length - 1].x < GAME_WIDTH - currentSpacing
      ) {
        const height = Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 100) + 50;
        newObstacles.push({
          id: nextObstacleId,
          x: GAME_WIDTH,
          y: height,
          height: GAME_HEIGHT,
          passed: false,
        });
        setNextObstacleId((nid) => nid + 1);
      }

      // Check for collisions with obstacles
      const hasCollision = newObstacles.some((obs) =>
        checkCollision(
          ostrichBox,
          {
            x: obs.x,
            y: obs.y,
            width: OBSTACLE_WIDTH,
            height: obs.height,
            gap: OBSTACLE_GAP
          }
        )
      );

      // Check for collectible collisions
      handleCollectibleCollision({
        left: ostrichBox.x,
        right: ostrichBox.x + ostrichBox.width,
        top: ostrichBox.y,
        bottom: ostrichBox.y + ostrichBox.height
      });

      // Check for power-up collisions
      handlePowerUpCollision({
        left: ostrichBox.x,
        right: ostrichBox.x + ostrichBox.width,
        top: ostrichBox.y,
        bottom: ostrichBox.y + ostrichBox.height
      });

      if (hasCollision && !isInvincible) {
        collisionSound();
        setGameStatus((gs) => ({ ...gs, isPlaying: false, gameOver: true }));
        return prev;
      }

      if (scoreIncrement > 0) {
        setGameStatus(gs => ({ ...gs, score: gs.score + scoreIncrement }));
      }

      // Update background elements
      const backgroundSpeedMultiplier = 0.5;
      const newBackgroundElements = prev.backgroundElements
        .map(elem => ({ 
          ...elem, 
          x: elem.x - currentSpeed * backgroundSpeedMultiplier * dt 
        }))
        .filter(elem => elem.x > -100);

      if (Math.random() < 0.01 * dt) {
        newBackgroundElements.push(generateBackgroundElement('cloud'));
      }
      if (Math.random() < 0.02 * dt) {
        newBackgroundElements.push(generateBackgroundElement('bush'));
      }

      return {
        ...prev,
        ostrichPosition: { ...prev.ostrichPosition, y: newY },
        velocity: newVelocity,
        obstacles: newObstacles,
        backgroundElements: newBackgroundElements,
        powerUps: updatedPowerUps,
        activePowerUps: activeNow
      };
    });
  }, [gameStatus.isPlaying, isPaused, collisionSound, nextObstacleId, handleCollectibleCollision, handlePowerUpCollision]);

  useGameLoop(gameTick);

  // Separate keyboard handler with its own debounce logic
  useEffect(() => {
    const lastKeyPress = { current: 0 };
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      
      e.preventDefault();
      const now = performance.now();
      
      // Prevent rapid key presses
      if (now - lastKeyPress.current < 100) return;
      lastKeyPress.current = now;
      
      if (!gameStatus.isPlaying && !gameStatus.gameOver) {
        startGame();
      } else {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, gameStatus.isPlaying, gameStatus.gameOver, startGame]);

  useEffect(() => {
    if (gameStatus.isPlaying && !isPaused) {
      const interval = setInterval(() => {
        setGameState((prev) => {
          const newDifficulty = gameStatus.score >= 20 ? 'hard' : gameStatus.score >= 10 ? 'medium' : 'easy';
          return { ...prev, difficulty: newDifficulty };
        });
      }, 5000); // Adjust difficulty every 5 seconds

      return () => clearInterval(interval);
    }
  }, [gameStatus.isPlaying, gameStatus.score, isPaused]);

  // Add power-up generation effect
  useEffect(() => {
    if (gameStatus.isPlaying && !isPaused) {
      const interval = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          powerUps: [...prev.powerUps, generatePowerUp()]
        }));
      }, 15000); // Generate power-up every 15 seconds

      return () => clearInterval(interval);
    }
  }, [gameStatus.isPlaying, isPaused]);

  const gameElements = useMemo(() => ({
    background: (
      <div 
        className="absolute w-full"
        style={{
          top: HORIZON_Y - 20,
          height: GAME_HEIGHT - HORIZON_Y + 20,
          background: isNightMode
            ? `linear-gradient(to bottom, #1e3a8a 0%, #1e40af 30%, #1e429f 100%)`
            : `linear-gradient(to bottom, #4ade80 0%, #22c55e 30%, #16a34a 100%)`,
          borderTopLeftRadius: '50% 20px',
          borderTopRightRadius: '50% 20px',
          transform: 'scaleX(1.2)',
        }}
      />
    ),
    backgroundElements: (gameState?.backgroundElements || []).map(elem => (
      <div
        key={elem.id}
        className={`absolute ${
          elem.type === 'cloud' 
            ? 'text-white/80' 
            : 'text-green-900'
        }`}
        style={{
          left: elem.x,
          top: elem.y,
          transform: `translate(-50%, -50%) scale(${elem.size})`,
          fontSize: elem.type === 'cloud' ? '3rem' : '2.5rem',
          zIndex: 1,
        }}
      >
        {elem.type === 'cloud' ? '☁️' : '🌳'}
      </div>
    )),
    collectibles: collectibles.map((item) => (
      <div
        key={item.id}
        className="absolute animate-pulse"
        style={{
          left: item.x,
          top: item.y,
          width: item.size,
          height: item.size,
          background: 'radial-gradient(circle, #fef08a 0%, #facc15 70%, #eab308 100%)',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
          transform: 'translate(-50%, -50%)',
          zIndex: 15
        }}
      >
        <div
          className="absolute"
          style={{
            top: '15%',
            left: '25%',
            width: '25%',
            height: '25%',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
          }}
        />
      </div>
    )),
    powerUps: (gameState?.powerUps || []).map((powerUp) => (
      <PowerUp
        key={powerUp.id}
        position={{ x: powerUp.x, y: powerUp.y }}
        type={powerUp.type}
        size={powerUp.size}
      />
    )),

    activePowerUps: (gameState?.activePowerUps || []).map((powerUp) => {
      const now = performance.now();
      const remainingTime = powerUp.startTime + powerUp.duration - now;
      if (remainingTime <= 0) return null;

      return (
        <PowerUpStatus
          key={`${powerUp.type}-${powerUp.startTime}`}
          type={powerUp.type}
          remainingTime={remainingTime}
          maxDuration={powerUp.duration}
        />
      );
    }).filter(Boolean)
  }), [gameState?.backgroundElements, collectibles, isNightMode, gameState?.powerUps, gameState?.activePowerUps])

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default action and stop propagation for improved responsiveness
    e.preventDefault();
    e.stopPropagation();
    
    const now = performance.now();
    // Prevent double triggers from touch events
    if (lastJumpRef.current && now - lastJumpRef.current < 100) {
      return;
    }
    
    lastJumpRef.current = now;
    
    if (!gameStatus.isPlaying && !gameStatus.gameOver) {
      startGame();
    } else if (gameStatus.isPlaying && !isPaused) {
      // For better responsiveness, directly trigger jump with minimal overhead
      requestAnimationFrame(() => {
        jumpSound();
        setGameState(prev => ({ ...prev, velocity: JUMP_FORCE }));
      });
    }
  }, [gameStatus.isPlaying, gameStatus.gameOver, isPaused, startGame, jumpSound]);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-[800px] h-[600px] bg-gradient-to-b from-sky-200 to-sky-300 overflow-hidden mx-auto game-container" 
        onClick={handleInteraction} 
        onTouchStart={handleInteraction} 
        onTouchEnd={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        style={{ 
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none'
        }} 
        tabIndex={0} 
        role="application" 
        aria-label="Flappy Ostrich Game"
      >
        <div className="absolute top-4 left-4 flex space-x-2 z-20">
          <button
            onClick={togglePause}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <Settings 
            difficulty={gameState.difficulty}
            onDifficultyChange={(difficulty) => 
              setGameState(prev => ({ ...prev, difficulty }))
            }
            disabled={gameStatus.isPlaying}
            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          />
        </div>

        {gameElements.background}
        {gameElements.backgroundElements}
        {gameElements.collectibles}
        {gameElements.powerUps}

        {gameStatus.isPlaying && (
          <>
            <div className="absolute top-16 right-4 flex flex-col gap-2 z-20">
              {gameElements.activePowerUps}
            </div>
            <Ostrich 
              position={gameState.ostrichPosition} 
              size={OSTRICH_SIZE}
            />
            {gameState.obstacles.map((obstacle, index) => (
              <Obstacle 
                key={index}
                position={{ x: obstacle.x, y: obstacle.y }}
                gap={OBSTACLE_GAP}
                size={{ width: OBSTACLE_WIDTH, height: GAME_HEIGHT }}
              />
            ))}
            <Score score={gameStatus.score} />
          </>
        )}

        {!gameStatus.isPlaying && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         bg-white/90 p-8 rounded-lg shadow-lg text-center min-w-[300px]"
               style={{ zIndex: 50 }}>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              {gameStatus.gameOver ? 'Game Over!' : 'Flappy Ostrich'}
            </h2>
            
            {gameStatus.gameOver && (
              <div className="mb-6 space-y-2">
                <p className="text-xl text-gray-700">Score: {gameStatus.score}</p>
                <p className="text-xl text-gray-700">High Score: {gameStatus.highScore}</p>
              </div>
            )}

            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={startGame}
                className="w-full bg-yellow-500 text-white px-6 py-3 rounded-full font-bold
                          hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {gameStatus.gameOver ? 'Play Again' : 'Start Game'}
              </button>
              
              <button 
                onClick={() => window.location.href = 'https://github.com/AshtinJW-Dev/flappy-ostrich'}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-full font-bold
                          hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                View Source
              </button>
              
              {!gameStatus.gameOver && (
                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <p>Press SPACE or Click/Tap to jump</p>
                  <p>Avoid the obstacles and survive!</p>
                  <div className="mt-4 text-left">
                    <p className="font-medium mb-2">Power-ups:</p>
                    <ul className="space-y-1">
                      <li>⭐ Invincibility - Pass through obstacles</li>
                      <li>↑ Double Jump - Higher jumps</li>
                      <li>⏰ Slow Motion - Slows down obstacles</li>
                      <li>×2 Score Multiplier - Double points</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}