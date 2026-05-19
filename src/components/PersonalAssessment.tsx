import React, { useState, useEffect } from 'react';
import { personalityQuestions } from '../data/personalityQuestions';

// Define the properties expected by the component
interface PersonalAssessmentProps {
  onToggleFullscreen?: (isFullscreen: boolean) => void;
  isFullscreen?: boolean;
  onViewResults?: () => void;
  onShowResults?: () => void;
}

// Define the structure of a single answer attempt
interface Attempt {
  session_id: string;
  question_id: string | number;
  question_text: string;
  attempted_answer: string;
  score: number;
  timestamp: {
    $date: string;
  };
}

// Define the structure for storing all answers
interface Answers {
  [key: string]: Attempt;
}

// Define the structure for an option in the Likert scale
interface Option {
  label: string;
  value: number;
  color: string;
}

// Define structures for the recommendations
interface Strength {
  skill: string;
  level: string;
  reasoning: string;
}

interface Recommendation {
  id: number;
  branch: string;
  match: number;
  icon: string;
  accentColor: string;
  whyMatch: string[];
  strengths: Strength[];
  offers: string[];
}

export default function PersonalAssessment({ onToggleFullscreen, isFullscreen, onViewResults, onShowResults }: PersonalAssessmentProps): React.ReactElement {
  const [started, setStarted] = useState < boolean > (false);
  const [currentIndex, setCurrentIndex] = useState < number > (0);
  const [answers, setAnswers] = useState < Answers > ({});
  const [finished, setFinished] = useState < boolean > (false);
  const [showResults, setShowResults] = useState < boolean > (false);
  const [sessionId, setSessionId] = useState < string > ('');
  const [furthestIndex, setFurthestIndex] = useState < number > (0);

  // Load progress and session from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('personality_assessment_progress');
    const savedSession = localStorage.getItem('personality_assessment_session');

    if (savedProgress) {
      const parsedProgress: Answers = JSON.parse(savedProgress);
      setAnswers(parsedProgress);
      const answeredCount = Object.keys(parsedProgress).length;
      if (answeredCount > 0) {
        setStarted(true);
        setFurthestIndex(answeredCount);
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

  const handleStart = (): void => {
    setStarted(true);
    if (onToggleFullscreen) onToggleFullscreen(true);
  };

  const handleAnswer = (option: Option): void => {
    const currentQ = personalityQuestions[currentIndex];
    const attempt: Attempt = {
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
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setFurthestIndex(prev => Math.max(prev, nextIdx));
      } else {
        setFinished(true);
        setFurthestIndex(personalityQuestions.length);
      }
    }, 400);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
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

  const prevQuestion = (): void => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const options: Option[] = [
    { label: 'Strongly Disagree', value: 1, color: '#ef4444' },
    { label: 'Disagree', value: 2, color: '#f87171' },
    { label: 'Neutral', value: 3, color: '#94a3b8' },
    { label: 'Agree', value: 4, color: '#60a5fa' },
    { label: 'Strongly Agree', value: 5, color: '#3b82f6' }
  ];

  const recommendations: Recommendation[] = [
    {
      id: 1,
      branch: "Computer Science Engineering",
      match: 98,
      icon: "💻",
      accentColor: "emerald",
      whyMatch: [
        "Your high score in logical reasoning and problem-solving is a great fit for algorithm development.",
        "Your interest in building digital tools aligns perfectly with software engineering principles.",
        "The fast-paced nature of tech matches your desire for continuous learning and innovation.",
        "Your analytical skills will excel in data structure and complex system design."
      ],
      strengths: [
        { skill: "Mathematics", level: "High", reasoning: "Aptitude for discrete math and complex calculations." },
        { skill: "Logical Thinking", level: "High", reasoning: "Exemplary performance in logic-based assessments." },
        { skill: "System Design", level: "Intermediate", reasoning: "Interest in architecture and structural frameworks." }
      ],
      offers: [
        "Software development, AI, and Cybersecurity careers.",
        "High-growth opportunities in both startups and global tech giants.",
        "Foundation for specializing in Cloud, Blockchain, or Machine Learning."
      ]
    },
    {
      id: 2,
      branch: "Electronics & Communication Engineering",
      match: 86,
      icon: "📡",
      accentColor: "blue",
      whyMatch: [
        "Your aptitude for hardware-software integration is a key requirement for ECE.",
        "Strong performance in Physics fundamentals provides a solid base for circuit design.",
        "Interest in communication systems matches the core curriculum of this branch.",
        "Your detail-oriented approach is perfect for microelectronics and VLSI design."
      ],
      strengths: [
        { skill: "Physics", level: "High", reasoning: "Strong grasp of electromagnetics and semiconductor physics." },
        { skill: "Circuit Analysis", level: "High", reasoning: "Demonstrated ability in solving network problems." },
        { skill: "Hardware", level: "Intermediate", reasoning: "Interest in physical components and signal processing." }
      ],
      offers: [
        "Roles in IoT, Robotics, and Embedded Systems development.",
        "Opportunities in the telecommunications and semiconductor industries.",
        "Versatility to transition into both core hardware and software roles."
      ]
    },
    {
      id: 3,
      branch: "Mechanical Engineering",
      match: 72,
      icon: "⚙️",
      accentColor: "amber",
      whyMatch: [
        "Your visualization skills are essential for 3D modeling and machine design.",
        "Strong conceptual understanding of mechanics and thermodynamics.",
        "Interest in physical systems and how things work on a macroscopic scale.",
        "Your practical problem-solving style is a hallmark of successful mechanical engineers."
      ],
      strengths: [
        { skill: "Physics", level: "High", reasoning: "Solid understanding of classical mechanics and energy systems." },
        { skill: "Spatial Ability", level: "High", reasoning: "Advanced skill in visualizing 3D objects and mechanisms." },
        { skill: "Design Thinking", level: "Intermediate", reasoning: "Creative approach to optimizing physical products." }
      ],
      offers: [
        "Careers in Automotive, Aerospace, and Manufacturing sectors.",
        "Involvement in Robotics, Renewable Energy, and Smart Manufacturing.",
        "Opportunities to work on physical innovations and sustainable systems."
      ]
    }
  ];

  if (finished && !showResults) {
    return (
      <div className={`fade-in transition-all duration-500 bg-white shadow-xl rounded-2xl border border-blue-100 relative overflow-hidden ${isFullscreen ? 'min-h-[70vh] p-8 md:p-20' : 'min-h-[570px] p-6 md:p-10'} flex flex-col justify-center items-center`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl pointer-events-none"></div>

        {/* Floating Header Elements */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6 z-20">
          <div className="text-[8px] md:text-xs font-bold text-[#3b82f6] uppercase tracking-widest bg-[#3b82f6]/10 px-1.5 md:px-2 py-0.5 rounded-full border border-[#3b82f6]/20 whitespace-nowrap">
            Step 4: Personal Assessment
          </div>
        </div>

        <div className="absolute top-2 md:top-6 right-4 md:right-6 z-20">
          <button
            onClick={() => onToggleFullscreen && onToggleFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-0.5 md:py-2 text-slate-500 hover:text-[#3b82f6] hover:bg-slate-50 rounded-lg transition-all font-medium text-[10px] md:text-sm border border-slate-100 bg-white/80 backdrop-blur-sm shadow-sm leading-none"
          >
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isFullscreen ? (
                <>
                  <path d="M4 14h6v6M20 10h-6V4" />
                  <path d="M14 10l7-7M10 14l-7 7" />
                </>
              ) : (
                <>
                  <path d="M15 3h6v6M9 21H3v-6" />
                  <path d="M21 3l-7 7M3 21l7-7" />
                </>
              )}
            </svg>
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            <span className="sm:hidden">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>
        </div>

        {/* Success Banner */}
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 max-w-lg relative z-10 my-auto">
          <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md shadow-green-100 animate-bounce">
            ✅
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Assessment Complete!</h2>
          <p className="text-slate-500 text-base leading-relaxed mb-8">
            Your responses have been successfully stored and analyzed. We're ready to show your customized career path.
          </p>
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-indigo-200 hover:scale-105 transition-all duration-300"
            onClick={() => {
              setShowResults(true);
              if (onToggleFullscreen) onToggleFullscreen(true);
              if (onShowResults) onShowResults();
            }}
          >
            View Result ✨
          </button>
        </div>
      </div>
    );
  }

  if (finished && showResults) {
    return (
      <div className="fade-in pb-10">


          {/* Top 3 Summary Box */}
          <div className="bg-white rounded-none border border-slate-200 shadow-sm p-3 md:p-4 mb-2 md:mb-5 mx-2">
            <p className="text-base md:text-xl font-bold text-slate-700 mb-2 md:mb-3">Your Top 3 recommendations</p>
            <div className="grid grid-cols-3 rounded-2xl overflow-hidden border border-slate-100">
              {recommendations.map((item) => (
                <div key={item.id} className={`p-2 md:p-4 flex flex-col justify-between gap-1 h-full min-h-[85px] md:min-h-[110px] ${item.accentColor === 'emerald' ? 'bg-emerald-50' :
                  item.accentColor === 'blue' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                  <span className="text-[9px] md:text-base font-semibold text-slate-700 leading-tight md:leading-snug">{item.branch}</span>
                  <span className={`text-base md:text-2xl font-black whitespace-nowrap ${item.accentColor === 'emerald' ? 'text-emerald-600' :
                    item.accentColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
                    }`}>{item.match}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex gap-2 items-start bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 mb-5 md:mb-6 mx-2">
            <span className="text-slate-400 text-base md:text-lg shrink-0">⚠️</span>
            <p className="text-[11px] md:text-sm text-slate-500 leading-relaxed italic">
              <strong className="text-slate-600 not-italic">Important Disclaimer :</strong> This recommendation is generated based on your inputs. Please review it in context of your own interests and long-term goals before proceeding.
            </p>
          </div>

          {/* Recommendation Cards */}
          <div className="space-y-8 px-2">
            {recommendations.map((item) => (
              <div key={item.id} className="bg-white rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-100 shadow-lg relative">
                {/* Left Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 ${item.accentColor === 'emerald' ? 'bg-emerald-500' :
                  item.accentColor === 'blue' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>

                <div className="p-4 md:p-8 pl-6 md:pl-10">
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4 md:mb-6 border-b border-slate-100 pb-4 md:pb-5">
                    <div className="flex items-start md:items-center gap-3 md:gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-2xl shrink-0 ${item.accentColor === 'emerald' ? 'bg-emerald-50' :
                        item.accentColor === 'blue' ? 'bg-blue-50' : 'bg-amber-50'
                        }`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col gap-1 md:gap-0">
                        <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest block">Best Match #{item.id}</span>
                        <h3 className="text-base md:text-2xl font-black text-slate-800">{item.branch}</h3>

                        {/* Mobile Match Pill */}
                        <div className="md:hidden mt-1 self-start">
                          <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md">
                            <span className={`text-sm font-black ${item.accentColor === 'emerald' ? 'text-emerald-600' :
                              item.accentColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
                              }`}>{item.match}% Match</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Match Pill */}
                    <div className="hidden md:block bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                      <span className={`text-2xl font-black ${item.accentColor === 'emerald' ? 'text-emerald-600' :
                        item.accentColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
                        }`}>{item.match}% Match</span>
                    </div>
                  </div>

                  {/* Why Match */}
                  <h4 className="text-sm md:text-base font-bold text-slate-700 mb-4">Why this matches your interests</h4>
                  <div className="bg-slate-50 rounded-xl p-3 md:p-4 mb-4 md:mb-5 border border-slate-100">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 md:gap-y-3">
                      {item.whyMatch.map((point, idx) => (
                        <li key={idx} className="flex gap-2 text-xs md:text-sm text-slate-600 leading-relaxed items-start">
                          <span className={`mt-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${item.accentColor === 'emerald' ? 'bg-emerald-500' :
                            item.accentColor === 'blue' ? 'bg-blue-500' : 'bg-amber-500'
                            }`}></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strength Summary */}
                  <div className="mb-4 md:mb-5">
                    <h4 className="text-sm md:text-base font-bold text-slate-700 mb-4 md:mb-3">Strength Summary</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-2 md:px-4 py-1.5 md:py-3 text-[9px] md:text-sm font-bold text-slate-500 uppercase">Skill</th>
                            <th className="px-2 md:px-4 py-1.5 md:py-3 text-[9px] md:text-sm font-bold text-slate-500 uppercase">Level</th>
                            <th className="px-2 md:px-4 py-1.5 md:py-3 text-[9px] md:text-sm font-bold text-slate-500 uppercase">Reasoning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {item.strengths.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-2 md:px-4 py-1.5 md:py-3 text-[10px] md:text-sm font-bold text-slate-700">{s.skill}</td>
                              <td className="px-2 md:px-4 py-1.5 md:py-3">
                                <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-xs font-black uppercase ${s.level === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                                  }`}>{s.level}</span>
                              </td>
                              <td className="px-2 md:px-4 py-1.5 md:py-3 text-[10px] md:text-sm text-slate-500 italic leading-tight">{s.reasoning}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Offers */}
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-slate-700 mb-4 md:mb-3">What {item.branch.split(' ')[0]} Engineering offers</h4>
                    <ul className="space-y-1.5 md:space-y-2">
                      {item.offers.map((offer, idx) => (
                        <li key={idx} className="flex gap-2 md:gap-3 text-xs md:text-sm text-slate-600 items-start">
                          <div className={`mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded-md flex items-center justify-center shrink-0 ${item.accentColor === 'emerald' ? 'bg-emerald-100' :
                            item.accentColor === 'blue' ? 'bg-blue-100' : 'bg-amber-100'
                            }`}>
                            <span className={`text-[10px] md:text-xs font-black ${item.accentColor === 'emerald' ? 'text-emerald-600' :
                              item.accentColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
                              }`}>{idx + 1}</span>
                          </div>
                          {offer}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-6 md:mt-8 flex flex-col items-center gap-2 md:gap-3 px-4">
            <button className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-base transition-all shadow-lg shadow-blue-200/50">
              Find Colleges for these Branches
            </button>
            <button className="w-full max-w-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-base transition-all">
              Download PDF
            </button>
          </div>
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

          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
            <span className="block">This short assessment helps us understand you beyond your marks.</span>
            <span className="block mt-1">Just 10 minutes and your recommendation is ready.</span>
          </p>

          <p className="hidden md:block text-slate-500 text-sm italic font-medium max-w-lg mb-10 bg-white/50 px-4 py-3 rounded-lg border border-slate-200">
            💡 <span className="font-semibold">Tip:</span> Press 1 - 5 on your keyboard to respond<br />
            <span className="block mt-1 text-slate-400">(1 - Strongly Disagree ; 5 - Strongly Agree)</span>
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
    <div className={`fade-in transition-all duration-500 bg-white shadow-xl rounded-2xl border border-blue-100 relative overflow-hidden ${isFullscreen ? 'min-h-[70vh] p-8 md:p-20' : 'min-h-[570px] p-6 md:p-10'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl pointer-events-none"></div>

      {/* Floating Header Elements */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 z-20">
        <div className="text-[8px] md:text-xs font-bold text-[#3b82f6] uppercase tracking-widest bg-[#3b82f6]/10 px-1.5 md:px-2 py-0.5 rounded-full border border-[#3b82f6]/20 whitespace-nowrap">
          Step 4: Personal Assessment
        </div>
      </div>

      <div className="absolute top-2 md:top-6 right-4 md:right-6 z-20">
        <button
          onClick={() => onToggleFullscreen && onToggleFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-0.5 md:py-2 text-slate-500 hover:text-[#3b82f6] hover:bg-slate-50 rounded-lg transition-all font-medium text-[10px] md:text-sm border border-slate-100 bg-white/80 backdrop-blur-sm shadow-sm leading-none"
        >
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isFullscreen ? (
              <>
                <path d="M4 14h6v6M20 10h-6V4" />
                <path d="M14 10l7-7M10 14l-7 7" />
              </>
            ) : (
              <>
                <path d="M15 3h6v6M9 21H3v-6" />
                <path d="M21 3l-7 7M3 21l7-7" />
              </>
            )}
          </svg>
          <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          <span className="sm:hidden">{isFullscreen ? 'Exit' : 'Full'}</span>
        </button>
      </div>

      <div className="flex justify-between items-end mt-12 mb-4 px-1 relative z-10">
        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Assessment Progress</span>
        <span className="text-[#3b82f6] font-black text-[10px] bg-[#3b82f6]/10 px-1.5 py-0 rounded-full">{currentIndex + 1} / {personalityQuestions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-white rounded-full mb-8 md:mb-14 overflow-hidden shadow-inner border border-slate-100 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full transition-all duration-700 ease-out shadow-lg shadow-[#3b82f6]/20"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="text-center mb-10 md:mb-14 relative z-10 px-4 min-h-[80px] md:min-h-[100px] flex items-center justify-center">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-tight tracking-tight max-w-4xl mx-auto">
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

              const sizes: { [key: number]: string } = {
                1: "w-10 h-10", // Strongly Disagree
                2: "w-8 h-8",   // Disagree
                3: "w-6 h-6",   // Neutral
                4: "w-8 h-8",   // Agree
                5: "w-10 h-10", // Strongly Agree
              };

              const circleColors: { [key: number]: string } = {
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
                  w-full p-3 rounded-xl border-2 text-left transition-all duration-300
                  flex items-center justify-between group
                  ${isSelected
                    ? "bg-white border-indigo-500 shadow-lg scale-[1.01] z-20"
                    : `bg-white/80 border-transparent shadow-sm hover:shadow-md`
                  }
                `}
                style={!isSelected ? { borderColor: `${option.color}20`, color: option.color } : {}}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-slate-200 group-hover:border-current"
                  }
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-4 md:mt-12 mb-2 md:mb-6 px-2 md:px-4 relative z-10">
        {currentIndex > 0 ? (
          <button
            onClick={prevQuestion}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm text-xs md:text-base"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
          disabled={currentIndex >= furthestIndex}
          className={`flex items-center gap-1 md:gap-2 px-4 md:px-8 py-1.5 md:py-3 rounded-xl font-bold transition-all shadow-md text-xs md:text-base ${currentIndex < furthestIndex
            ? 'bg-slate-800 text-white hover:bg-slate-700 hover:translate-y-[-2px] shadow-slate-200'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200'
            }`}
        >
          {currentIndex === personalityQuestions.length - 1 ? 'Finish' : 'Next'}
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
