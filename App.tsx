import React, { useState } from 'react';
import Experience from './components/Experience';
import { Expand, Shrink, Image, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Experience isExploded={isExploded} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
            <h1 className="text-2xl font-bold font-serif flex items-center gap-2">
              <Sparkles className="text-yellow-400" />
              Christmas Memories
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Interact with the tree. Click frames to add your photos.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center pb-8 pointer-events-auto">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full 
              font-bold text-lg transition-all duration-300 shadow-lg
              ${isExploded 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
              }
            `}
          >
            {isExploded ? (
              <>
                <Shrink size={24} />
                <span>Gather Tree</span>
              </>
            ) : (
              <>
                <Expand size={24} />
                <span>Scatter Memories</span>
              </>
            )}
          </button>
        </div>
        
        {/* Instructions Overlay */}
        <div className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-none opacity-50 hidden md:block">
           <div className="flex flex-col gap-4 text-white text-right">
              <div className="flex items-center justify-end gap-2">
                 <span>Click frames to upload</span>
                 <Image size={20} />
              </div>
              <div className="flex items-center justify-end gap-2">
                 <span>Drag to rotate</span>
                 <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;
