import React, { useRef, useState } from 'react';
import DinosaurioNavidad from './DinosaurioNavidad';

const GiftAnimation = () => {
    const [animationState, setAnimationState] = useState('start');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [expandStage, setExpandStage] = useState(0); // 0: initial, 1: small, 2: full
    const audioRef = useRef(null);

    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(error => console.log("Error al reproducir:", error));
        }
    };

    const handleClick = () => {
        toggleMusic();
        if (animationState === 'start') {
            setAnimationState('animating');

            // First expansion stage
            setTimeout(() => {
                setExpandStage(1);
            }, 100);

            // Second expansion stage (full screen)
            setTimeout(() => {
                setAnimationState('final');
                setIsExpanded(true);
                setExpandStage(2);
            }, 500);
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

    const getExpandedClassName = () => {
        switch (expandStage) {
            case 0:
                return 'w-0 h-0';
            case 1:
                return 'w-[300px] h-[300px]';
            case 2:
                return 'w-screen h-screen';
            default:
                return 'w-0 h-0';
        }
    };

    return (
        <div className="relative flex items-center justify-center p-4 w-full h-screen bg-black">
            <audio
                ref={audioRef}
                src="/song.mp3"
                loop
            />
            {animationState !== 'final' &&
                <img
                    src={getGifSource()}
                    alt={`Gift ${animationState} state`}
                    className="cursor-pointer object-cover w-64 h-64 z-20"
                    onClick={handleClick}
                    style={{
                        opacity: expandStage === 2 ? 0 : 1,
                        transition: 'opacity 0.5s ease-in-out'
                    }}
                />
            }

            {/* Expanding center div */}
            <div
                className={`
                    absolute 
                    bg-black 
                    transition-all 
                    duration-1000 
                    ease-in-out
                    ${getExpandedClassName()}
                    transform 
                    -translate-x-1/2 
                    -translate-y-1/2
                    top-1/2 
                    left-1/2
                    overflow-hidden
                `}
            >
                {expandStage > 0 && <DinosaurioNavidad />}
            </div>
        </div>
    );
};

export default GiftAnimation;