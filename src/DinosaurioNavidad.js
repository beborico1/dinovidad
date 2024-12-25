import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ModelViewer } from './ModelViewer';
import Video360Player from './Video360Player';

// Custom hook to manage shared interaction state
const useSharedInteraction = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [deltaMove, setDeltaMove] = useState({ x: 0, y: 0 });

  const handleStart = (x, y) => {
    setIsInteracting(true);
    setLastPosition({ x, y });
  };

  const handleMove = (x, y) => {
    if (isInteracting) {
      const deltaX = x - lastPosition.x;
      const deltaY = y - lastPosition.y;
      setDeltaMove({ x: deltaX, y: deltaY });
      setLastPosition({ x, y });
    }
  };

  const handleEnd = () => {
    setIsInteracting(false);
  };

  return {
    isInteracting,
    deltaMove,
    handlers: {
      handleStart,
      handleMove,
      handleEnd
    }
  };
};

const DinosaurioNavidad = () => {
  const [mounted, setMounted] = useState(false);
  const sharedInteraction = useSharedInteraction();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseDown = (e) => {
    sharedInteraction.handlers.handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    sharedInteraction.handlers.handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    sharedInteraction.handlers.handleEnd();
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      sharedInteraction.handlers.handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      sharedInteraction.handlers.handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    sharedInteraction.handlers.handleEnd();
  };

  // Generate falling elements with proper timing using useMemo
  const fallingElements = React.useMemo(() => {
    return Array(50).fill(null).map((_, i) => {
      const duration = 4 + Math.random() * 8;
      const delay = Math.random() * 45;
      const leftPos = Math.random() * 150;
      const isPhoto = Math.random() > 0.5;
      const isBehindModel = isPhoto && Math.random() > 0.5; // 50% of photos will be behind

      return {
        id: i,
        delay,
        duration,
        scale: 0.2 + Math.random() * 0.2,
        type: isPhoto ? 'photo' : 'heart',
        photoIndex: Math.floor(Math.random() * 20) + 1,
        isBehindModel,
        style: {
          left: `${leftPos}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          top: '-180px',
          position: 'absolute',
          zIndex: isBehindModel ? 5 : 15 // Behind model photos at z-5, others at z-15
        }
      };
    });
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video360Player as background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Video360Player interactionState={sharedInteraction} />
      </div>

      {/* Content layer */}
      <div className="relative w-full h-full pointer-events-none">
        {/* Model layer - z-index 10 */}
        <div className="absolute w-full h-full left-1/2 -translate-x-1/2 z-10">
          <Suspense fallback={<div className="text-2xl">Cargando modelo...</div>}>
            <ModelViewer interactionState={sharedInteraction} />
          </Suspense>
        </div>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-red-500/80 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            <span className="text-xl font-bold">Te amo Abril, ¡Feliz Navidad! 🎄</span>
          </div>
        </div>

        {mounted && fallingElements.map(element => (
          <div
            key={`element-${element.id}`}
            className="absolute pointer-events-none"
            style={{
              ...element.style,
              animation: `falling ${element.duration}s linear ${element.delay}s infinite`
            }}
          >
            {element.type === 'heart' ? (
              <span style={{ fontSize: '3rem' }}>🤍</span>
            ) : (
              <img
                src={`/photos/${element.photoIndex}.png`}
                alt={`Photo ${element.photoIndex}`}
                className={`rounded-lg shadow-lg object-cover ${element.isBehindModel ? 'w-24 h-24' : 'w-32 h-32'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes falling {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DinosaurioNavidad;