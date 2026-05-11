// src/components/StepTracker.jsx

export default function StepTracker({ step }) {
  // Calculate progress based on 4 total steps
  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="step-container">
      <div className="step-row">
        <span className="step-badge">Step {step + 1} of 4</span>
        <span className="step-text">{Math.round(progress)}% Complete</span>
      </div>
      <div className="progress-bg">
        {/* The bar will now slide smoothly as the step changes */}
        <div 
          className="progress-fill" 
          style={{ transform: `translateX(-${100 - progress}%)` }}
        ></div>
      </div>
    </div>
  );
}
