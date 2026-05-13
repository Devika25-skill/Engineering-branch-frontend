// src/components/SectionTabs.jsx

export default function SectionTabs({ activeStep }) {
  const tabs = [
    { name: 'Academic\nPerformance', icon: '🎓', subtitle: "What’s your academic story so far?" },
    { name: 'Entrance Exam\nScore', icon: '🎯', subtitle: 'Tell us how you cracked the big ones' },
    { name: 'Extracurricular Activities', icon: '🏆', subtitle: 'Beyond books, what else drives you?' },
    { name: 'Personal Assessment', icon: '📋', subtitle: 'A quick assessment to know you better.' }
  ];

  return (
    <div className="tabs-container">
      {tabs.map((tab, index) => (
        <div key={index} className={`tab-item ${index === activeStep ? 'active' : ''}`}>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: '800', 
            color: index === activeStep ? '#6366f1' : '#94a3b8', 
            marginBottom: '8px', 
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Step {index + 1}
          </div>
          <div className="tab-icon-wrapper">
            <span className="tab-icon">{tab.icon}</span>
          </div>
          <div className="tab-name">{tab.name}</div>
          <div className="tab-subtitle">{tab.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
