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

export default function SubjectEntry() {
  const [latestClass, setLatestClass] = useState('');
  const [entries, setEntries] = useState([
    { id: 'sub1', subject: '', marks: '', total: 100, compulsory: true },
    { id: 'sub2', subject: '', marks: '', total: 100, compulsory: true },
    { id: 'sub3', subject: '', marks: '', total: 100, compulsory: true },
  ]);

  const addRow = () => setEntries([...entries, { id: Date.now(), subject: '', marks: '', total: 100, compulsory: false, customName: '' }]);

  const updateRow = (id, field, value) => {
    setEntries(entries.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removeRow = (id) => {
    setEntries(entries.filter(row => row.id !== id));
  };

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <div className="section-icon">🎓</div>
        <h2 className="section-title">Academic Performance</h2>
      </div>

      {/* Class Selector */}
      <div className="class-selector-row">
        <div className="form-group">
          <label style={{ fontSize: '1.1rem', fontWeight: '700', color: '#4b5563', marginBottom: '12px', display: 'block' }}>
            Select your latest class
          </label>
          <select
            value={latestClass}
            onChange={(e) => setLatestClass(e.target.value)}
            className="subject-select"
            style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', width: '100%', maxWidth: '400px' }}
          >
            <option value="" disabled>Select your class</option>
            <option>FY Engineering</option>
            <option>12th grade</option>
            <option>11th grade</option>
            <option>10th grade</option>
            <option>9th grade</option>
          </select>
        </div>
      </div>

      {/* Sub Heading */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#636978ff', marginBottom: '25px' }}>
        Subject - wise marks
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {entries.map((row) => (
          <div
            key={row.id}
            className="subject-row"
          >

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', color: '#4b5563' }}>Subject*</label>
              <div style={{ width: '100%' }}>
                {row.subject === 'Other / Custom' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Type subject name..."
                      className="custom-subject-input"
                      value={row.customName || ''}
                      onChange={(e) => updateRow(row.id, 'customName', e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => updateRow(row.id, 'subject', '')}
                      style={{
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '0 12px',
                        cursor: 'pointer'
                      }}
                    >
                      ↺
                    </button>
                  </div>
                ) : (
                  <select
                    value={row.subject}
                    onChange={(e) => updateRow(row.id, 'subject', e.target.value)}
                    className="subject-select"
                    style={{ background: 'white', border: '1px solid #d1d5db' }}
                  >
                    <option value="" disabled>Insert Subject</option>
                    {(latestClass === 'FY Engineering' ? SUBJECTS_FY : (latestClass === '9th grade' || latestClass === '10th grade' ? SUBJECTS_SCHOOL : SUBJECTS_HIGHER)).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Marks*</label>
              <input
                type="number"
                placeholder="eg. 85"
                value={row.marks}
                style={{ background: 'white', border: '1px solid #d1d5db' }}
                onChange={(e) => updateRow(row.id, 'marks', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Out of*</label>
              <input
                type="number"
                value={row.total}
                style={{ background: 'white', border: '1px solid #d1d5db' }}
                onChange={(e) => updateRow(row.id, 'total', e.target.value)}
              />
            </div>

            <div style={{ paddingBottom: '5px' }}>
              {!row.compulsory ? (
                <button
                  onClick={() => removeRow(row.id)}
                  style={{
                    background: '#333',
                    border: 'none',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  ✕
                </button>
              ) : (
                <div style={{ width: '32px' }}></div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        style={{
          marginTop: '40px',
          width: '100%',
          background: '#f0f9ff',
          border: '1.5px dashed #3b82f6',
          padding: '16px',
          borderRadius: '16px',
          fontWeight: '700',
          fontSize: '0.95rem',
          color: '#2563eb',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e0f2fe';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f0f9ff';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>+</span> Add optional subject
      </button>
    </div>
  );
}
