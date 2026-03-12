import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

const CountdownTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const totalSeconds = differenceInSeconds(end, now);

      if (totalSeconds <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
      } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        setTimeLeft({
          hours,
          minutes,
          seconds,
          isExpired: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="bg-[#1a1c23] text-white rounded-xl p-4 flex flex-col justify-center items-center">
        <span className="text-xs uppercase font-bold text-gray-400 mb-2">Auction Status</span>
        <span className="text-xl font-bold text-red-400">ENDED</span>
      </div>
    );
  }

  const formatDigit = (digit) => digit.toString().padStart(2, '0');

  return (
    <div className="bg-[#1a1c23] text-white rounded-xl p-4 flex justify-between items-center w-full">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Auction Ends In</span>
        <div className="flex items-baseline space-x-1">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{formatDigit(timeLeft.hours)}</span>
            <span className="text-[10px] text-gray-400 uppercase">Hrs</span>
          </div>
          <span className="text-xl font-bold mx-1 pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{formatDigit(timeLeft.minutes)}</span>
            <span className="text-[10px] text-gray-400 uppercase">Min</span>
          </div>
          <span className="text-xl font-bold mx-1 pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-amber-500">{formatDigit(timeLeft.seconds)}</span>
            <span className="text-[10px] text-gray-400 uppercase">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
