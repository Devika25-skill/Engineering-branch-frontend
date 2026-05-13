import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Header from './components/Header'
import StepTracker from './components/StepTracker'
import SectionTabs from './components/SectionTabs'
import SubjectEntry from './components/SubjectEntry'
import ExtracurricularAchievements from './components/ExtracurricularAchievements'
import EntranceExam from './components/EntranceExam'
import PersonalAssessment from './components/PersonalAssessment'
import Dashboard from './components/Dashboard'
import WelcomeBack from './components/WelcomeBack'

function App() {
  const [currentStep, setCurrentStep] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const savedStep = localStorage.getItem('engineering_current_step');
    if (savedStep && parseInt(savedStep) > 0 && parseInt(savedStep) < 4) {
      setCurrentStep(parseInt(savedStep));
      setShowWelcome(true);
    }
  }, []);

  const saveProgress = (step) => {
    localStorage.setItem('engineering_current_step', step.toString());
  };

  const nextStep = () => {
    if (currentStep === 3) {
      setShowDashboard(true);
      setCurrentStep(4);
      localStorage.removeItem('engineering_current_step'); // Clear on completion
    } else {
      const next = Math.min(currentStep + 1, 4);
      setCurrentStep(next);
      saveProgress(next);
    }
  };
  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 0);
    setCurrentStep(prev);
    saveProgress(prev);
  };

  const handleStartOver = () => {
    localStorage.removeItem('engineering_current_step');
    localStorage.removeItem('personality_assessment_progress');
    localStorage.removeItem('personality_assessment_session');
    setCurrentStep(0);
    setShowWelcome(false);
    window.location.reload(); // Refresh to clear all internal states
  };

  if (showWelcome) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Navbar />
        <WelcomeBack
          completedSteps={currentStep}
          onResume={() => setShowWelcome(false)}
          onStartOver={handleStartOver}
        />
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Navbar />
        <Dashboard
          isLanding={currentStep === 0}
          onStartAssessment={() => setShowDashboard(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fcf2f9', minHeight: '100vh' }}>
      <Navbar />

      {!isFullscreen && (
        <>
          <Header />
          <StepTracker step={currentStep} />
          <SectionTabs activeStep={currentStep} />
        </>
      )}

      <div className={isFullscreen ? "container-fullscreen" : "container"}>
        <div className={isFullscreen ? "form-card-fullscreen" : "form-card"}>
          <div className="form-section" style={{ minHeight: '400px' }}>
            {!isFullscreen && (
              <div style={{
                marginBottom: '15px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#6366f1',
                letterSpacing: '1.2px',
                textTransform: 'uppercase'
              }}>
                Step {currentStep + 1} of 4
              </div>
            )}

            {/* Multi-step form content */}
            {currentStep === 0 && <SubjectEntry />}
            {currentStep === 1 && <EntranceExam />}
            {currentStep === 2 && <ExtracurricularAchievements />}
            {currentStep === 3 && (
              <PersonalAssessment
                onToggleFullscreen={setIsFullscreen}
                isFullscreen={isFullscreen}
                onViewResults={() => setShowDashboard(true)}
              />
            )}

          </div>
        </div>

        {!isFullscreen && (
          <div className="bottom-nav">
            {currentStep > 0 ? (
              <button className="back-btn" onClick={prevStep}>
                ← Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 && (
              <button className="continue-gradient-btn" onClick={nextStep}>
                Save & continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
