import { useState } from 'react'

interface SettingsProps {
  difficulty: 'easy' | 'medium' | 'hard'
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void
  disabled?: boolean
}

export const Settings = ({ difficulty, onDifficultyChange, disabled }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        disabled={disabled}
      >
        <svg
          className="w-6 h-6 text-gray-800"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 13.616v-3.232l-2.91-.482a9.96 9.96 0 0 0-.926-2.238l1.71-2.4-2.282-2.282-2.4 1.71a9.96 9.96 0 0 0-2.238-.926L14.616 0h-3.232l-.482 2.91a9.96 9.96 0 0 0-2.238.926l-2.4-1.71L3.982 4.408l1.71 2.4a9.96 9.96 0 0 0-.926 2.238L0 9.384v3.232l2.91.482a9.96 9.96 0 0 0 .926 2.238l-1.71 2.4 2.282 2.282 2.4-1.71a9.96 9.96 0 0 0 2.238.926l.482 2.91h3.232l.482-2.91a9.96 9.96 0 0 0 2.238-.926l2.4 1.71 2.282-2.282-1.71-2.4a9.96 9.96 0 0 0 .926-2.238l2.91-.482zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg p-4 transform transition-all">
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
