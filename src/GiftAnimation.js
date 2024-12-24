import React, { useRef, useState } from 'react';
import DinosaurioNavidad from './DinosaurioNavidad';

const GiftAnimation = () => {
    const [animationState, setAnimationState] = useState('start'); // 'start', 'animating', 'final'
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef(null);

    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.log("Error al reproducir:", error);
                });
        }
    };

    const handleClick = () => {
        toggleMusic();
        if (animationState === 'start') {
            setAnimationState('animating');

            // Calculate GIF animation duration (adjust as needed)
            const animationDuration = 500;

            // Switch to final frame after animation completes
            setTimeout(() => {
                setAnimationState('final');
                setIsExpanded(true);
            }, animationDuration);
        }
    };

    const getGifSource = () => {
        switch (animationState) {
            case 'start':
                return '/gift-start.gif';
            case 'animating':
                return '/gift-animated.gif';
            case 'final':
                return '/gift-final.gif';
            default:
                return '/gift-start.gif';
        }
    };

    return (
        <div className="relative flex items-center justify-center p-4 w-full h-screen">
            <audio
                ref={audioRef}
                src="/song.mp3"
                loop
            />

            <img
                src={getGifSource()}
                alt={`Gift ${animationState} state`}
                className="cursor-pointer object-cover w-64 h-64"
                onClick={handleClick}
            />

            {/* Expanding center div */}
            <div
                className={`
                    absolute 
                    bg-white 
                    transition-all 
                    duration-1000 
                    ease-in-out
                    ${isExpanded ? 'w-screen h-screen' : 'w-0 h-0'}
                    transform 
                    -translate-x-1/2 
                    -translate-y-1/2
                    top-1/2 
                    left-1/2
                `}
            >
                <DinosaurioNavidad />
            </div>
        </div>
    );
};

export default GiftAnimation;