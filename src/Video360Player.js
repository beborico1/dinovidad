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

            // Set up scene first
            sceneRef.current = new THREE.Scene();
            cameraRef.current = new THREE.PerspectiveCamera(
                75,
                containerRef.current.clientWidth / containerRef.current.clientHeight,
                1,
                1000
            );
            cameraRef.current.position.set(0, 0, 0.1);

            rendererRef.current = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });

            rendererRef.current.setSize(1, 1, false);
            containerRef.current.appendChild(rendererRef.current.domElement);

            // Create video element
            videoRef.current = document.createElement('video');
            videoRef.current.crossOrigin = 'anonymous';
            videoRef.current.loop = true;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            videoRef.current.src = videoUrl;

            // Create video texture immediately
            const videoTexture = new THREE.VideoTexture(videoRef.current);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBAFormat;

            const geometry = new THREE.SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1);

            const material = new THREE.MeshBasicMaterial({
                map: videoTexture
            });

            sphereRef.current = new THREE.Mesh(geometry, material);
            sceneRef.current.add(sphereRef.current);

            // For Google Drive URLs, we'll simulate progress
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
                videoRef.current.play();
                setIsLoading(false);
            });

            videoRef.current.addEventListener('error', (e) => {
                console.error('Video error:', e);
                clearInterval(progressInterval);
                setIsLoading(false);
            });

            // Set up resize observer
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
        };
    }, [videoUrl]);

    useEffect(() => {
        if (sphereRef.current && interactionState.deltaMove) {
            sphereRef.current.rotation.y += interactionState.deltaMove.x * 0.01;
            sphereRef.current.rotation.x += interactionState.deltaMove.y * 0.01;
        }
    }, [interactionState.deltaMove]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                    <img
                        src="/background.jpg"
                        alt="Loading background"
                        className="absolute w-full h-full object-cover opacity-50"
                    />
                    <div className="relative z-10 text-white text-center">
                        <div className="text-2xl font-bold mb-4">Cargando experiencia jurásica...</div>
                        <div className="w-64 h-2 bg-gray-700 rounded-full">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <div className="mt-2">{loadingProgress}%</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Video360Player;