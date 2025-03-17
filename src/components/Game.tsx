'use client'

import { useState, useEffect, useCallback } from 'react'
import Ostrich from './Ostrich'
import Obstacle from './Obstacle'
import Score from './Score'
import { Settings } from './Settings'

interface GameState {
  ostrichPosition: { x: number; y: number }
  obstacles: Array<{ id: number; x: number; y: number; height: number; passed?: boolean }>
  velocity: number
  difficulty: 'easy' | 'medium' | 'hard'
  backgroundElements: Array<{ id: number; x: number; y: number; type: 'cloud' | 'bush'; size?: number }>
}

export interface OstrichProps {
  position: { x: number; y: number }; // The position of the ostrich
  size: { width: number; height: number }; // The size of the ostrich
}

const GRAVITY = 0.8
const JUMP_FORCE = -10
const DEFAULT_GAME_SPEED = 3

const DIFFICULTY_SETTINGS = {
  easy: { speed: 2, spacing: 350 },
  medium: { speed: 3, spacing: 300 },
  hard: { speed: 4, spacing: 250 }
} as const

const GAME_WIDTH = 800
const GAME_HEIGHT = 600
const OSTRICH_SIZE = { width: 60, height: 60 }
const OBSTACLE_WIDTH = 60
const OBSTACLE_GAP = 180
const MIN_HEIGHT = 50
const MAX_HEIGHT = GAME_HEIGHT - OBSTACLE_GAP - MIN_HEIGHT

const HORIZON_Y = GAME_HEIGHT * 0.7 // 70% down the screen for horizon line

interface BackgroundElement {
  id: number
  x: number
  y: number
  type: 'cloud' | 'bush'
  size?: number // Add variation to element sizes
}

const INITIAL_STATE: GameState = {
  ostrichPosition: { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.5 },
  obstacles: [],
  velocity: 0,
  difficulty: 'medium',
  backgroundElements: []
}

// Sound effects
const jumpSound = typeof window !== 'undefined' ? new Audio('/sounds/jump.mp3') : null
const collisionSound = typeof window !== 'undefined' ? new Audio('/sounds/collision.mp3') : null

