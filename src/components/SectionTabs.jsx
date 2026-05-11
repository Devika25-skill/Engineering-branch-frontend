// src/components/SectionTabs.jsx

export default function SectionTabs({ activeStep }) {
  const tabs = [
    { name: 'Academic Profile', icon: '🎓', subtitle: 'Academic records' },
    { name: 'Entrance Exam', icon: '🎯', subtitle: 'Competitive scores' },
    { name: 'Extracurricular Achievements', icon: '🏆', subtitle: 'Beyond academics' },
    { name: 'Personal Assessment', icon: '📋', subtitle: 'Skills & goals' }
  ];

  return (
    <div className="tabs-container">
      {tabs.map((tab, index) => (
        <div key={index} className={`tab-item ${index === activeStep ? 'active' : ''}`}>
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
