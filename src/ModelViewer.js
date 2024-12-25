import React, { useEffect, useRef } from 'react';
import {
    Engine,
    Scene,
    Vector3,
    ArcRotateCamera,
    HemisphericLight,
    DirectionalLight,
    SceneLoader,
    Color4,
    PBRMaterial,
    StandardMaterial,
    Texture,
    CubeTexture
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

const setupMaterial = (material, scene) => {
    if (material) {
        if (material instanceof PBRMaterial) {
            material.transparencyMode = 0;
            material.metallicF0Factor = 1.0;
            material.useRoughnessFromMetallicTextureBlue = true;
            material.useMetallicFromMetallicTextureBlue = true;
            material.useRoughnessFromMetallicTextureGreen = true;
            material.useAmbientOcclusionFromMetallicTextureRed = true;
        }
    }
    return material;
};

export function ModelViewer({ interactionState }) {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);

    // Handle shared interaction updates
    useEffect(() => {
        if (cameraRef.current && interactionState.deltaMove) {
            cameraRef.current.alpha += interactionState.deltaMove.x * 0.01;
            cameraRef.current.beta += interactionState.deltaMove.y * 0.01;
        }
    }, [interactionState.deltaMove]);

    useEffect(() => {
        if (canvasRef.current) {
            engineRef.current = new Engine(canvasRef.current, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true,
                premultipliedAlpha: false,
                alpha: true
            });

            sceneRef.current = new Scene(engineRef.current);
            const scene = sceneRef.current;

            scene.clearColor = new Color4(0, 0, 0, 0);
            scene.imageProcessingConfiguration.exposure = 1.0;
            scene.imageProcessingConfiguration.contrast = 1.1;
            scene.imageProcessingConfiguration.toneMappingEnabled = true;

            // Create camera
            cameraRef.current = new ArcRotateCamera(
                "camera",
                0,
                0,
                0,
                new Vector3(0, 0, 0),
                scene
            );

            cameraRef.current.minZ = 0.1;
            cameraRef.current.maxZ = 1000;
            cameraRef.current.wheelDeltaPercentage = 0.01;

            // Disable default camera controls since we're using shared controls
            cameraRef.current.attachControl(canvasRef.current, false);

            // Create lights
            const hemisphericLight = new HemisphericLight(
                "hemisphericLight",
                new Vector3(0, 1, 0),
                scene
            );
            hemisphericLight.intensity = 1;
            hemisphericLight.groundColor = new Color4(0.5, 0.5, 0.5, 0);

            const mainLight = new DirectionalLight(
                "mainLight",
                new Vector3(1, 2, 1),
                scene
            );
            mainLight.intensity = 1.5;
            mainLight.position = new Vector3(5, 10, 5);

            const fillLight = new DirectionalLight(
                "fillLight",
                new Vector3(-1, 0.5, -1),
                scene
            );
            fillLight.intensity = 0.75;
            fillLight.position = new Vector3(-5, 5, -5);

            const backLight = new DirectionalLight(
                "backLight",
                new Vector3(0, -1, 1),
                scene
            );
            backLight.intensity = 0.5;
            backLight.position = new Vector3(0, 10, -10);

            // Setup environment
            try {
                const envTexture = CubeTexture.CreateFromPrefilteredData(
                    "/environmentSpecular.env",
                    scene
                );
                scene.environmentTexture = envTexture;
                scene.environmentIntensity = 1.2;
            } catch (error) {
                console.log('Environment map not available, using default lighting');
            }

            // Load model
            SceneLoader.ImportMesh(
                "",
                "/",
                "model.glb",
                scene,
                (meshes, particleSystems, skeletons, animationGroups) => {
                    meshes.forEach((mesh) => {
                        if (mesh.material) {
                            mesh.material = setupMaterial(mesh.material, scene);
                            mesh.material.backFaceCulling = true;
                        }
                    });

                    // Set camera position after model loads
                    cameraRef.current.setTarget(new Vector3(0, 0, 0));
                    cameraRef.current.alpha = Math.PI * 1.3;
                    cameraRef.current.beta = Math.PI * 0.3;
                    cameraRef.current.target.y = 4;
                    cameraRef.current.radius = 10;
                }
            );

            // Start render loop
            engineRef.current.runRenderLoop(() => {
                scene.render();
            });

            // Handle window resize
            const handleResize = () => {
                engineRef.current.resize();
            };
            window.addEventListener('resize', handleResize);

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
                scene.dispose();
                engineRef.current.dispose();
            };
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-screen h-screen"
            style={{
                touchAction: 'none',
                background: 'transparent',
                pointerEvents: 'none' // Allow interactions to pass through to the video layer
            }}
        />
    );
}

export default ModelViewer;