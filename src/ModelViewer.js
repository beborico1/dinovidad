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

// We'll keep the original materials from the GLB
const setupMaterial = (material, scene) => {
    if (material) {
        // Ensure PBR materials are properly configured
        if (material instanceof PBRMaterial) {
            material.transparencyMode = 0; // OPAQUE
            material.metallicF0Factor = 1.0;
            material.useRoughnessFromMetallicTextureBlue = true;
            material.useMetallicFromMetallicTextureBlue = true;
            material.useRoughnessFromMetallicTextureGreen = true;
            material.useAmbientOcclusionFromMetallicTextureRed = true;
        }
    }
    return material;
};

export function ModelViewer() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Create engine with alpha support
            engineRef.current = new Engine(canvasRef.current, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true,
                premultipliedAlpha: false,
                alpha: true
            });

            // Create scene
            sceneRef.current = new Scene(engineRef.current);
            const scene = sceneRef.current;

            // Set transparent background
            scene.clearColor = new Color4(0, 0, 0, 0);
            scene.imageProcessingConfiguration.exposure = 1.0;
            scene.imageProcessingConfiguration.contrast = 1.1;
            scene.imageProcessingConfiguration.toneMappingEnabled = true;

            // Create camera
            const camera = new ArcRotateCamera(
                "camera",
                Math.PI,
                Math.PI / 3,
                10,
                new Vector3(0, 0, 0),
                scene
            );

            camera.minZ = 0.1;
            camera.maxZ = 1000;
            camera.wheelDeltaPercentage = 0.01;
            camera.attachControl(canvasRef.current, true);

            // Create lights
            // Main hemisphere light for ambient illumination
            const hemisphericLight = new HemisphericLight(
                "hemisphericLight",
                new Vector3(0, 1, 0),
                scene
            );
            hemisphericLight.intensity = 1;
            hemisphericLight.groundColor = new Color4(0.5, 0.5, 0.5, 0); // Transparent ground reflection

            // Key light
            const mainLight = new DirectionalLight(
                "mainLight",
                new Vector3(1, 2, 1),
                scene
            );
            mainLight.intensity = 1.5;
            mainLight.position = new Vector3(5, 10, 5);

            // Fill light
            const fillLight = new DirectionalLight(
                "fillLight",
                new Vector3(-1, 0.5, -1),
                scene
            );
            fillLight.intensity = 0.75;
            fillLight.position = new Vector3(-5, 5, -5);

            // Back light for rim highlighting
            const backLight = new DirectionalLight(
                "backLight",
                new Vector3(0, -1, 1),
                scene
            );
            backLight.intensity = 0.5;
            backLight.position = new Vector3(0, 10, -10);

            // Setup environment for PBR materials
            const envTexture = CubeTexture.CreateFromPrefilteredData(
                "/environmentSpecular.env",
                scene
            );
            scene.environmentTexture = envTexture;
            scene.environmentIntensity = 1.2;

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
                        }
                        // Enable backface culling for better performance
                        mesh.material.backFaceCulling = true;
                    });

                    // Set camera position after model loads
                    camera.setPosition(new Vector3(0, 0, -10));
                    camera.setTarget(Vector3.Zero());
                    camera.alpha = Math.PI;
                    camera.beta = Math.PI / 3;

                    // Enable auto-rotation
                    scene.onBeforeRenderObservable.add(() => {
                        camera.alpha += (Math.PI / 180) * (4 / 60);
                    });
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
                touchAction: 'none', // Prevents scroll on touch devices
                background: 'transparent' // Ensure canvas background is transparent
            }}
        />
    );
}