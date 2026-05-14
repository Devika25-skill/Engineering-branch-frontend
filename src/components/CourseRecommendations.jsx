import React from 'react';

const recommendations = [
  {
    id: 1,
    branch: "Computer Science Engineering",
    match: 98,
    icon: "💻",
    accentColor: "emerald",
    whyMatch: [
      "Your high score in logical reasoning and problem-solving is a great fit for algorithm development.",
      "Your interest in building digital tools aligns perfectly with software engineering principles.",
      "The fast-paced nature of tech matches your desire for continuous learning and innovation.",
      "Your analytical skills will excel in data structure and complex system design."
    ],
    strengths: [
      { skill: "Mathematics", level: "High", reasoning: "Aptitude for discrete math and complex calculations." },
      { skill: "Logical Thinking", level: "High", reasoning: "Exemplary performance in logic-based assessments." },
      { skill: "System Design", level: "Intermediate", reasoning: "Interest in architecture and structural frameworks." }
    ],
    offers: [
      "Software development, AI, and Cybersecurity careers.",
      "High-growth opportunities in both startups and global tech giants.",
      "Foundation for specializing in Cloud, Blockchain, or Machine Learning."
    ]
  },
  {
    id: 2,
    branch: "Electronics & Communication Engineering",
    match: 86,
    icon: "📡",
    accentColor: "blue",
    whyMatch: [
      "Your aptitude for hardware-software integration is a key requirement for ECE.",
      "Strong performance in Physics fundamentals provides a solid base for circuit design.",
      "Interest in communication systems matches the core curriculum of this branch.",
      "Your detail-oriented approach is perfect for microelectronics and VLSI design."
    ],
    strengths: [
      { skill: "Physics", level: "High", reasoning: "Strong grasp of electromagnetics and semiconductor physics." },
      { skill: "Circuit Analysis", level: "High", reasoning: "Demonstrated ability in solving network problems." },
      { skill: "Hardware", level: "Intermediate", reasoning: "Interest in physical components and signal processing." }
    ],
    offers: [
      "Roles in IoT, Robotics, and Embedded Systems development.",
      "Opportunities in the telecommunications and semiconductor industries.",
      "Versatility to transition into both core hardware and software roles."
    ]
  },
  {
    id: 3,
    branch: "Mechanical Engineering",
    match: 72,
    icon: "⚙️",
    accentColor: "amber",
    whyMatch: [
      "Your visualization skills are essential for 3D modeling and machine design.",
      "Strong conceptual understanding of mechanics and thermodynamics.",
      "Interest in physical systems and how things work on a macroscopic scale.",
      "Your practical problem-solving style is a hallmark of successful mechanical engineers."
    ],
    strengths: [
      { skill: "Physics", level: "High", reasoning: "Solid understanding of classical mechanics and energy systems." },
      { skill: "Spatial Ability", level: "High", reasoning: "Advanced skill in visualizing 3D objects and mechanisms." },
      { skill: "Design Thinking", level: "Intermediate", reasoning: "Creative approach to optimizing physical products." }
    ],
    offers: [
      "Careers in Automotive, Aerospace, and Manufacturing sectors.",
      "Involvement in Robotics, Renewable Energy, and Smart Manufacturing.",
      "Opportunities to work on physical innovations and sustainable systems."
    ]
  }
];

export default function CourseRecommendations() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Your Personalized Engineering Branch Recommendation
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Based on your academic performance, entrance exam scores, and personal assessment, we've identified the best-fitting engineering paths for your future.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-10 space-y-12">
        {/* How to use section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">How to use recommendations</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-indigo-600 font-bold block mb-1">Explore Branches</span>
              <p className="text-xs text-slate-500 leading-relaxed">Review the matches based on your unique cognitive and academic profile.</p>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-indigo-600 font-bold block mb-1">Validate Interests</span>
              <p className="text-xs text-slate-500 leading-relaxed">Check the "Why Match" sections to see if they align with your passions.</p>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-indigo-600 font-bold block mb-1">Next Steps</span>
              <p className="text-xs text-slate-500 leading-relaxed">Use these insights to select the right entrance exams and college applications.</p>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
             <span className="text-indigo-600 text-lg">💡</span>
             <p className="text-xs text-indigo-700 leading-relaxed">
               These recommendations are generated using our proprietary algorithm that weighs your academic strengths against industry requirements for each engineering specialization.
             </p>
          </div>
        </div>

        {/* Branch Cards */}
        {recommendations.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl transition-all hover:shadow-2xl relative`}
          >
            {/* Left Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
              item.accentColor === 'emerald' ? 'bg-emerald-500' : 
              item.accentColor === 'blue' ? 'bg-blue-500' : 'bg-amber-500'
            }`}></div>
            
            <div className="p-6 md:p-10">
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                    item.accentColor === 'emerald' ? 'bg-emerald-50' : 
                    item.accentColor === 'blue' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Best Match #{item.id}</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800">{item.branch}</h2>
                  </div>
                </div>
                <div className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Compatibility</span>
                    <span className={`text-xl font-black leading-none ${
                      item.accentColor === 'emerald' ? 'text-emerald-600' : 
                      item.accentColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
                    }`}>{item.match}% match</span>
                  </div>
                </div>
              </div>

              {/* Sections Container */}
              <div className="space-y-10">
                {/* Why Match Section */}
                <div className="bg-slate-50/80 rounded-2xl p-6 md:p-8 border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Why match your interests?
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {item.whyMatch.map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed items-start">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          item.accentColor === 'emerald' ? 'bg-emerald-500' : 
                          item.accentColor === 'blue' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strength Summary Section */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-6">Strength Summary</h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Strength Area</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Level</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reasoning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {item.strengths.map((strength, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{strength.skill}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                strength.level === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {strength.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 leading-relaxed italic">
                              {strength.reasoning}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Offers Section */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-800 mb-6">
                    What a {item.branch.split(' ')[0]} engineering offers?
                  </h4>
                  <ul className="space-y-4">
                    {item.offers.map((offer, idx) => (
                      <li key={idx} className="flex gap-4 text-sm text-slate-600 leading-relaxed items-start">
                        <div className={`mt-1 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                          item.accentColor === 'emerald' ? 'bg-emerald-100' : 
                          item.accentColor === 'blue' ? 'bg-blue-100' : 'bg-amber-100'
                        }`}>
                          <span className={`text-[10px] font-bold ${
                            item.accentColor === 'emerald' ? 'text-emerald-600' : 
                            item.accentColor === 'blue' ? 'text-blue-600' : 'text-amber-600'
                          }`}>{idx + 1}</span>
                        </div>
                        {offer}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Action Button */}
        <div className="pt-10 pb-20 text-center">
          <button className="w-full max-w-lg bg-slate-900 text-white font-black py-6 rounded-3xl text-xl shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Find Colleges for these Branches
          </button>
          <div className="mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
            SKILLJOURNEY AI
          </div>
        </div>
      </div>
    </div>
  );
}
