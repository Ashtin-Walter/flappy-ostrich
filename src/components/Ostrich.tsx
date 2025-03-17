import { OstrichProps } from './Game'
import { useState, useEffect } from 'react'
import OstrichSprite from './OstrichSprite'

const Ostrich = ({ position, size }: OstrichProps) => {
  const [isFlapping, setIsFlapping] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsFlapping(true)
        setTimeout(() => setIsFlapping(false), 200)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 10,
      }}
    >
      <OstrichSprite isFlapping={isFlapping} />
    </div>
  )
}

export default Ostrich