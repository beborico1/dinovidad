import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ModelViewer } from './ModelViewer';  // Make sure to create this file
import Video360Player from './Video360Player';

const DinosaurioNavidad = () => {
  const MIN_POSITION = 0;
  const MAX_POSITION = 90;
  const audioRef = useRef(null);

  const [position, setPosition] = useState(45);
  const [direction, setDirection] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [activeDino, setActiveDino] = useState('🦕');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicButton, setShowMusicButton] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prevPos => {
        const newPos = prevPos + (2 * direction);
        if (newPos >= MAX_POSITION || newPos <= MIN_POSITION) {
          setTimeout(() => {
            setDirection(d => d * -1);
            setActiveDino(prev => prev === '🦕' ? '🦖' : '🦕');
          }, 0);
          return newPos >= MAX_POSITION ? MAX_POSITION : MIN_POSITION;
        }
        return newPos;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [direction]);

  const createHearts = () => {
    const heartCount = 5;
    const newHearts = Array.from({ length: heartCount }, (_, index) => ({
      id: Date.now() + index,
      x: position + (Math.random() * 20 - 10),
      y: 60 + (Math.random() * 20 - 10),
      scale: 0.5 + Math.random() * 0.5
    }));

    setHearts(prev => [...prev, ...newHearts]);

    setTimeout(() => {
      const idsToRemove = newHearts.map(heart => heart.id);
      setHearts(prev => prev.filter(heart => !idsToRemove.includes(heart.id)));
    }, 1000);
  };

  const handleClick = () => {
    if (!isJumping) {
      setIsJumping(true);
      createHearts();
      setTimeout(() => setIsJumping(false), 800);
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowMusicButton(false);
        })
        .catch(error => {
          console.log("Error al reproducir:", error);
        });
    }
  };

  // Generate falling elements with proper timing using useMemo
  const fallingElements = React.useMemo(() => {
    return Array(50).fill(null).map((_, i) => {
      const duration = 4 + Math.random() * 8; // 60-100 seconds
      const delay = Math.random() * 45;
      const leftPos = Math.random() * 120;
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
    <div className="h-screen w-screen overflow-hidden relative" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <audio
        ref={audioRef}
        src="/song.mp3"
        loop
      />

      {/* <Video360Player /> */}

      <div className="relative w-full h-full">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10">
          <Suspense fallback={<div className="text-2xl">Cargando modelo...</div>}>
            <ModelViewer />
          </Suspense>
        </div>

        <button
          onClick={toggleMusic}
          className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center space-x-2"
        >
          <span className="text-2xl">{isPlaying ? '🔇' : '🎵'}</span>
          <span className="font-bold">{isPlaying ? 'Pausar' : 'Reproducir'} Música</span>
        </button>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-red-500/80 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            <span className="text-xl font-bold">Te amo Abril, ¡Feliz Navidad! 🎄</span>
          </div>
        </div>

        {/* <div
          className={`absolute transition-all duration-300 cursor-pointer ${isJumping ? 'animate-jump' : ''}`}
          style={{
            left: `${position}%`,
            bottom: '20%',
            transform: `scaleX(${direction === 1 ? 1 : -1})`,
            transition: 'transform 0.3s'
          }}
          onClick={handleClick}
        >
          <div className="relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">
              🎅
            </div>
            <div className="text-8xl">
              {activeDino}
            </div>
          </div>
        </div> */}

        {hearts.map(heart => (
          <div
            key={heart.id}
            className="absolute text-red-500 animate-float-up"
            style={{
              left: `${heart.x}%`,
              bottom: `${heart.y}%`,
              fontSize: '2rem',
              transform: `scale(${heart.scale})`
            }}
          >
            ❤️
          </div>
        ))}

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