import { useState, useEffect } from 'react';
import { Calendar, Clock } from "lucide-react";

export const DiplomaRound2Tab = () => {
  const renderUpcomingRound = (roundNumber: number) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Round {roundNumber} Direct Second Year Counselling
      </h3>
      <div className="flex items-center gap-2 text-blue-600 mb-3">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Date Yet to be Announced</span>
      </div>
      <p className="text-gray-600 text-sm max-w-md leading-relaxed">
        We'll notify you as soon as Round {roundNumber} Direct Second Year counselling dates are officially announced. 
        Stay tuned for updates and prepare your documents in advance.
      </p>
      <div className="mt-6 p-3 bg-white rounded-lg border border-blue-200 text-xs text-blue-700">
        💡 Tip: Use Round 1 results to plan your strategy for upcoming rounds
      </div>
    </div>
  );

  return renderUpcomingRound(2);
};