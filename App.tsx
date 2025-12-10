import React, { useState } from 'react';
import Experience from './components/Experience';

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);

  return (
    <div className="relative w-full h-[100dvh] bg-gray-950 overflow-hidden touch-none">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Experience isExploded={isExploded} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="bg-black/30 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 text-white shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold font-serif flex items-center gap-2">
              {/* Sparkles Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 w-5 h-5 md:w-6 md:h-6">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Christmas Memories
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center pb-6 md:pb-8 pointer-events-auto safe-area-bottom">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`
              flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full 
              font-bold text-base md:text-lg transition-all duration-300 shadow-xl active:scale-95
              ${isExploded 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
              }
            `}
          >
            {isExploded ? (
              <>
                {/* Shrink Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                  <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"/>
                  <path d="M9 19.8V15m0 0H4.2M9 15l-6 6"/>
                  <path d="M15 4.2V9m0 0h4.8M15 9l6-6"/>
                  <path d="M9 4.2V9m0 0H4.2M9 9 3 3"/>
                </svg>
                <span>Gather Tree</span>
              </>
            ) : (
              <>
                {/* Expand Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                  <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/>
                  <path d="M3 16.2V21m0 0h4.8M3 21l6-6"/>
                  <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/>
                  <path d="M3 7.8V3m0 0h4.8M3 3l6 6"/>
                </svg>
                <span>Scatter Memories</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;