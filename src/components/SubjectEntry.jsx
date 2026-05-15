import { useState } from 'react';

const SUBJECTS_SCHOOL = [
  'English', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Civics / Political Science', 'Economics',
  'Hindi', 'Marathi', 'Sanskrit', 'Other Regional Language', 'Other / Custom'
];

const SUBJECTS_HIGHER = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Hindi', 'Marathi',
  'Geography', 'IT', 'Computer Science', 'Electronics', 'Automobile', 'Other / Custom'
];

const SUBJECTS_FY = [
  'Engineering Mathematics', 'Engineering Physics', 'Engineering Chemistry',
  'Basic Electrical Engineering', 'Engineering Graphics', 'Basic Mechanical Engineering',
  'Programming / Computer Programming', 'Communication Skills / English',
  'Workshop / Practical Labs', 'Other / Custom'
];

export default function SubjectEntry({ onNext, onBack }) {
  const [latestClass, setLatestClass] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [entries, setEntries] = useState([
    { id: 'sub1', subject: '', marks: '', total: 100, compulsory: true },
    { id: 'sub2', subject: '', marks: '', total: 100, compulsory: true },
    { id: 'sub3', subject: '', marks: '', total: 100, compulsory: true },
  ]);
  const [duplicateError, setDuplicateError] = useState(false);

  const isRowValid = (row) => {
    if (!row.compulsory) return true; // optional rows are always valid
    const hasSubject = row.subject === 'Other / Custom' ? (row.customName && row.customName.trim() !== '') : (row.subject !== '');
    const hasMarks = row.marks !== '' && row.marks !== null;
    const hasTotal = row.total !== '' && row.total !== null;
    return hasSubject && hasMarks && hasTotal;
  };

  const validate = () => {
    const hasClass = latestClass !== '';
    const allEntriesValid = entries.every(row => isRowValid(row));

    // Check for duplicate subjects
    const selectedSubjects = entries
      .map(row => row.subject === 'Other / Custom' ? (row.customName || '').trim().toLowerCase() : row.subject.toLowerCase())
      .filter(s => s !== '');
    const hasDuplicates = selectedSubjects.length !== new Set(selectedSubjects).size;

    const isValid = hasClass && allEntriesValid && !hasDuplicates;
    
    if (!isValid) {
      setShowErrors(true);
      setDuplicateError(hasDuplicates);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return isValid;
  };

  const handleNext = () => {
    if (validate()) {
      if (onNext) onNext();
    }
  };

  const addRow = () => setEntries([...entries, { id: Date.now(), subject: '', marks: '', total: 100, compulsory: false, customName: '' }]);

  const updateRow = (id, field, value) => {
    setEntries(entries.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removeRow = (id) => {
    setEntries(entries.filter(row => row.id !== id));
  };

  return (
    <div className="fade-in bg-gradient-to-br from-blue-50 to-indigo-46 shadow-lg rounded-2xl border-0 p-6 md:p-8 mb-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white shadow-md text-2xl">
          🎓
        </div>
        <h2 className="text-2xl font-bold text-slate-800 m-0">Academic Performance</h2>
      </div>

      {showErrors && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-xl text-white shadow-md text-xl shrink-0">
            ⚠️
          </div>
          <div className="flex flex-col">
            <span className="text-red-800 font-bold">Action Required</span>
            <span className="text-red-600 text-sm">Please select your class and fill all subject details before continuing.</span>
          </div>
        </div>
      )}

      {duplicateError && (
        <div className="mb-8 p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-xl text-white shadow-md text-xl shrink-0">
            🔁
          </div>
          <div className="flex flex-col">
            <span className="text-orange-800 font-bold">Duplicate Subjects Found</span>
            <span className="text-orange-600 text-sm">Each subject must be unique. Please remove the repeated entries.</span>
          </div>
        </div>
      )}

      {/* Class Selector */}
      <div className="mb-8">
        <label className="text-lg font-bold text-slate-700 block mb-3">
          Select your latest class <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4">
          <div className={`rounded-xl border-2 bg-white transition-all ${showErrors && !latestClass ? 'border-red-500' : 'border-slate-200'}`}>
            <select
              value={latestClass}
              onChange={(e) => setLatestClass(e.target.value)}
              className="h-12 rounded-xl bg-transparent px-4 w-full outline-none text-slate-800 cursor-pointer"
            >
              <option value="" disabled>Select your class</option>
              <option>FY Engineering</option>
              <option>12th grade</option>
              <option>11th grade</option>
              <option>10th grade</option>
              <option>9th grade</option>
            </select>
          </div>
          <div className="hidden md:block"></div>
          <div className="hidden md:block"></div>
          <div className="hidden md:block w-10"></div>
        </div>
      </div>

      {/* Sub Heading */}
      <h3 className="text-lg font-bold text-slate-700 mb-6 pb-2 border-b-2 border-indigo-100/50">
        Subject-wise Marks
      </h3>

      <div className="flex flex-col gap-5">
        {entries.map((row) => (
          <div
            key={row.id}
            className="relative grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 items-end bg-white/50 p-4 rounded-xl border border-indigo-100 shadow-sm"
          >
            <div>
              <label className="text-gray-600 font-semibold text-base block mb-2">Subject{row.compulsory ? <span className="text-red-500"> *</span> : ''}</label>
              <div className={`w-full rounded-xl border-2 bg-white transition-all ${showErrors && row.compulsory && !(row.subject === 'Other / Custom' ? row.customName?.trim() : row.subject) ? 'border-red-500' : 'border-slate-200'}`}>
                {row.subject === 'Other / Custom' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type subject name..."
                      className="h-10 rounded-xl bg-transparent px-3 w-full outline-none text-slate-800"
                      value={row.customName || ''}
                      onChange={(e) => updateRow(row.id, 'customName', e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => updateRow(row.id, 'subject', '')}
                      className="h-10 w-12 flex items-center justify-center bg-slate-100 border-l border-slate-200 hover:bg-slate-200 transition-colors text-slate-600 text-xl font-bold rounded-r-xl"
                      title="Back to list"
                    >
                      ↺
                    </button>
                  </div>
                ) : (
                  <select
                    value={row.subject}
                    onChange={(e) => updateRow(row.id, 'subject', e.target.value)}
                    className="h-10 rounded-xl bg-transparent px-3 w-full outline-none text-slate-800 cursor-pointer"
                  >
                    <option value="" disabled>Select Subject</option>
                    {(latestClass === 'FY Engineering' ? SUBJECTS_FY : (latestClass === '9th grade' || latestClass === '10th grade' ? SUBJECTS_SCHOOL : SUBJECTS_HIGHER))
                      .filter(s => s === row.subject || !entries.some(r => r.id !== row.id && r.subject === s))
                      .map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="text-gray-600 font-semibold text-base block mb-2">Marks{row.compulsory ? <span className="text-red-500"> *</span> : ''}</label>
              <input
                type="number"
                placeholder="eg. 85"
                value={row.marks}
                onChange={(e) => updateRow(row.id, 'marks', e.target.value)}
                className={`h-10 rounded-xl border-2 bg-white px-3 w-full outline-none transition-all text-slate-800 ${showErrors && row.compulsory && !row.marks ? 'border-red-500' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
              />
            </div>

            <div>
              <label className="text-gray-600 font-semibold text-base block mb-2">Out of{row.compulsory ? <span className="text-red-500"> *</span> : ''}</label>
              <input
                type="number"
                value={row.total}
                onChange={(e) => updateRow(row.id, 'total', e.target.value)}
                className={`h-10 rounded-xl border-2 bg-white px-3 w-full outline-none transition-all text-slate-800 ${showErrors && row.compulsory && !row.total ? 'border-red-500' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
              />
            </div>

            {!row.compulsory && (
              <button
                onClick={() => removeRow(row.id)}
                className="absolute -top-2 -right-2 h-10 w-10 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md z-10"
                title="Remove subject"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-8 w-full bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-400 text-blue-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <span className="text-xl leading-none">+</span> Add Subject
      </button>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-4 w-full">
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
