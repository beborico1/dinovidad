import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ModelViewer } from './ModelViewer';  // Make sure to create this file
import Video360Player from './Video360Player';

const DinosaurioNavidad = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate falling elements with proper timing using useMemo
  const fallingElements = React.useMemo(() => {
    return Array(50).fill(null).map((_, i) => {
      const duration = 4 + Math.random() * 8; // 60-100 seconds
      const delay = Math.random() * 45;
      const leftPos = Math.random() * 150;
      return {
        id: i,
        delay,
        duration,
        scale: 0.2 + Math.random() * 0.2,
        type: Math.random() > 0.5 ? 'heart' : 'photo',
        photoIndex: Math.floor(Math.random() * 20) + 1,
        style: {
          left: `${leftPos}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          top: '-180px',
          position: 'absolute'
        }
      };
    });
  }, []); // Empty dependency array means this will only run once

  return (
    <div className="h-full w-full overflow-hidden relative" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>

      {/* <Video360Player /> */}

      <div className="relative w-full h-full">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10">
          <Suspense fallback={<div className="text-2xl">Cargando modelo...</div>}>
            <ModelViewer />
          </Suspense>
        </div>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-red-500/80 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            <span className="text-xl font-bold">Te amo Abril, ¡Feliz Navidad! 🎄</span>
          </div>
        </div>

        {mounted && fallingElements.map(element => (
          <div
            key={`element-${element.id}`}
            className="absolute"
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
                className="w-32 h-32 rounded-lg shadow-l object-cover"
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
    </div >
  );
};

export default DinosaurioNavidad;