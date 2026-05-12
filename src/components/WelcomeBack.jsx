import React, { useState } from 'react';

export default function WelcomeBack({ completedSteps, onResume, onStartOver }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const steps = [
    { id: 1, title: 'Academic Performance', desc: '(about your academic marks)' },
    { id: 2, title: 'Entrance exam scores', desc: '(about your entrance exam marks)' },
    { id: 3, title: 'Extra-curricular', desc: '(Beyond books, what else drives you?)' },
    { id: 4, title: 'Personal assessment', desc: '(A quick assessment to know you better.)' }
  ];

  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '90vh',
      padding: '20px',
      background: '#fdf2f8',
      position: 'relative'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '32px', 
        padding: '60px 50px', 
        maxWidth: '750px', 
        width: '100%', 
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        filter: showConfirm ? 'blur(4px)' : 'none',
        pointerEvents: showConfirm ? 'none' : 'auto',
        transition: 'filter 0.3s'
      }}>
        {/* Animated Icon Header */}
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
          borderRadius: '24px', 
          margin: '0 auto 30px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'white',
          boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
        }}>
          🏠
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1e293b', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Welcome Back!
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.15rem', marginBottom: '45px', fontWeight: '500' }}>
          Your progress has been securely saved. <br />
          <span style={{ color: '#3b82f6', fontWeight: '700' }}>{completedSteps} out of 4 steps</span> completed.
        </p>

        <div style={{ 
          background: '#f8fafc', 
          borderRadius: '24px', 
          border: '1px solid #e2e8f0', 
          padding: '35px', 
          textAlign: 'left',
          marginBottom: '40px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '20px', 
              marginBottom: index === steps.length - 1 ? 0 : '30px', 
              position: 'relative',
              opacity: index < completedSteps ? 1 : 0.6
            }}>
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '32px', 
                  bottom: index < completedSteps - 1 ? '-30px' : '-30px', 
                  width: '2px', 
                  background: index < completedSteps - 1 ? '#3b82f6' : '#e2e8f0',
                  transition: 'background 0.3s'
                }}></div>
              )}
              
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '10px', 
                background: index < completedSteps ? '#3b82f6' : 'white', 
                border: index < completedSteps ? 'none' : '2px solid #e2e8f0',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: index < completedSteps ? 'white' : '#94a3b8',
                fontSize: '14px',
                zIndex: 2,
                flexShrink: 0,
                boxShadow: index < completedSteps ? '0 4px 10px rgba(59, 130, 246, 0.2)' : 'none',
                fontWeight: '800'
              }}>
                {index < completedSteps ? '✓' : step.id}
              </div>
              
              <div>
                <div style={{ fontSize: '1.05rem', color: '#1e293b', fontWeight: '700', marginBottom: '4px' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '400' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '600' }}>
            Resume from <span style={{ color: '#3b82f6' }}>Step {completedSteps + 1}</span> whenever you're ready!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
          <button 
            onClick={onResume}
            className="continue-gradient-btn"
            style={{ 
              padding: '18px 40px', 
              borderRadius: '16px', 
              fontSize: '1.1rem',
              width: '100%',
              maxWidth: '350px',
              boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            Resume Assessment <span style={{ fontWeight: '900' }}>→</span>
          </button>
          <button 
            onClick={() => setShowConfirm(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              textDecoration: 'none', 
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#ef4444'}
            onMouseOut={(e) => e.target.style.color = '#94a3b8'}
          >
            Reset and Start Over
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(0,0,0,0.3)', 
          zIndex: 10,
          borderRadius: '32px'
        }}>
          <div className="fade-in" style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '24px', 
            maxWidth: '400px', 
            width: '90%', 
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827', marginBottom: '15px' }}>
              Are you sure?
            </h3>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '30px', lineHeight: '1.5' }}>
              Starting over may erase your previously recorded responses.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={onStartOver}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  borderRadius: '10px', 
                  background: '#f3f4f6', 
                  border: 'none', 
                  fontWeight: '700', 
                  color: '#111827', 
                  cursor: 'pointer' 
                }}
              >
                Yes
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  borderRadius: '10px', 
                  background: '#f3f4f6', 
                  border: 'none', 
                  fontWeight: '700', 
                  color: '#111827', 
                  cursor: 'pointer' 
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
