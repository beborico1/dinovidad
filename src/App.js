import React, { useState, useEffect } from 'react';

const DinosaurioNavidad = () => {
  const MIN_POSITION = 0;
  const MAX_POSITION = 90;

  const [position, setPosition] = useState(45);
  const [direction, setDirection] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [activeDino, setActiveDino] = useState('🦕');

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

  // Creamos más corazones para la lluvia
  const fallingHearts = Array(50).fill(null).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    scale: 0.2 + Math.random() * 0.2
  }));

  return (
    <div className="h-screen w-screen bg-blue-100 overflow-hidden">
      <div className="relative w-full h-full">
        {/* Mensaje flotante */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-red-500/80 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            <span className="text-xl font-bold">Te amo Abril, ¡Feliz Navidad! 🎄</span>
          </div>
        </div>

        {/* Dinosaurio con gorro de navidad */}
        <div
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
        </div>

        {/* Corazones del salto */}
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

        {/* Lluvia de corazones blancos */}
        {fallingHearts.map(heart => (
          <div
            key={`heart-${heart.id}`}
            className="absolute animate-falling"
            style={{
              left: `${heart.left}%`,
              top: '-20px',
              '--duration': `${heart.duration}s`,
              animationDelay: `${heart.delay}s`,
              transform: `scale(${heart.scale})`,
              fontSize: '1rem'
            }}
          >
            🤍
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes falling {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
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