import React, { useState } from 'react';

// Define the properties expected by the component
interface ExtracurricularAchievementsProps {
  onNext?: () => void;
  onBack?: () => void;
}

// Define the structure for a single achievement entry
interface Achievement {
  id: number;
  type: string;
  title: string;
  level: string;
  description: string;
  customType: string;
  customLevel: string;
}

export default function ExtracurricularAchievements({ onNext, onBack }: ExtracurricularAchievementsProps): React.ReactElement {
  const [skipped, setSkipped] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 1, type: '', title: '', level: '', description: '', customType: '', customLevel: '' }
  ]);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const validate = (): boolean => {
    if (skipped) return true;
    // Only the first achievement is mandatory
    const first = achievements[0];
    const hasType = first.type === 'Other' ? first.customType.trim() !== '' : first.type !== '';
    const hasLevel = first.level === 'Other' ? first.customLevel.trim() !== '' : first.level !== '';
    const isValid = hasType && hasLevel;
    if (!isValid) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return isValid;
  };

  const handleNext = (): void => {
    if (validate()) {
      if (onNext) onNext();
    }
  };

  const addAchievement = (): void => {
    setAchievements([...achievements, { id: Date.now(), type: '', title: '', level: '', description: '', customType: '', customLevel: '' }]);
  };

  const updateAchievement = (id: number, field: keyof Achievement, value: string): void => {
    setAchievements(achievements.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAchievement = (id: number): void => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  return (
    <div className="fade-in bg-gradient-to-br from-amber-50/70 to-orange-50/70 shadow-lg rounded-2xl border-0 p-6 md:p-8 mb-8 transition-all duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl text-white shadow-lg text-2xl transform hover:scale-110 transition-transform">
          🏆
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 m-0 tracking-tight">Extracurricular Achievements</h2>
      </div>

      {/* Error Box - above skip */}
      {showErrors && !skipped && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-xl text-white shadow-md text-xl shrink-0">
            ⚠️
          </div>
          <div className="flex flex-col">
            <span className="text-red-800 font-bold">Incomplete Fields Detected</span>
            <span className="text-red-600 text-sm">Please fill all mandatory fields marked with (*) before continuing.</span>
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div
        className={`mb-8 p-5 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all duration-300 transform hover:translate-y-[-2px] shadow-sm ${skipped ? 'bg-blue-50/60 border-blue-300 shadow-blue-100'
            : showErrors ? 'border-red-500 bg-white/80'
              : 'bg-white/80 border-slate-200 hover:border-amber-300 hover:bg-white'
          }`}
        onClick={() => setSkipped(!skipped)}
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${skipped ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
          {skipped && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
        </div>
        <span className={`text-base font-bold tracking-tight ${skipped ? 'text-blue-900' : 'text-slate-700'}`}>
          Skip this section
        </span>
      </div>

      {!skipped ? (
        <div className="flex flex-col gap-6">
          {achievements.map((item, index) => (
            <div key={item.id} className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 relative">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr_1fr] gap-6 mb-5 items-end">

                {/* Category Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">Category {index === 0 && <span className="text-red-500">*</span>}</label>
                  <div className={`w-full rounded-xl border-2 bg-white transition-all ${showErrors && index === 0 && !item.type ? 'border-red-500' : 'border-slate-200'}`}>
                    {item.type === 'Other' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type category..."
                          className="h-12 rounded-xl bg-transparent px-4 w-full outline-none text-slate-800 font-medium"
                          value={item.customType}
                          onChange={(e) => updateAchievement(item.id, 'customType', e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => updateAchievement(item.id, 'type', '')}
                          className="h-12 w-12 flex items-center justify-center bg-slate-100 border-l border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 text-xl font-bold rounded-r-xl shrink-0"
                          title="Back to list"
                        >
                          ↺
                        </button>
                      </div>
                    ) : (
                      <select
                        value={item.type}
                        onChange={(e) => updateAchievement(item.id, 'type', e.target.value)}
                        className="h-12 rounded-xl bg-transparent px-4 w-full outline-none text-slate-800 font-medium cursor-pointer"
                      >
                        <option value="" disabled>Select Category</option>
                        <option>STEM</option>
                        <option>Leadership</option>
                        <option>Social</option>
                        <option>Sports</option>
                        <option>Fine Arts</option>
                        <option>Performing Arts</option>
                        <option>None</option>
                        <option>Other</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Title Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">Achievement</label>
                  <input
                    type="text"
                    placeholder="e.g. State Level Football Runner-up"
                    value={item.title}
                    onChange={(e) => updateAchievement(item.id, 'title', e.target.value)}
                    className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 w-full outline-none transition-all text-slate-800 font-medium focus:border-amber-400 focus:ring-4 focus:ring-amber-50/50"
                  />
                </div>

                {/* Level Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">Level {index === 0 && <span className="text-red-500">*</span>}</label>
                  <div className={`w-full rounded-xl border-2 bg-white transition-all ${showErrors && index === 0 && !item.level ? 'border-red-500' : 'border-slate-200'}`}>
                    {item.level === 'Other' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type level..."
                          className="h-12 rounded-xl bg-transparent px-4 w-full outline-none text-slate-800 font-medium"
                          value={item.customLevel}
                          onChange={(e) => updateAchievement(item.id, 'customLevel', e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => updateAchievement(item.id, 'level', '')}
                          className="h-12 w-12 flex items-center justify-center bg-slate-100 border-l border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 text-xl font-bold rounded-r-xl shrink-0"
                          title="Back to list"
                        >
                          ↺
                        </button>
                      </div>
                    ) : (
                      <select
                        value={item.level}
                        onChange={(e) => updateAchievement(item.id, 'level', e.target.value)}
                        className="h-12 rounded-xl bg-transparent px-4 w-full outline-none text-slate-800 font-medium cursor-pointer"
                      >
                        <option value="" disabled>Select Level</option>
                        <option>National</option>
                        <option>Zonal</option>
                        <option>School</option>
                        <option>Other</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">Brief Description</label>
                <input
                  type="text"
                  placeholder="What did you learn or achieve? (e.g. Led the team to victory...)"
                  className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 w-full outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50/50 transition-all text-slate-800 font-medium"
                  value={item.description}
                  onChange={(e) => updateAchievement(item.id, 'description', e.target.value)}
                />
              </div>

              {index > 0 && (
                <button
                  onClick={() => removeAchievement(item.id)}
                  className="absolute -top-2 -right-2 h-8 w-8 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md z-10"
                  title="Remove achievement"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addAchievement}
            className="mt-6 w-full bg-amber-50 hover:bg-amber-100 border-2 border-dashed border-amber-400 text-amber-700 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md text-lg"
          >
            <span className="text-xl leading-none">+</span> Add Achievement
          </button>
        </div>
      ) : (
        <div className="fade-in bg-white/60 p-10 rounded-2xl border-2 border-blue-100 text-center shadow-inner">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 text-blue-500">
            ⏸️
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            This section has been skipped.
          </h3>
          <p className="text-slate-600 text-base">
            Your branch recommendation will not be affected by skipping this section.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-10 gap-4 w-full">
        <button
          className="w-full md:w-auto bg-white border border-slate-200 text-slate-500 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 transition-opacity"
          onClick={handleNext}
        >
          Save & continue →
        </button>
      </div>
    </div>
  );
}
