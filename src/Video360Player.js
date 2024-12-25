import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Video360Player = ({ videoUrl = 'video.mp4', interactionState }) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const videoRef = useRef(null);
    const sphereRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [needsPlayback, setNeedsPlayback] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

            const container = containerRef.current;
            const computedStyle = window.getComputedStyle(container);
            const width = container.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
            const height = container.clientHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);

            if (width > 0 && height > 0) {
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setPixelRatio(window.devicePixelRatio);
                rendererRef.current.setSize(width, height, false);

                const canvas = rendererRef.current.domElement;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.objectFit = 'cover';
            }
        };

        const animate = () => {
            if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
            requestAnimationFrame(animate);
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        const init = () => {
            if (!containerRef.current) return;

            // Scene setup
            sceneRef.current = new THREE.Scene();

            // Camera setup with better initial position for 360 viewing
            cameraRef.current = new THREE.PerspectiveCamera(
                75,
                containerRef.current.clientWidth / containerRef.current.clientHeight,
                0.1,
                1000
            );
            cameraRef.current.position.set(0, 0, 0.1);
            cameraRef.current.lookAt(0, 0, 0);

            // Renderer setup with better performance options
            rendererRef.current = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                logarithmicDepthBuffer: true
            });

            rendererRef.current.setPixelRatio(window.devicePixelRatio);
            rendererRef.current.setSize(1, 1, false);
            containerRef.current.appendChild(rendererRef.current.domElement);

            // Video element setup
            videoRef.current = document.createElement('video');
            videoRef.current.crossOrigin = 'anonymous';
            videoRef.current.loop = true;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            videoRef.current.setAttribute('playsinline', '');
            videoRef.current.src = videoUrl;

            // Create video texture
            const videoTexture = new THREE.VideoTexture(videoRef.current);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBAFormat;
            videoTexture.generateMipmaps = false;

            // Optimized geometry for mobile
            const geometry = new THREE.SphereGeometry(500, 32, 24);
            geometry.scale(-1, 1, 1);

            const material = new THREE.MeshBasicMaterial({
                map: videoTexture
            });

            sphereRef.current = new THREE.Mesh(geometry, material);
            sceneRef.current.add(sphereRef.current);

            // Progress simulation
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 2;
                if (progress > 98) {
                    clearInterval(progressInterval);
                }
                setLoadingProgress(progress);
            }, 100);

            videoRef.current.addEventListener('canplay', () => {
                clearInterval(progressInterval);
                setLoadingProgress(100);

                videoRef.current.play().catch(() => {
                    setNeedsPlayback(true);
                });

                setIsLoading(false);
            });

            videoRef.current.addEventListener('error', (e) => {
                console.error('Video error:', e);
                clearInterval(progressInterval);
                setIsLoading(false);
            });

            // Resize observer setup
            resizeObserverRef.current = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.target === containerRef.current) {
                        handleResize();
                    }
                }
            });

            resizeObserverRef.current.observe(containerRef.current);
            window.addEventListener('resize', handleResize);

            animate();
            handleResize();
        };

        init();

        return () => {
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
            if (resizeObserverRef.current && containerRef.current) {
                resizeObserverRef.current.unobserve(containerRef.current);
                resizeObserverRef.current.disconnect();
            }
            window.removeEventListener('resize', handleResize);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.src = '';
                videoRef.current.load();
            }
        };
    }, [videoUrl]);

    useEffect(() => {
        if (sphereRef.current && interactionState.deltaMove) {
            sphereRef.current.rotation.y += interactionState.deltaMove.x * 0.01;
            sphereRef.current.rotation.x += interactionState.deltaMove.y * 0.01;
        }
    }, [interactionState.deltaMove]);

    // Handle user interaction to start playback
    const handlePlaybackStart = () => {
        if (videoRef.current && needsPlayback) {
            videoRef.current.play().then(() => {
                setNeedsPlayback(false);
            }).catch(error => {
                console.error('Playback failed:', error);
            });
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={handlePlaybackStart}
        >
            {(isLoading || needsPlayback) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Background image with overlay */}
                    <div className="absolute inset-0">
                        <img
                            src="/background.jpg"
                            alt="Loading background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50" />
                    </div>

                    {/* Loading or Start UI */}
                    <div className="relative z-10 w-full max-w-md mx-auto px-4">
                        <div className="text-center">
                            <h2 className="text-white text-2xl font-bold mb-6">
                                {isLoading ? 'Cargando Experiencia Jurasica...' : 'Listo para comenzar'}
                            </h2>

                            {isLoading ? (
                                <>
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                                            style={{ width: `${loadingProgress}%` }}
                                        />
                                    </div>
                                    <div className="text-white mt-2">
                                        {loadingProgress}%
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={handlePlaybackStart}
                                    className="px-6 py-3 bg-white rounded-lg shadow-lg text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Comenzar Experiencia
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Video360Player;