import React from 'react';

export default function Dashboard({ isLanding, onStartAssessment }) {
  // Mock data/logic for recommendation
  const recommendedBranch = "Computer Science & AI";
  const confidenceScore = 88;

  const traits = [
    { label: 'Problem Solving', value: isLanding ? 0 : 92, color: '#3b82f6' },
    { label: 'Analytical Thinking', value: isLanding ? 0 : 85, color: '#06b6d4' },
    { label: 'Creativity', value: isLanding ? 0 : 78, color: '#8b5cf6' },
    { label: 'Team Collaboration', value: isLanding ? 0 : 80, color: '#ec4899' }
  ];

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        borderRadius: '24px', 
        padding: '40px', 
        color: 'white',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '6px 16px', 
            borderRadius: '100px', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {isLanding ? "Future Insights Ready ✨" : "Analysis Complete ✨"}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '20px', marginBottom: '10px' }}>
            {isLanding ? "Discover Your Ideal Career" : "Your Engineering Future"}
          </h1>
          <p style={{ opacity: 0.8, fontSize: '1.1rem', maxWidth: '600px' }}>
            {isLanding 
              ? "Complete your academic profile and personal assessment to unlock your personalized engineering roadmap."
              : "Based on your academic excellence and cognitive profile, we've mapped your ideal career path."}
          </p>
        </div>
        <div style={{ 
          position: 'absolute', 
          right: '-50px', 
          top: '-50px', 
          width: '300px', 
          height: '300px', 
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        {/* Main Recommendation */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '35px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          position: 'relative'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
            Top Recommendation
          </h3>
          
          {isLanding ? (
            <div style={{ filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>❓</div>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Processing...</h2>
                  <p style={{ color: '#3b82f6', fontWeight: '600', margin: '5px 0 0 0' }}>Analyzing your potential</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>💻</div>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{recommendedBranch}</h2>
                <p style={{ color: '#3b82f6', fontWeight: '600', margin: '5px 0 0 0' }}>{confidenceScore}% Match with your profile</p>
              </div>
            </div>
          )}

          {isLanding && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '24px' }}>
              <div style={{ background: 'white', padding: '12px 24px', borderRadius: '100px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontWeight: '700', color: '#3b82f6' }}>
                🔒 Complete Assessment to Unlock
              </div>
            </div>
          )}

          {!isLanding && (
            <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Your strong aptitude in logical reasoning and consistent performance in Mathematics make you a prime candidate for cutting-edge technologies.
              </p>
            </div>
          )}
        </div>

        {/* Cognitive Traits */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '35px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>
            Cognitive Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {traits.map((trait, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>{trait.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: trait.color }}>{isLanding ? '--' : `${trait.value}%`}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${trait.value}%`, height: '100%', background: trait.color, borderRadius: '10px', transition: 'width 1s ease' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        padding: '50px', 
        background: '#f0f9ff', 
        borderRadius: '32px',
        border: '2px solid #bae6fd'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0369a1', marginBottom: '15px' }}>
          {isLanding ? "Ready to discover your potential?" : "Your Roadmap is Ready"}
        </h2>
        <p style={{ color: '#075985', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          {isLanding 
            ? "Take the first step towards a successful engineering career. Start your profile assessment now."
            : `Explore the best colleges for ${recommendedBranch} and get personalized application roadmaps.`}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            className="continue-gradient-btn" 
            onClick={onStartAssessment}
            style={{ padding: '16px 40px', fontSize: '1.1rem' }}
          >
            {isLanding ? "Start Profile Assessment →" : "Refine Assessment"}
          </button>
          {!isLanding && (
            <button 
              style={{ 
                padding: '16px 40px', 
                fontSize: '1.1rem', 
                background: 'white', 
                border: '1px solid #bae6fd', 
                color: '#0369a1', 
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Explore Top Colleges
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
