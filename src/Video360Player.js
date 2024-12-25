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

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

            const container = containerRef.current;
            const computedStyle = window.getComputedStyle(container);
            const width = container.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
            const height = container.clientHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);

            // Only update if dimensions are greater than 0
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

            videoRef.current = document.createElement('video');
            videoRef.current.src = videoUrl;
            videoRef.current.crossOrigin = 'anonymous';
            videoRef.current.loop = true;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;

            videoRef.current.addEventListener('loadeddata', () => {
                setIsLoading(false);
            });

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

            // Set up ResizeObserver
            resizeObserverRef.current = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === containerRef.current) {
                        handleResize();
                    }
                }
            });

            // Observe container element
            resizeObserverRef.current.observe(containerRef.current);

            // Also keep window resize listener for viewport changes
            window.addEventListener('resize', handleResize);

            animate();
            videoRef.current.play();
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

    // Handle shared interaction updates
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
                <div className="absolute inset-0 bg-black">
                    <img
                        src="/background.jpg"
                        alt="Loading background"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
        </div>
    );
};

export default Video360Player;