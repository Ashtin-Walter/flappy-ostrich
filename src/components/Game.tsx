'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Ostrich from './Ostrich'
import Obstacle from './Obstacle'
import Score from './Score'
import { Settings } from './Settings'
import { GameState } from '../types/gameTypes'
import { GRAVITY, JUMP_FORCE, GAME_WIDTH, GAME_HEIGHT, OSTRICH_SIZE, OBSTACLE_WIDTH, 
         OBSTACLE_GAP, HORIZON_Y, DIFFICULTY_SETTINGS } from '../constants/gameConstants'

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

export const Game = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [gameStatus, setGameStatus] = useState({
    isPlaying: false,
    score: 0,
    highScore: 0,
    gameOver: false
  })
  const [nextObstacleId, setNextObstacleId] = useState(0)

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
    setGameStatus({
      isPlaying: true,
      score: 0,
      highScore: gameStatus.highScore,
      gameOver: false
    })
    setGameState(INITIAL_STATE)
    setNextObstacleId(0)
  }

  const handleJump = useCallback(() => {
    if (!gameStatus.isPlaying) return
    jumpSound?.play().catch(() => {})
    setGameState(prev => ({ ...prev, velocity: JUMP_FORCE }))
  }, [gameStatus.isPlaying])

  const checkCollision = useCallback((ostrichBox: any, obstacles: any[]) => {
    return obstacles.some(obs => {
      const topPipeCollision = (
        ostrichBox.right > obs.x &&
        ostrichBox.left < obs.x + OBSTACLE_WIDTH &&
        ostrichBox.top < obs.y
      )
      const bottomPipeCollision = (
        ostrichBox.right > obs.x &&
        ostrichBox.left < obs.x + OBSTACLE_WIDTH &&
        ostrichBox.bottom > obs.y + OBSTACLE_GAP
      )
      return topPipeCollision || bottomPipeCollision
    })
  }, [])

  const updateGameState = useCallback(() => {
    setGameState(prev => {
      const newY = prev.ostrichPosition.y + prev.velocity
      const newVelocity = prev.velocity + GRAVITY

      const currentSpeed = DIFFICULTY_SETTINGS[prev.difficulty]?.speed ?? 3
      const currentSpacing = DIFFICULTY_SETTINGS[prev.difficulty]?.spacing ?? 300

      const newObstacles = prev.obstacles
        .map(obs => ({ ...obs, x: obs.x - currentSpeed }))
        .filter(obs => obs.x > -OBSTACLE_WIDTH)

      if (newObstacles.length === 0 || 
          newObstacles[newObstacles.length - 1].x < GAME_WIDTH - currentSpacing) {
        const height = Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 50) + 50
        newObstacles.push({
          id: nextObstacleId,
          x: GAME_WIDTH,
          y: height,
          height: GAME_HEIGHT,
          passed: false
        })
        setNextObstacleId(prev => prev + 1)
      }

      const ostrichBox = {
        left: prev.ostrichPosition.x,
        right: prev.ostrichPosition.x + OSTRICH_SIZE.width,
        top: newY,
        bottom: newY + OSTRICH_SIZE.height
      }

      const hasCollision = checkCollision(ostrichBox, newObstacles)

      const newBackgroundElements = prev.backgroundElements
        .map(elem => ({ ...elem, x: elem.x - currentSpeed * 0.5 }))
        .filter(elem => elem.x > -100)

      if (Math.random() < 0.01) {
        newBackgroundElements.push(generateBackgroundElement('cloud'))
      }
      if (Math.random() < 0.02) {
        newBackgroundElements.push(generateBackgroundElement('bush'))
      }

      if (hasCollision || newY > GAME_HEIGHT - OSTRICH_SIZE.height || newY < 0) {
        collisionSound?.play().catch(() => {})
        setGameStatus(prev => ({ ...prev, isPlaying: false, gameOver: true }))
        return prev
      }

      newObstacles.forEach(obstacle => {
        if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < prev.ostrichPosition.x) {
          obstacle.passed = true
          setGameStatus(prev => ({ ...prev, score: prev.score + 1 }))
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
  }, [checkCollision, nextObstacleId])

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
    if (!gameStatus.isPlaying) return

    const gameLoop = setInterval(() => {
      updateGameState()
    }, 1000 / 60)

    return () => clearInterval(gameLoop)
  }, [gameStatus.isPlaying, updateGameState])

  const gameElements = useMemo(() => ({
    background: (
      <div 
        className="absolute w-full"
        style={{
          top: HORIZON_Y - 20,
          height: GAME_HEIGHT - HORIZON_Y + 20,
          background: `linear-gradient(to bottom, #4ade80 0%, #22c55e 30%, #16a34a 100%)`,
          borderTopLeftRadius: '50% 20px',
          borderTopRightRadius: '50% 20px',
          transform: 'scaleX(1.2)',
        }}
      />
    ),
    backgroundElements: gameState.backgroundElements.map(elem => (
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
    ))
  }), [gameState.backgroundElements])

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
          disabled={gameStatus.isPlaying}
        />

        {gameElements.background}
        {gameElements.backgroundElements}

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

            <div className="space-y-4">
              <button 
                onClick={startGame}
                className="w-full bg-yellow-500 text-white px-6 py-3 rounded-full font-bold
                          hover:bg-yellow-600 transition-colors"
              >
                {gameStatus.gameOver ? 'Play Again' : 'Start Game'}
              </button>
              
              <button 
                onClick={() => window.location.href = 'https://github.com/AshtinJW-Dev/flappy-ostrich'}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-full font-bold
                          hover:bg-gray-700 transition-colors"
              >
                View Source
              </button>
              
              {!gameStatus.gameOver && (
                <div className="mt-6 text-sm text-gray-600">
                  <p>Press SPACE or click to jump</p>
                  <p>Avoid the obstacles and survive!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {gameStatus.isPlaying && (
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
            <Score score={gameStatus.score} />
          </>
        )}
      </div>
    </div>
  )
}