import React, { useState } from 'react'

export default function SkillTagInput({ skills, onChange }) {
  const [input, setInput] = useState('')

  const addSkill = () => {
    const trimmed = input.trim()
    if (trimmed && !skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      onChange([...skills, trimmed])
    }
    setInput('')
  }

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills.length - 1)
    }
  }

  return (
    <div>
      <div className="min-h-[44px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-blue-500">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="text-blue-400 hover:text-blue-700 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addSkill}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter…' : ''}
          className="flex-1 min-w-[140px] text-sm outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Press Enter or Tab to add each skill</p>
    </div>
  )
}
