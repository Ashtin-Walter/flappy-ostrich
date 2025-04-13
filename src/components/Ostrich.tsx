import { useState, useEffect, memo, useCallback, useRef } from 'react'
import OstrichSprite from './OstrichSprite'

type OstrichProps = {
  position: { x: number; y: number };
  size: { width: number; height: number };
};

const Ostrich = ({ position, size }: OstrichProps) => {
  const [isFlapping, setIsFlapping] = useState(false)
  const [rotation, setRotation] = useState(0)
  const prevPositionRef = useRef(position.y)
  const flapTimeoutRef = useRef<number | null>(null)
  
  // Improved flap animation timing
  const startFlapAnimation = useCallback(() => {
    setIsFlapping(true)
    setRotation(-25) // Immediate response
    
    // Clear any existing timeouts
    if (flapTimeoutRef.current) {
      clearTimeout(flapTimeoutRef.current)
    }
    
    // Use requestAnimationFrame for smoother animation sequence
    requestAnimationFrame(() => {
      flapTimeoutRef.current = window.setTimeout(() => {
        setIsFlapping(false)
        // Smooth rotation transition
        requestAnimationFrame(() => {
          setRotation(-10)
          setTimeout(() => setRotation(5), 70)
          setTimeout(() => setRotation(15), 150)
        })
      }, 100)
    })
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup timeouts on unmount
      if (flapTimeoutRef.current) {
        clearTimeout(flapTimeoutRef.current)
      }
    }
  }, [])

  // Update rotation based on vertical movement
  useEffect(() => {
    const prevY = prevPositionRef.current
    prevPositionRef.current = position.y
    
    if (!isFlapping) {
      if (position.y < prevY && rotation > -15) {
        setRotation(prev => Math.max(prev - 3, -15))
      } 
      else if (position.y > prevY && rotation < 15) {
        setRotation(prev => Math.min(prev + 2, 15))
      }
    }
  }, [position.y, isFlapping, rotation])

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 10,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s linear',
        willChange: 'transform' // Optimize for animations
      }}
    >
      <OstrichSprite isFlapping={isFlapping} />
    </div>
  )
}

export default memo(Ostrich)