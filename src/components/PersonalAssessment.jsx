import { useState, useEffect } from 'react';
import { personalityQuestions } from '../data/personalityQuestions';

export default function PersonalAssessment({ onToggleFullscreen, isFullscreen, onViewResults }) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Load progress and session from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('personality_assessment_progress');
    const savedSession = localStorage.getItem('personality_assessment_session');

    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      setAnswers(parsedProgress);
      const answeredCount = Object.keys(parsedProgress).length;
      if (answeredCount > 0) {
        setStarted(true);
        if (answeredCount < personalityQuestions.length) {
          setCurrentIndex(answeredCount);
        } else {
          setFinished(true);
        }
      }
    }

    if (savedSession) {
      setSessionId(savedSession);
    } else {
      const newSession = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      setSessionId(newSession);
      localStorage.setItem('personality_assessment_session', newSession);
    }
  }, []);

  // Save progress to localStorage whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('personality_assessment_progress', JSON.stringify(answers));
    }
  }, [answers]);

  const handleStart = () => {
    setStarted(true);
    if (onToggleFullscreen) onToggleFullscreen(true);
  };

  const handleAnswer = (option) => {
    const currentQ = personalityQuestions[currentIndex];
    const attempt = {
      session_id: sessionId,
      question_id: currentQ.id,
      question_text: currentQ.text,
      attempted_answer: option.label,
      score: option.value,
      timestamp: {
        $date: new Date().toISOString()
      }
    };

    const newAnswers = { ...answers, [currentQ.id]: attempt };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < personalityQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setFinished(true);
      }
    }, 400);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= 5) {
        const option = options.find(opt => opt.value === key);
        if (option) {
          handleAnswer(option);
        }
      }
      
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentIndex < personalityQuestions.length - 1 && answers[personalityQuestions[currentIndex].id]) {
          setCurrentIndex(prev => prev + 1);
        }
      }
      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers]);

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const options = [
    { label: 'Strongly Disagree', value: 1, color: '#ef4444' },
    { label: 'Disagree', value: 2, color: '#f87171' },
    { label: 'Neutral', value: 3, color: '#94a3b8' },
    { label: 'Agree', value: 4, color: '#60a5fa' },
    { label: 'Strongly Agree', value: 5, color: '#3b82f6' }
  ];

  if (finished) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-8 animate-bounce">
          ✅
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Assessment Complete!</h2>
        <p className="text-slate-600 text-lg mb-10 max-w-md">Your responses have been stored and analyzed. We're ready to show your path.</p>
        <button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-indigo-200 hover:scale-105 transition-all duration-300"
          onClick={() => onViewResults && onViewResults()}
        >
          View Results ✨
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fade-in bg-gradient-to-br from-rose-50/70 to-pink-50/70 shadow-lg rounded-2xl border-0 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl text-white shadow-md text-2xl">
            📋
          </div>
          <h2 className="text-2xl font-bold text-slate-800 m-0">Personal Assessment</h2>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-10 min-h-[380px]">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 max-w-2xl">
            Almost there, ready for the last step?
          </h2>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mb-10">
            <span className="block">This short assessment helps us understand you beyond your marks.</span>
            <span className="block mt-1">Just 10 minutes and your recommendation is ready.</span>
          </p>

          <button
            onClick={handleStart}
            className="w-full max-w-md bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 text-blue-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span className="text-xl leading-none"></span> Start the assessment
          </button>
        </div>
      </div>
    );
  }

  const currentQ = personalityQuestions[currentIndex];
  const progress = ((currentIndex + 1) / personalityQuestions.length) * 100;

  return (
    <div className={`fade-in transition-all duration-500 bg-white shadow-xl rounded-2xl border border-blue-100 relative overflow-hidden ${isFullscreen ? 'min-h-[70vh] p-8 md:p-20' : 'min-h-[450px] p-6 md:p-10'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl pointer-events-none"></div>

      {/* Floating Header Elements */}
      <div className="absolute top-6 left-6 z-20">
        <div className="text-sm font-bold text-[#3b82f6] uppercase tracking-widest bg-[#3b82f6]/10 px-3 py-1 rounded-full border border-[#3b82f6]/20">
          Step 4: Personal Assessment
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => onToggleFullscreen && onToggleFullscreen(!isFullscreen)}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-[#3b82f6] hover:bg-slate-50 rounded-xl transition-all font-medium text-sm border border-slate-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6" />
            <path d="M21 3l-7 7M3 21l7-7" />
          </svg>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="flex justify-between items-end mt-12 mb-4 px-1 relative z-10">
        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Assessment Progress</span>
        <span className="text-[#3b82f6] font-black text-sm bg-[#3b82f6]/10 px-3 py-1 rounded-full">{currentIndex + 1} / {personalityQuestions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-white rounded-full mb-20 overflow-hidden shadow-inner border border-slate-100 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full transition-all duration-700 ease-out shadow-lg shadow-[#3b82f6]/20"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="text-center mb-20 relative z-10 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight tracking-tight max-w-4xl mx-auto">
          "{currentQ.text}"
        </h2>
      </div>

      {/* Options Container */}
      <div className="max-w-4xl mx-auto mb-12 relative z-10 px-4">
        {/* Desktop Layout: Horizontal Likert Scale */}
        <div className="hidden md:block">
          {/* Labels Row */}
          <div className="flex justify-between items-end mb-4">
            {options.map((option) => {
              const isSelected = answers[currentQ.id]?.score === option.value;
              return (
                <div key={option.value} className="flex-1 text-center">
                  <span className={`text-xs font-bold uppercase tracking-widest px-1 transition-colors duration-300 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Circles Row with Connecting Bar */}
          <div className="relative flex justify-between items-center h-20">
            {/* Connecting Bar */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-slate-400/80 -z-10 transform -translate-y-1/2 rounded-full" />
            
            {options.map((option) => {
              const isSelected = answers[currentQ.id]?.score === option.value;
              
              const sizes = {
                1: "w-16 h-16", // Strongly Disagree
                2: "w-12 h-12", // Disagree
                3: "w-10 h-10", // Neutral
                4: "w-12 h-12", // Agree
                5: "w-16 h-16", // Strongly Agree
              };
              
              const circleColors = {
                1: isSelected ? "bg-[#3b82f6] border-[#2563eb] shadow-[#3b82f6]/20" : "bg-white border-slate-200 hover:border-[#3b82f6]/50",
                2: isSelected ? "bg-[#3b82f6] border-[#2563eb] shadow-[#3b82f6]/20" : "bg-white border-slate-200 hover:border-[#3b82f6]/50",
                3: isSelected ? "bg-[#3b82f6] border-[#2563eb] shadow-[#3b82f6]/20" : "bg-white border-slate-200 hover:border-[#3b82f6]/50",
                4: isSelected ? "bg-[#3b82f6] border-[#2563eb] shadow-[#3b82f6]/20" : "bg-white border-slate-200 hover:border-[#3b82f6]/50",
                5: isSelected ? "bg-[#3b82f6] border-[#2563eb] shadow-[#3b82f6]/20" : "bg-white border-slate-200 hover:border-[#3b82f6]/50",
              };

              return (
                <div key={option.value} className="flex-1 flex justify-center items-center">
                  <button
                    onClick={() => handleAnswer(option)}
                    className={`
                      ${sizes[option.value]}
                      ${circleColors[option.value]}
                      rounded-full border-4 transition-all duration-300 transform
                      ${isSelected ? 'scale-110 shadow-xl' : 'hover:scale-105 shadow-md'}
                      flex items-center justify-center
                    `}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full shadow-inner animate-pulse" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout: Existing Vertical List */}
        <div className="flex md:hidden flex-col gap-3 max-w-xl mx-auto px-4">
          {options.map((option) => {
            const isSelected = answers[currentQ.id]?.score === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option)}
                className={`
                  w-full p-5 rounded-2xl border-2 text-left transition-all duration-300
                  flex items-center justify-between group
                  ${isSelected
                    ? "bg-white border-indigo-500 shadow-lg scale-[1.02] z-20"
                    : `bg-white/80 border-transparent shadow-sm hover:shadow-md`
                  }
                `}
                style={!isSelected ? { borderColor: `${option.color}20`, color: option.color } : {}}
              >
                <span className="text-lg font-semibold">{option.label}</span>
                <div className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-slate-200 group-hover:border-current"
                  }
                `}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-10">
        {currentIndex > 0 ? (
          <button
            onClick={prevQuestion}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : <div />}

        <button
          onClick={() => {
            if (currentIndex < personalityQuestions.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              setFinished(true);
            }
          }}
          disabled={!answers[currentQ.id]}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md ${answers[currentQ.id]
            ? 'bg-slate-800 text-white hover:bg-slate-700 hover:translate-y-[-2px] shadow-slate-200'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
            }`}
        >
          {currentIndex === personalityQuestions.length - 1 ? 'Finish Assessment' : 'Next'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
