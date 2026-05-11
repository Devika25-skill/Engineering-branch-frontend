import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Header from './components/Header'
import StepTracker from './components/StepTracker'
import SectionTabs from './components/SectionTabs'
import SubjectEntry from './components/SubjectEntry'
import ExtracurricularAchievements from './components/ExtracurricularAchievements'
import EntranceExam from './components/EntranceExam'
import PersonalAssessment from './components/PersonalAssessment'

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

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
            {currentStep === 3 && <PersonalAssessment onToggleFullscreen={setIsFullscreen} isFullscreen={isFullscreen} />}

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
              {currentStep === 3 ? 'Get My Recommendations ✨' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
