import { useState } from 'react';

const SUBJECTS = [
  'Biology', 'Hindi', 'Marathi', 'Geography', 'IT',
  'Computer Science', 'Electronics', 'Automobile', 'Other / Custom'
];

export default function SubjectEntry() {
  const [entries, setEntries] = useState([
    { id: 'math', subject: 'Mathematics', marks: '', total: 100, compulsory: true },
    { id: 'phy', subject: 'Physics', marks: '', total: 100, compulsory: true },
    { id: 'chem', subject: 'Chemistry', marks: '', total: 100, compulsory: true },
  ]);

  const addRow = () => setEntries([...entries, { id: Date.now(), subject: '', marks: '', total: 100, compulsory: false, customName: '' }]);

  const updateRow = (id, field, value) => {
    setEntries(entries.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removeRow = (id) => {
    setEntries(entries.filter(row => row.id !== id));
  };

  return (
    <div style={{ marginTop: '-15px' }}>
      {/* Main Heading */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
        12th Academic Marks
      </h2>

      {/* Sub Heading */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: '400', color: '#6b7280', marginBottom: '30px' }}>
        Subject-wise Marks
      </h3>

      {entries.map((row) => (
        <div
          key={row.id}
          className="form-grid"
          style={{
            marginBottom: '45px',
            alignItems: 'flex-end',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto',
            gap: '45px'
          }}
        >

          <div className="form-group">
            <label>Subject</label>
            {row.compulsory ? (
              <input
                type="text"
                value={row.subject}
                readOnly
                className="core-subject-input"
                style={{ fontWeight: '600' }}
              />
            ) : (
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
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                      }}
                      title="Back to list"
                    >
                      ↺
                    </button>
                  </div>
                ) : (
                  <select
                    value={row.subject}
                    onChange={(e) => updateRow(row.id, 'subject', e.target.value)}
                    className="subject-select"
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Marks {row.compulsory && '*'}</label>
            <input
              className="marks-input"
              type="number"
              value={row.marks}
              onChange={(e) => updateRow(row.id, 'marks', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Out of</label>
            <input
              className={`marks-input ${row.compulsory ? 'core-total-input' : ''}`}
              type="number"
              value={row.total}
              readOnly={row.compulsory}
              style={row.compulsory ? { cursor: 'not-allowed' } : {}}
              onChange={(e) => updateRow(row.id, 'total', e.target.value)}
            />
          </div>

          <div style={{ paddingBottom: '10px', minWidth: '32px' }}>
            {!row.compulsory ? (
              <button
                onClick={() => removeRow(row.id)}
                style={{
                  background: '#333333',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Remove Subject"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div style={{ width: '32px' }}></div>
            )}
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addRow} 
        className="back-btn" 
        style={{ 
          marginTop: '10px', 
          borderStyle: 'dashed', 
          width: '100%', 
          color: '#3b82f6', 
          background: '#f0f9ff',
          padding: '12px',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}
      >
        + Add Optional Subject
      </button>
    </div>
  );
}