// Add helper function for background elements
const generateBackgroundElement = (type: 'cloud' | 'bush'): BackgroundElement => {
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

export const Game = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [nextObstacleId, setNextObstacleId] = useState(0)

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore')
    if (savedHighScore) setHighScore(parseInt(savedHighScore))
  }, [])

  // Update high score
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score)
      localStorage.setItem('highScore', score.toString())
    }
  }, [gameOver, score, highScore])

  const startGame = () => {
    setIsPlaying(true)
    setScore(0)
    setGameOver(false)
    setGameState(INITIAL_STATE)
    setNextObstacleId(0)
  }

  const handleJump = useCallback(() => {
    if (!isPlaying) return
    jumpSound?.play().catch(() => {})
    setGameState(prev => ({
      ...prev,
      velocity: JUMP_FORCE
    }))
  }, [isPlaying])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleJump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleJump])

  useEffect(() => {
    if (!isPlaying) return

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newY = prev.ostrichPosition.y + prev.velocity
        const newVelocity = prev.velocity + GRAVITY

        // Update obstacles with safe difficulty access
        const currentSpeed = DIFFICULTY_SETTINGS[prev.difficulty]?.speed ?? DEFAULT_GAME_SPEED
        const currentSpacing = DIFFICULTY_SETTINGS[prev.difficulty]?.spacing ?? 300

        const newObstacles = prev.obstacles
          .map(obs => ({ ...obs, x: obs.x - currentSpeed }))
          .filter(obs => obs.x > -OBSTACLE_WIDTH)

        // Generate new obstacles
        if (newObstacles.length === 0 || 
            newObstacles[newObstacles.length - 1].x < GAME_WIDTH - currentSpacing) {
          const height = Math.random() * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT
          newObstacles.push({
            id: nextObstacleId,
            x: GAME_WIDTH,
            y: height,
            height: GAME_HEIGHT,
            passed: false
          })
          setNextObstacleId(prev => prev + 1)
        }

        // Check collisions
        const ostrichBox = {
          left: prev.ostrichPosition.x,
          right: prev.ostrichPosition.x + OSTRICH_SIZE.width,
          top: newY,
          bottom: newY + OSTRICH_SIZE.height
        }

        const hasCollision = newObstacles.some(obs => {
          // Check collision with top pipe
          const topPipeCollision = (
            ostrichBox.right > obs.x &&
            ostrichBox.left < obs.x + OBSTACLE_WIDTH &&
            ostrichBox.top < obs.y
          )

          // Check collision with bottom pipe
          const bottomPipeCollision = (
            ostrichBox.right > obs.x &&
            ostrichBox.left < obs.x + OBSTACLE_WIDTH &&
            ostrichBox.bottom > obs.y + OBSTACLE_GAP
          )

          return topPipeCollision || bottomPipeCollision
        })

        // Add background elements
        const newBackgroundElements = prev.backgroundElements
          .map(elem => ({ ...elem, x: elem.x - currentSpeed * 0.5 }))
          .filter(elem => elem.x > -100)

        // Separate generation for clouds and trees
        if (Math.random() < 0.01) {
          newBackgroundElements.push(generateBackgroundElement('cloud'))
        }
        if (Math.random() < 0.02) {
          newBackgroundElements.push(generateBackgroundElement('bush'))
        }

        if (hasCollision || newY > GAME_HEIGHT - OSTRICH_SIZE.height || newY < 0) {
          collisionSound?.play().catch(() => {})
          setIsPlaying(false)
          setGameOver(true)
          clearInterval(gameLoop)
          return prev
        }

        // Update score - check each obstacle
        newObstacles.forEach(obstacle => {
          if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < gameState.ostrichPosition.x) {
            obstacle.passed = true
            setScore(s => s + 1)
          }
        })

        return {
          ...prev,
          ostrichPosition: { ...prev.ostrichPosition, y: newY },
          velocity: newVelocity,
          obstacles: newObstacles,
          backgroundElements: newBackgroundElements
        }
      })
    }, 1000 / 60)

    return () => clearInterval(gameLoop)
  }, [isPlaying, gameState.ostrichPosition.x, nextObstacleId])

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-[800px] h-[600px] bg-gradient-to-b from-sky-200 to-sky-300 overflow-hidden mx-auto" 
        onClick={handleJump}
      >
        <Settings 
          difficulty={gameState.difficulty}
          onDifficultyChange={(difficulty) => 
            setGameState(prev => ({ ...prev, difficulty }))
          }
          disabled={isPlaying}
        />

        {/* Add multi-layered horizon with rolling hills */}
        <div 
          className="absolute w-full"
          style={{
            top: HORIZON_Y - 20,
            height: GAME_HEIGHT - HORIZON_Y + 20,
            background: `
              linear-gradient(
                to bottom,
                #4ade80 0%,    /* Light green at top */
                #22c55e 30%,   /* Medium green */
                #16a34a 100%   /* Darker green at bottom */
              )
            `,
            borderTopLeftRadius: '50% 20px',
            borderTopRightRadius: '50% 20px',
            transform: 'scaleX(1.2)',
          }}
        />

        {/* Render background elements in layers */}
        {gameState.backgroundElements
          .sort((a, b) => (a.type === 'cloud' ? -1 : 1)) // Ensure clouds render first (behind trees)
          .map(elem => (
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
                zIndex: elem.type === 'cloud' ? 1 : 2,
              }}
            >
              {elem.type === 'cloud' ? '☁️' : '🌳'}
            </div>
          ))}

        {!isPlaying && !gameOver && (
          <button 
            onClick={startGame}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-yellow-500 text-white px-6 py-3 rounded-full font-bold
                      hover:bg-yellow-600 transition-colors"
          >
            Start Game
          </button>
        )}

        {isPlaying && (
          <>
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
            <Score score={score} />
          </>
        )}

        {gameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-2">Score: {score}</p>
            <p className="mb-4">High Score: {highScore}</p>
            <button 
              onClick={startGame}
              className="bg-yellow-500 text-white px-6 py-3 rounded-full font-bold
                        hover:bg-yellow-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}