// src/components/SectionTabs.jsx

export default function SectionTabs({ activeStep }) {
  const tabs = [
    { name: 'Academic Performance', icon: '🎓', subtitle: "What’s your academic story so far?" },
    { name: 'Entrance Exam Score', icon: '🎯', subtitle: 'Tell us how you cracked the big ones' },
    { name: 'Extracurricular Activities', icon: '🏆', subtitle: 'Beyond books, what else drives you?' },
    { name: 'Personal Assessment', icon: '📋', subtitle: 'A quick assessment to know you better.' }
  ];

  return (
    <div className="flex justify-center items-start w-full max-w-6xl mx-auto px-0.5 md:px-8 mt-8 mb-4 text-center gap-3 md:gap-8">
      {tabs.map((tab, index) => {
        const isActive = index === activeStep;
        return (
          <div key={index} className={`flex flex-col items-center flex-1 min-w-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
            
            {/* Step text */}
            <div className={`text-[11px] md:text-xs font-extrabold uppercase tracking-tighter md:tracking-widest mb-1.5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
              Step {index + 1}
            </div>
            
            {/* Icon Box */}
            <div className={`w-13 h-13 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm mb-2 transition-colors duration-300 ${isActive ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-700'}`}>
              {tab.icon}
            </div>
            
            {/* Name */}
            <div className="font-bold text-[12px] md:text-sm text-slate-800 whitespace-pre-wrap leading-[1.1] md:leading-tight mb-1 max-w-[85px] md:max-w-none">
              {tab.name}
            </div>
            
            {/* Subtitle removed per request */}
            
          </div>
        );
      })}
    </div>
  );
}
