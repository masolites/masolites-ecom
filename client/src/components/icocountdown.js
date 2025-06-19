 import { useState, useEffect } from 'react';

const ICOCountdown = () => {
  const [daysLeft, setDaysLeft] = useState(120);
  
  useEffect(() => {
    // Set the start date of the ICO (YYYY-MM-DD)
    const icoStartDate = new Date('2023-10-01');
    const updateCountdown = () => {
      const today = new Date();
      const diffTime = icoStartDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 86400000); // Daily update
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ico-countdown">
      <h2>PRIVATE SALE ENDS IN</h2>
      <div className="countdown-timer">{daysLeft} DAYS</div>
      <div className="progress-bar">
        <div style={{ width: `${(120-daysLeft)/120*100}%` }}></div>
      </div>
    </div>
  );
};

export default ICOCountdown;
