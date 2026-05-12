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
  const [currentStep, setCurrentStep] = useState(0);
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
    setCurrentStep(0);
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div style={{ backgroundColor: '#fdf2f8', minHeight: '100vh' }}>
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
      <div style={{ backgroundColor: '#fdf2f8', minHeight: '100vh' }}>
        <Navbar />
        <Dashboard 
          isLanding={currentStep === 0} 
          onStartAssessment={() => setShowDashboard(false)} 
        />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fdf2f8', minHeight: '100vh' }}>
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

            <button className="continue-gradient-btn" onClick={nextStep}>
              {currentStep === 3 ? 'Get My Recommendations ✨' : 'Save & continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
