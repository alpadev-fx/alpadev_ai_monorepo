'use client';

import React, { useEffect, useRef, useState } from 'react';

export const FPSMonitor: React.FC = () => {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [minFps, setMinFps] = useState(60);
  const [maxFps, setMaxFps] = useState(0);

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const history = useRef<number[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    const calcFPS = () => {
      const now = performance.now();
      frameCount.current++;

      if (now - lastTime.current >= 1000) {
        const currentFps = frameCount.current;
        setFps(currentFps);

        // Update history for average
        history.current.push(currentFps);
        if (history.current.length > 60) history.current.shift(); // Keep last 60 seconds
        
        const sum = history.current.reduce((a, b) => a + b, 0);
        setAvgFps(Math.round(sum / history.current.length));

        // Update Min/Max (reset min on start up logic or over time if needed, but simple is good)
        if (currentFps > 0) {
             setMinFps((prev) => Math.min(prev, currentFps));
             setMaxFps((prev) => Math.max(prev, currentFps));
        }

        frameCount.current = 0;
        lastTime.current = now;
      }

      requestRef.current = requestAnimationFrame(calcFPS);
    };

    requestRef.current = requestAnimationFrame(calcFPS);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Only show in development or if manually enabled
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-3 rounded-lg font-mono text-xs shadow-lg pointer-events-none backdrop-blur-sm border border-white/10">
      <div className="flex gap-4">
        <div>
          <div className="text-gray-400 uppercase text-[10px]">Current</div>
          <div className={`text-lg font-bold ${fps < 30 ? 'text-red-500' : fps < 55 ? 'text-yellow-500' : 'text-green-500'}`}>
            {fps} FPS
          </div>
        </div>
        <div>
           <div className="text-gray-400 uppercase text-[10px]">Avg</div>
           <div className="text-lg font-bold">{avgFps}</div>
        </div>
      </div>
      <div className="flex gap-4 mt-2 pt-2 border-t border-white/10">
         <div>
           <span className="text-gray-400 text-[10px]">MIN: </span>
           <span className="font-bold">{minFps}</span>
         </div>
         <div>
           <span className="text-gray-400 text-[10px]">MAX: </span>
           <span className="font-bold">{maxFps}</span>
         </div>
      </div>
    </div>
  );
};
