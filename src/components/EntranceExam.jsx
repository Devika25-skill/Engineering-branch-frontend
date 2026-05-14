import { useState } from 'react';

const EXAM_OPTIONS = ['JEE Main', 'JEE Advanced', 'State CET', 'Other'];

export default function EntranceExam() {
  const [skipped, setSkipped] = useState(false);
  const [exams, setExams] = useState([
    { id: 'initial-exam', name: 'JEE Main', percentile: '', rank: '', customName: '' }
  ]);

  const updateExam = (id, field, value) => {
    setExams(exams.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addExam = () => {
    setExams([...exams, { id: Date.now(), name: '', percentile: '', rank: '', customName: '' }]);
  };

  const removeExam = (id) => {
    if (exams.length > 1) {
      setExams(exams.filter(e => e.id !== id));
    }
  };

  return (
    <div className="fade-in bg-gradient-to-br from-purple-50/90 to-fuchsia-50/90 shadow-lg rounded-2xl border-0 p-6 md:p-8 mb-8 transition-all duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl text-white shadow-lg text-2xl transform hover:scale-110 transition-transform">
          🎯
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 m-0 tracking-tight">Entrance Exam Scores</h2>
      </div>

      {/* Skip Option */}
      <div
        className={`mb-8 p-5 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all duration-300 transform hover:translate-y-[-2px] shadow-sm ${skipped ? 'bg-blue-50/60 border-blue-300 shadow-blue-100' : 'bg-white/80 border-slate-200 hover:border-purple-300 hover:bg-white'}`}
        onClick={() => setSkipped(!skipped)}
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${skipped ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
          {skipped && <span className="text-white text-xs font-bold">✅</span>}
        </div>
        <span className={`text-base font-bold tracking-tight ${skipped ? 'text-blue-900' : 'text-slate-700'}`}>
          Skip this section
        </span>
      </div>

      {!skipped ? (
        <div className="flex flex-col gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 relative">
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-6 items-end">

                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">Exam Name</label>
                  {exam.name === 'Other' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. BITSAT"
                        className="h-12 rounded-xl border-2 border-purple-200 bg-white px-4 w-full outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-slate-800 font-medium"
                        value={exam.customName}
                        onChange={(e) => updateExam(exam.id, 'customName', e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => updateExam(exam.id, 'name', '')}
                        className="h-12 w-12 flex items-center justify-center bg-slate-100 border-2 border-slate-200 rounded-xl hover:bg-slate-200 transition-colors text-slate-600 text-xl font-bold"
                        title="Back to list"
                      >
                        ↺
                      </button>
                    </div>
                  ) : (
                    <select
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 w-full outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 transition-all text-slate-800 font-medium cursor-pointer hover:border-purple-200"
                      value={exam.name}
                      onChange={(e) => updateExam(exam.id, 'name', e.target.value)}
                    >
                      <option value="" disabled>Select Exam</option>
                      {EXAM_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>

                {exam.name !== 'JEE Advanced' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">Percentile / Score</label>
                    <input
                      type="text"
                      placeholder="e.g. 98.5"
                      value={exam.percentile}
                      onChange={(e) => updateExam(exam.id, 'percentile', e.target.value)}
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 w-full outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 transition-all text-slate-800 font-medium"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 font-bold text-sm uppercase tracking-wider ml-1">All India Rank (AIR)</label>
                  <div className="relative group/rank">
                    <input
                      type="text"
                      placeholder="e.g. 15000"
                      value={exam.rank}
                      onChange={(e) => updateExam(exam.id, 'rank', e.target.value)}
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 w-full outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50/50 transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              {exams.length > 1 && (
                <button
                  onClick={() => removeExam(exam.id)}
                  className="absolute -top-2 -right-2 h-8 w-8 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md z-10"
                  title="Remove exam"
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
            onClick={addExam}
            className="mt-4 w-full bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-400 text-purple-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span className="text-xl leading-none">+</span> Add Exam
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
    </div>
  );
}
