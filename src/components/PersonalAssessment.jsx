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
      // Set currentIndex to the next unanswered question
      const answeredCount = Object.keys(parsedProgress).length;
      if (answeredCount > 0) {
        setStarted(true);
        // If they already started, maybe auto-fullscreen? Let's leave it to user
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

    // Create attempt object matching the structure in personality_attempts.json
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

    // Store in local state
    const newAnswers = { ...answers, [currentQ.id]: attempt };
    setAnswers(newAnswers);

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentIndex < personalityQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setFinished(true);
      }
    }, 400);

    console.log('Stored Answer:', attempt);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetAssessment = () => {
    if (window.confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      localStorage.removeItem('personality_assessment_progress');
      localStorage.removeItem('personality_assessment_session');
      setAnswers({});
      setCurrentIndex(0);
      setFinished(false);
      setStarted(false);
      if (onToggleFullscreen) onToggleFullscreen(false);
      setSessionId(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
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
      <div className="fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '15px' }}>Assessment Complete!</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Your responses have been stored and analyzed.</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            className="continue-gradient-btn"
            style={{ padding: '15px 40px', fontSize: '1.1rem' }}
            onClick={() => onViewResults && onViewResults()}
          >
            View Results ✨
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        minHeight: '380px'
      }}>
        <div style={{
          width: '90px',
          height: '90px',
          background: '#e5e7eb',
          borderRadius: '16px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem'
        }}>
          📋
        </div>

        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '16px',
          maxWidth: '480px'
        }}>
          Almost there, ready for the last step?
        </h2>

        <p style={{
          color: '#6b7280',
          fontSize: '0.95rem',
          lineHeight: '1.7',
          maxWidth: '440px',
          marginBottom: '36px'
        }}>
          This short assessment helps us understand you beyond your<br /> marks. Just 10 minutes and your recommendation is ready.
        </p>

        <button
          onClick={handleStart}
          style={{
            width: '100%',
            maxWidth: '500px',
            background: '#f0f7ff',
            border: '2px solid #3b82f6',
            color: '#3b82f6',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={e => {
            e.target.style.background = '#e0efff';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.target.style.background = '#f0f7ff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span> Start the assessment
        </button>
      </div>
    );
  }

  const currentQ = personalityQuestions[currentIndex];
  const progress = ((currentIndex + 1) / personalityQuestions.length) * 100;

  return (
    <div className="fade-in" style={{
      padding: isFullscreen ? '60px 80px' : '40px 30px',
      paddingBottom: '100px',
      background: '#f8f8f8ff', // Slightly warmer light grey
      borderRadius: '24px',
      minHeight: isFullscreen ? '90vh' : '550px',
      position: 'relative',
      fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif"
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 10px'
      }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: '500',
          color: '#1a1a1a'
        }}>
          Question {currentIndex + 1} of {personalityQuestions.length}
        </div>

        <button
          onClick={() => onToggleFullscreen && onToggleFullscreen(!isFullscreen)}
          style={{
            position: 'absolute',
            top: '25px',
            right: '30px',
            background: 'none',
            border: 'none',
            color: '#1a1a1a',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 10
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6" />
            <path d="M21 3l-7 7M3 21l7-7" />
          </svg>
          Full Page
        </button>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        width: '100%',
        height: '14px',
        background: '#e5e7eb',
        borderRadius: '50px',
        marginBottom: '80px',
        padding: '0',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
          transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          borderRadius: '50px'
        }}></div>
      </div>

      {/* Question */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '2.4rem',
          fontWeight: '700',
          color: '#111827',
          margin: '0 auto',
          maxWidth: '850px',
          letterSpacing: '-0.02em'
        }}>
          "{currentQ.text}"
        </h2>
      </div>

      {/* Options Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        maxWidth: '520px',
        margin: '0 auto 80px auto'
      }}>
        {options.map((opt) => {
          const isSelected = answers[currentQ.id]?.score === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt)}
              style={{
                padding: '18px 32px',
                background: isSelected ? `${opt.color}10` : '#fff',
                border: isSelected ? `2px solid ${opt.color}` : '1.5px solid #e5e7eb',
                borderRadius: '100px',
                fontSize: '1.05rem',
                fontWeight: '600',
                color: isSelected ? '#111827' : '#4b5563',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                boxShadow: isSelected ? `0 4px 12px ${opt.color}20` : '0 2px 4px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = opt.color;
                  e.currentTarget.style.background = `${opt.color}05`;
                  e.currentTarget.style.transform = 'translateX(5px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: isSelected ? `2px solid ${opt.color}` : '2px solid #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                transition: 'all 0.2s ease'
              }}>
                {isSelected && (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: opt.color
                  }}></div>
                )}
              </div>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div style={{
        position: 'absolute',
        bottom: isFullscreen ? '40px' : '30px',
        left: isFullscreen ? '50px' : '30px',
        display: 'flex',
        justifyContent: 'flex-start'
      }}>
        {currentIndex > 0 && (
          <button
            onClick={prevQuestion}
            style={{
              background: 'white',
              border: 'none',
              color: '#1a1a1a',
              padding: '12px 30px',
              borderRadius: '100px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Previous question
          </button>
        )}
      </div>

      {/* Next / Finish Button */}
      <button 
        onClick={() => {
          if (currentIndex < personalityQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setFinished(true);
          }
        }}
        disabled={!answers[currentQ.id]}
        style={{ 
          position: 'absolute',
          bottom: isFullscreen ? '35px' : '40px',
          right: isFullscreen ? '50px' : '30px',
          background: answers[currentQ.id] ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : '#e5e7eb', 
          border: 'none', 
          color: answers[currentQ.id] ? 'white' : '#9ca3af', 
          padding: '12px 30px',
          borderRadius: '100px',
          cursor: answers[currentQ.id] ? 'pointer' : 'not-allowed', 
          fontSize: '0.95rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: answers[currentQ.id] ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        onMouseEnter={e => {
          if (answers[currentQ.id]) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseLeave={e => {
          if (answers[currentQ.id]) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
          }
        }}
      >
        {currentIndex === personalityQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
