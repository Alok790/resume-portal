import React from 'react'

export default function MatchCard({
  jobTitle,
  jobDescription,
  matchPercentage,
  missingSkills,
  requiredSkills,
  matchedSkills,
  similarSkills,
  company,
  location,
  salary,
  experienceLevel,
  learningRecommended,
  learningRecommendations,
  demoMode = false,
  demoApplied = false,
  onDemoApply,
}) {
  const pct = Math.round(matchPercentage || 0)
  const exactMatches = matchedSkills || (requiredSkills || []).filter(
    s => !(missingSkills || []).map(m => m.toLowerCase()).includes(s.toLowerCase())
  )

  const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  const scoreColor = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base">{jobTitle}</h3>
          {(company || location || salary || experienceLevel) && (
            <p className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              {[company, location, salary, experienceLevel].filter(Boolean).join(' · ')}
            </p>
          )}
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
      {exactMatches.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Matched Skills</p>
          <div className="flex flex-wrap gap-1">
            {exactMatches.map(s => (
              <span key={s} className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {similarSkills?.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Related Skills</p>
          <div className="flex flex-wrap gap-1">
            {similarSkills.map(s => (
              <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {learningRecommended && learningRecommendations?.length > 0 && (
        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/40">
          <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
            Skills Recommended To Learn
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {learningRecommendations.map(skill => (
              <span key={skill} className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-xs text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                {skill}
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

      {demoMode && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sample opening · application is simulated
          </p>
          <button
            type="button"
            onClick={onDemoApply}
            disabled={demoApplied}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              demoApplied
                ? 'cursor-default bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {demoApplied ? '✓ Applied (Demo)' : 'Apply (Demo)'}
          </button>
        </div>
      )}
    </div>
  )
}
