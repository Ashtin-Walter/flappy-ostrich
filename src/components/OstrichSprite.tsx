import { CSSProperties } from 'react'
import '../styles/sprite.css'

interface OstrichSpriteProps {
  isFlapping: boolean
  style?: CSSProperties
}

const OstrichSprite = ({ isFlapping, style }: OstrichSpriteProps) => {
  return (
    <div 
      className={`ostrich-sprite ${isFlapping ? 'flapping' : ''}`}
      style={style}
    >
      <div className="legs" />
      <div className="tail" />
    </div>
  )
}

export default OstrichSprite
