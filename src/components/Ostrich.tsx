import { OstrichProps } from './Game'

const Ostrich = ({ position, size }: OstrichProps) => {
  return (
    <div
      className="absolute transition-transform"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 10,
      }}
    >
      <div className="w-full h-full bg-amber-400 rounded-full relative">
        {/* Ostrich body */}
        <div className="absolute inset-0 bg-amber-500 rounded-full transform scale-90" />
        {/* Ostrich beak */}
        <div className="absolute left-3/4 top-1/4 w-1/4 h-1/4 bg-orange-600 rounded-r-full" />
        {/* Ostrich eye */}
        <div className="absolute left-2/3 top-1/4 w-[8px] h-[8px] bg-black rounded-full" />
      </div>
    </div>
  )
}

export default Ostrich