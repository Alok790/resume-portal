import React from 'react'

export default function MatchCard({ jobTitle, jobDescription, matchPercentage, missingSkills, requiredSkills }) {
  const pct = Math.round(matchPercentage || 0)
  const matchedSkills = (requiredSkills || []).filter(
    s => !(missingSkills || []).map(m => m.toLowerCase()).includes(s.toLowerCase())
  )

  const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  const scoreColor = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base">{jobTitle}</h3>
          {jobDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{jobDescription}</p>
          )}
        </div>
        <span className={`text-2xl font-bold ${scoreColor} ml-4 shrink-0`}>{pct}%</span>
      </div>

      {/* Match progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Matched skills */}
      {matchedSkills.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Matched Skills</p>
          <div className="flex flex-wrap gap-1">
            {matchedSkills.map(s => (
              <span key={s} className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {missingSkills?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Missing Skills</p>
          <div className="flex flex-wrap gap-1">
            {missingSkills.map(s => (
              <span key={s} className="bg-red-50 text-red-600 border border-red-200 text-xs px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
