// src/components/SectionTabs.jsx

export default function SectionTabs({ activeStep }) {
  const tabs = [
    { name: 'Academic Performance', icon: '🎓', subtitle: "What’s your academic story so far?" },
    { name: 'Entrance Exam Score', icon: '🎯', subtitle: 'Tell us how you cracked the big ones' },
    { name: 'Extracurricular Activities', icon: '🏆', subtitle: 'Beyond books, what else drives you?' },
    { name: 'Personal Assessment', icon: '📋', subtitle: 'A quick assessment to know you better.' }
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
