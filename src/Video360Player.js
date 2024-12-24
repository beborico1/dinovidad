import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Video360Player = ({ videoUrl = 'video.mp4' }) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const videoRef = useRef(null);
    const sphereRef = useRef(null);
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    useEffect(() => {
        // Initialize Three.js scene
        const init = () => {
            // Create scene
            sceneRef.current = new THREE.Scene();

            // Create camera
            cameraRef.current = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                1000
            );
            cameraRef.current.position.set(0, 0, 0.1);

            // Create renderer
            rendererRef.current = new THREE.WebGLRenderer();
            rendererRef.current.setSize(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
            );
            containerRef.current.appendChild(rendererRef.current.domElement);

            // Create video element
            videoRef.current = document.createElement('video');
            videoRef.current.src = videoUrl;
            videoRef.current.crossOrigin = 'anonymous';
            videoRef.current.loop = true;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;

            // Create video texture
            const videoTexture = new THREE.VideoTexture(videoRef.current);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBAFormat;

            // Create sphere geometry
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1); // Invert the sphere so texture renders on inside

            // Create material with video texture
            const material = new THREE.MeshBasicMaterial({
                map: videoTexture
            });

            // Create sphere mesh
            sphereRef.current = new THREE.Mesh(geometry, material);
            sceneRef.current.add(sphereRef.current);

            // Add event listeners
            window.addEventListener('resize', handleResize);
            containerRef.current.addEventListener('mousedown', handleMouseDown);
            containerRef.current.addEventListener('mousemove', handleMouseMove);
            containerRef.current.addEventListener('mouseup', handleMouseUp);
            containerRef.current.addEventListener('touchstart', handleTouchStart);
            containerRef.current.addEventListener('touchmove', handleTouchMove);
            containerRef.current.addEventListener('touchend', handleTouchEnd);

            // Start animation
            animate();

            // Start video playback
            videoRef.current.play();
        };

        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

            cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
            );
        };

        const handleMouseDown = (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const handleMouseMove = (event) => {
            if (!isMouseDown || !sphereRef.current) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            sphereRef.current.rotation.y += deltaX * 0.01;
            sphereRef.current.rotation.x += deltaY * 0.01;

            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        const handleMouseUp = () => {
            isMouseDown = false;
        };

        const handleTouchStart = (event) => {
            if (event.touches.length === 1) {
                isMouseDown = true;
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
            }
        };

        const handleTouchMove = (event) => {
            if (!isMouseDown || !sphereRef.current || event.touches.length !== 1) return;

            const deltaX = event.touches[0].clientX - mouseX;
            const deltaY = event.touches[0].clientY - mouseY;

            sphereRef.current.rotation.y += deltaX * 0.01;
            sphereRef.current.rotation.x += deltaY * 0.01;

            mouseX = event.touches[0].clientX;
            mouseY = event.touches[0].clientY;
        };

        const handleTouchEnd = () => {
            isMouseDown = false;
        };

        const animate = () => {
            if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

            requestAnimationFrame(animate);
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        init();

        // Cleanup
        return () => {
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.removeEventListener('mousedown', handleMouseDown);
                containerRef.current.removeEventListener('mousemove', handleMouseMove);
                containerRef.current.removeEventListener('mouseup', handleMouseUp);
                containerRef.current.removeEventListener('touchstart', handleTouchStart);
                containerRef.current.removeEventListener('touchmove', handleTouchMove);
                containerRef.current.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [videoUrl]);

    return (
        <div
            ref={containerRef}
            className="w-full h-96 relative"
        >
            <button
                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded"
                onClick={() => videoRef.current?.play()}
            >
                Play
            </button>
        </div>
    );
};

export default Video360Player;