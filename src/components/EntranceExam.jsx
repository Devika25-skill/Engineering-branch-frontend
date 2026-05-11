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
    <div className="fade-in">
      <div className="section-header">
        <div className="section-icon">🎯</div>
        <h2 className="section-title">Entrance Exam Scores</h2>
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
        Enter your scores for competitive exams to get better branch recommendations.
      </p>

      {/* Skip Option */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '15px 20px', 
        background: skipped ? '#f0f9ff' : '#fff', 
        border: '1px solid',
        borderColor: skipped ? '#3b82f6' : '#e5e7eb',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }} onClick={() => setSkipped(!skipped)}>
        <input 
          type="checkbox" 
          checked={skipped} 
          onChange={() => {}} // Handled by div click
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.95rem', fontWeight: '500', color: skipped ? '#1e40af' : '#374151' }}>
          I haven't taken any entrance exams (Skip this section)
        </span>
      </div>

      {!skipped ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {exams.map((exam) => (
            <div key={exam.id} className="achievements-card-item" style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', position: 'relative' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
                
                <div className="form-group">
                  <label>Exam Name</label>
                  {exam.name === 'Other' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. BITSAT" 
                        className="custom-subject-input"
                        value={exam.customName}
                        onChange={(e) => updateExam(exam.id, 'customName', e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => updateExam(exam.id, 'name', '')}
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
                      className="subject-select"
                      value={exam.name}
                      onChange={(e) => updateExam(exam.id, 'name', e.target.value)}
                    >
                      <option value="">Select Exam</option>
                      {EXAM_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Percentile / Score</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 98.5" 
                    value={exam.percentile}
                    onChange={(e) => updateExam(exam.id, 'percentile', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>All India Rank (AIR)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. 15000" 
                      value={exam.rank}
                      onChange={(e) => updateExam(exam.id, 'rank', e.target.value)}
                    />
                    {exams.length > 1 && (
                      <button 
                        onClick={() => removeExam(exam.id)}
                        style={{
                          background: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          width: '32px',
                          height: '32px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}

          <button 
            onClick={addExam}
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
            + Add Another Exam (BITSAT, VITEEE, etc.)
          </button>
        </div>
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          background: '#f9fafb', 
          borderRadius: '16px', 
          border: '1px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>ℹ️</div>
          <p style={{ color: '#64748b', fontWeight: '500' }}>
            Section skipped. You can continue to the next step.
          </p>
          <button 
            onClick={() => setSkipped(false)}
            style={{ color: '#3b82f6', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}
          >
            Wait, I want to add an exam
          </button>
        </div>
      )}
    </div>
  );
}
