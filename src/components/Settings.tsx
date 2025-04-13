import { useState } from 'react'

interface SettingsProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  disabled: boolean;
  className?: string;
}

export const Settings = ({ difficulty, onDifficultyChange, disabled, className }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${className || 'bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors'}`}
        disabled={disabled}
        aria-label="Game Settings"
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 13.616v-3.232l-2.91-.482a9.96 9.96 0 0 0-.926-2.238l1.71-2.4-2.282-2.282-2.4 1.71a9.96 9.96 0 0 0-2.238-.926L14.616 0h-3.232l-.482 2.91a9.96 9.96 0 0 0-2.238.926l-2.4-1.71L3.982 4.408l1.71 2.4a9.96 9.96 0 0 0-.926 2.238L0 9.384v3.232l2.91.482a9.96 9.96 0 0 0 .926 2.238l-1.71 2.4 2.282 2.282 2.4-1.71a9.96 9.96 0 0 0 2.238.926l.482 2.91h3.232l.482-2.91a9.96 9.96 0 0 0 2.238-.926l2.4 1.71 2.282-2.282-1.71-2.4a9.96 9.96 0 0 0 .926-2.238l2.91-.482zM12 15.616a3.616 3.616 0 1 1 0-7.232 3.616 3.616 0 0 1 0 7.232z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg p-4 transform transition-all z-30">
          <h3 className="text-gray-900 font-medium mb-2">Game Settings</h3>
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as 'easy' | 'medium' | 'hard')}
              disabled={disabled}
              className="w-full px-3 py-2 rounded border border-gray-300"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
