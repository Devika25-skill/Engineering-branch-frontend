import { useState, useEffect } from 'react';
import { personalityQuestions } from '../data/personalityQuestions';

export default function PersonalAssessment({ onToggleFullscreen, isFullscreen }) {
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
    
    // Delay navigation so user can see selection
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
            onClick={() => alert('Results are being generated...')}
          >
            View Results ✨
          </button>
          <button 
            onClick={resetAssessment}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '15px 25px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Retake Assessment
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
    <div className="fade-in" style={{ padding: isFullscreen ? '0 20px 20px 20px' : '20px' }}>
      <div className="fullscreen-controls">
        {isFullscreen ? (
          <button className="minimize-btn" onClick={() => onToggleFullscreen(false)}>
            <span>↘↙</span> Minimize Screen
          </button>
        ) : (
          <button className="minimize-btn" onClick={() => onToggleFullscreen(true)}>
            <span>↖↗</span> Go Fullscreen
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: isFullscreen ? '20px' : '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
          QUESTION {currentIndex + 1} OF {personalityQuestions.length}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3b82f6' }}>
          {Math.round(progress)}% COMPLETE
        </span>
      </div>
      
      {/* Mini Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '80px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '10px', marginTop: '40px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px', minHeight: '120px', maxWidth: '800px', margin: '0 auto 10px auto' }}>
          "{currentQ.text}"
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
        {options.map((opt) => {
          const isSelected = answers[currentQ.id]?.score === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt)}
              style={{
                padding: '20px 30px',
                background: isSelected ? `${opt.color}15` : 'white',
                border: isSelected ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                borderRadius: '14px',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: isSelected ? '#1e293b' : '#334155',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.target.style.borderColor = opt.color;
                  e.target.style.background = `${opt.color}08`;
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = 'white';
                }
              }}
            >
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                border: `3px solid ${opt.color}`,
                background: isSelected ? opt.color : 'transparent'
              }}></div>
              {opt.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <div>
          {currentIndex > 0 ? (
            <button 
              onClick={prevQuestion}
              style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                color: '#64748b', 
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer', 
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.background = '#f1f5f9';
                e.target.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={e => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              ← Previous
            </button>
          ) : (
            <button 
              onClick={() => {
                setStarted(false);
                if (onToggleFullscreen) onToggleFullscreen(false);
              }}
              style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                color: '#64748b', 
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer', 
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.background = '#f1f5f9';
                e.target.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={e => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              ← Exit Assessment
            </button>
          )}
        </div>
        
        <button 
          onClick={resetAssessment}
          style={{ 
            background: 'white', 
            border: '1px solid #fecaca', 
            color: '#ef4444', 
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer', 
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={e => {
            e.target.style.background = '#fef2f2';
            e.target.style.borderColor = '#f87171';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#fecaca';
          }}
        >
          ↺ Reset Progress
        </button>
      </div>
    </div>
  );
}
