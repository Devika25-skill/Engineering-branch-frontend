import { useState } from 'react';

export default function OverallPercentage() {
  const [percentage, setPercentage] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setPercentage(value);
    }
  };

  return (
    <div className="form-group" style={{ marginTop: '20px' }}>
      <label>Overall 12th Percentage *</label>
      <input
        type="text"
        placeholder="Enter your 12th percentage"
        value={percentage}
        onChange={handleInputChange}
      />
    </div>
  );
}
