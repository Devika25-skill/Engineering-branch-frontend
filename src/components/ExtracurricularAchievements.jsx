import { useState } from 'react';

export default function ExtracurricularAchievements() {
  const [skipped, setSkipped] = useState(false);
  const [achievements, setAchievements] = useState([
    { id: 1, type: 'Sports', title: '', level: 'School', description: '', customType: '', customLevel: '' }
  ]);

  const addAchievement = () => {
    setAchievements([...achievements, { id: Date.now(), type: 'Sports', title: '', level: 'School', description: '', customType: '', customLevel: '' }]);
  };

  const updateAchievement = (id, field, value) => {
    setAchievements(achievements.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAchievement = (id) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-icon">🏆</div>
        <h2 className="section-title">Extracurricular Achievements</h2>
      </div>


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
          onChange={() => { }} // Handled by div click
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.95rem', fontWeight: '500', color: skipped ? '#1d4ed8' : '#374151' }}>
          Skip this step.
        </span>
      </div>

      {!skipped ? (
        <>
          {achievements.map((item) => (
            <div key={item.id} className="achievements-card-item" style={{ marginBottom: '35px', position: 'relative', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 2fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* Category Selection */}
                <div className="form-group">
                  <label>Category</label>
                  {item.type === 'Other' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Type category..."
                        className="custom-subject-input"
                        value={item.customType}
                        onChange={(e) => updateAchievement(item.id, 'customType', e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => updateAchievement(item.id, 'type', '')}
                        style={{ background: '#eee', border: '1px solid #ddd', borderRadius: '8px', padding: '0 10px', cursor: 'pointer' }}
                      >
                        ↺
                      </button>
                    </div>
                  ) : (
                    <select
                      value={item.type}
                      onChange={(e) => updateAchievement(item.id, 'type', e.target.value)}
                      className="subject-select extra-select"
                    >
                      <option value="">Select Category</option>
                      <option>Leadership</option>
                      <option>STEM Clubs</option>
                      <option>Theatre / Arts</option>
                      <option>Sports</option>
                      <option>Social Impact</option>
                      <option>Other</option>
                    </select>
                  )}
                </div>

                {/* Title Input */}
                <div className="form-group">
                  <label>Achievement</label>
                  <input
                    type="text"
                    placeholder="e.g. State Level Football Runner-up"
                    value={item.title}
                    onChange={(e) => updateAchievement(item.id, 'title', e.target.value)}
                  />
                </div>

                {/* Level Selection */}
                <div className="form-group">
                  <label>Level</label>
                  {item.level === 'Other' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Type level..."
                        className="custom-subject-input"
                        value={item.customLevel}
                        onChange={(e) => updateAchievement(item.id, 'customLevel', e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => updateAchievement(item.id, 'level', '')}
                        style={{ background: '#eee', border: '1px solid #ddd', borderRadius: '8px', padding: '0 10px', cursor: 'pointer' }}
                      >
                        ↺
                      </button>
                    </div>
                  ) : (
                    <select
                      value={item.level}
                      onChange={(e) => updateAchievement(item.id, 'level', e.target.value)}
                      className="subject-select extra-select"
                    >
                      <option value="">Select Level</option>
                      <option>School Level</option>
                      <option>Regional Level</option>
                      <option>State Level</option>
                      <option>National Level</option>
                      <option>International Level</option>
                      <option>Club Level (Outside School)</option>
                      <option>Other</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label>Brief Description</label>
                <input
                  type="text"
                  placeholder="What did you learn or achieve? (e.g. Led the team to victory...)"
                  style={{ width: '100%' }}
                  value={item.description}
                  onChange={(e) => updateAchievement(item.id, 'description', e.target.value)}
                />
              </div>

              {achievements.length > 1 && (
                <button
                  onClick={() => removeAchievement(item.id)}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#333',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addAchievement}
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
            + Add Another Achievement
          </button>
        </>
      ) : (
        <div className="fade-in" style={{
          padding: '80px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: '#e2e8f0',
            margin: '0 auto 25px auto',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#94a3b8'
          }}>⏸️</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            This section has been skipped.
          </h3>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '30px' }}>
            Your branch recommendation will not be affected by skipping this section.
          </p>
        </div>
      )}
    </div>
  );
}
