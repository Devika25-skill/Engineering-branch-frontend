import { useState } from 'react';

export default function PersonalAssessment() {
  const [selections, setSelections] = useState({
    interest: '',
    workStyle: '',
    strength: ''
  });

  const handleSelect = (category, value) => {
    setSelections({ ...selections, [category]: value });
  };

  const OptionCard = ({ category, value, icon, label }) => {
    const isActive = selections[category] === value;
    return (
      <div 
        onClick={() => handleSelect(category, value)}
        style={{
          flex: 1,
          padding: '20px',
          background: isActive ? '#eff6ff' : 'white',
          border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          borderRadius: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none'
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{icon}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isActive ? '#1e40af' : '#475569' }}>{label}</div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-icon">📋</div>
        <h2 className="section-title">Personal Assessment</h2>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ marginBottom: '15px', fontSize: '0.95rem' }}>1. Which of these activities excites you the most?</h4>
        <div style={{ display: 'flex', gap: '20px' }}>
          <OptionCard category="interest" value="coding" icon="💻" label="Building Software" />
          <OptionCard category="interest" value="hardware" icon="⚙️" label="Fixing Machines" />
          <OptionCard category="interest" value="design" icon="🎨" label="Designing Structures" />
          <OptionCard category="interest" value="chem" icon="🧪" label="Chemical Lab Work" />
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ marginBottom: '15px', fontSize: '0.95rem' }}>2. What is your preferred work environment?</h4>
        <div style={{ display: 'flex', gap: '20px' }}>
          <OptionCard category="workStyle" value="office" icon="🏢" label="Modern Office" />
          <OptionCard category="workStyle" value="site" icon="🏗️" label="On-Site / Field" />
          <OptionCard category="workStyle" value="lab" icon="🔬" label="Research Lab" />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '15px', fontSize: '0.95rem' }}>3. What is your strongest core skill?</h4>
        <div style={{ display: 'flex', gap: '20px' }}>
          <OptionCard category="strength" value="logic" icon="🧠" label="Logical Reasoning" />
          <OptionCard category="strength" value="creative" icon="💡" label="Creative Thinking" />
          <OptionCard category="strength" value="math" icon="📐" label="Mathematical Analysis" />
        </div>
      </div>
    </div>
  );
}
