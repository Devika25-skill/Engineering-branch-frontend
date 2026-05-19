import React, { useState, useEffect } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Header from '../components/Header';
import StepTracker from '../components/StepTracker';
import SectionTabs from '../components/SectionTabs';
import SubjectEntry from '../components/SubjectEntry';
import ExtracurricularAchievements from '../components/ExtracurricularAchievements';
import EntranceExam from '../components/EntranceExam';
import PersonalAssessment from '../components/PersonalAssessment';
import Dashboard from '../components/Dashboard';
import WelcomeBack from '../components/WelcomeBack';
import CourseRecommendations from '../components/CourseRecommendations';

export default function EngineeringSteps(): React.ReactElement {

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [showResultsView, setShowResultsView] = useState<boolean>(false);

  useEffect(() => {
    const savedStep = localStorage.getItem('engineering_current_step');
    if (savedStep && parseInt(savedStep) > 0 && parseInt(savedStep) < 4) {
      setCurrentStep(parseInt(savedStep));
      setShowWelcome(true);
    }
  }, []);

  const saveProgress = (step: number): void => {
    localStorage.setItem('engineering_current_step', step.toString());
  };

  const nextStep = (): void => {
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

  const prevStep = (): void => {
    const prev = Math.max(currentStep - 1, 0);
    setCurrentStep(prev);
    saveProgress(prev);
  };

  const handleStartOver = (): void => {
    localStorage.removeItem('engineering_current_step');
    localStorage.removeItem('personality_assessment_progress');
    localStorage.removeItem('personality_assessment_session');
    setCurrentStep(0);
    setShowWelcome(false);
    window.location.reload(); // Refresh to clear all internal states
  };

  if (showRecommendations) {
    return (
      <div className="bg-[#f8fafc] min-h-screen">
        <Navigation />
        <CourseRecommendations />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Navigation />
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
        <Navigation />
        <Dashboard
          isLanding={currentStep === 0}
          onStartAssessment={() => setShowDashboard(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#fcf2f9] min-h-screen">
      <Navigation />

      {!isFullscreen && (
        <>
          <Header />
          <StepTracker step={currentStep} />
          <SectionTabs activeStep={currentStep} />
        </>
      )}

      <div className={isFullscreen
        ? "w-full max-w-7xl mx-auto px-4 md:px-8 py-8 transition-all duration-300"
        : "container mx-auto px-4 md:px-8 w-full max-w-5xl transition-all duration-300"}>

        <div className={isFullscreen
          ? "bg-white rounded-3xl shadow-xl overflow-hidden border-t-2 border-slate-200 mb-5 min-h-[80vh] relative transition-all duration-300"
          : "bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-blue-500 mb-10 relative"}>

          <div className="p-4 md:p-8 min-h-[400px]">
            {!isFullscreen && (
              <div className="mb-4 text-xs font-bold text-indigo-500 tracking-wider uppercase">
                Step {currentStep + 1} of 4
              </div>
            )}

            {/* Multi-step form content */}
            {currentStep === 0 && <SubjectEntry onNext={nextStep} onBack={prevStep} />}
            {currentStep === 1 && <EntranceExam onNext={nextStep} onBack={prevStep} />}
            {currentStep === 2 && <ExtracurricularAchievements onNext={nextStep} onBack={prevStep} />}
            {currentStep === 3 && (
              <PersonalAssessment
                onToggleFullscreen={setIsFullscreen}
                isFullscreen={isFullscreen}
                onViewResults={() => setShowRecommendations(true)}
                onShowResults={() => setShowResultsView(true)}
              />
            )}

          </div>
        </div>

        {!isFullscreen && currentStep !== 0 && currentStep !== 1 && currentStep !== 2 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-10 px-4 md:px-5 pb-10 max-w-5xl mx-auto gap-4 md:gap-0 w-full">
            {currentStep > 0 ? (
              <button
                className="w-full md:w-auto bg-white border border-slate-200 text-slate-500 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                onClick={prevStep}
              >
                ← Back
              </button>
            ) : (
              <div className="hidden md:block" />
            )}

            {currentStep < 3 && (
              <button
                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:opacity-90 transition-opacity"
                onClick={nextStep}
              >
                Save & continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
