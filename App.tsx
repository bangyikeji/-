import React, { useState } from 'react';
import Experience from './components/Experience';
import { Expand, Shrink, Sparkles } from 'lucide-react';

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
              <Sparkles className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
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
                <Shrink className="w-5 h-5 md:w-6 md:h-6" />
                <span>Gather Tree</span>
              </>
            ) : (
              <>
                <Expand className="w-5 h-5 md:w-6 md:h-6" />
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