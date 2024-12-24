import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Create a custom material loader
const createMaterial = (oldMaterial) => {
    // Create base physical material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x808080,
        roughness: 0.5,
        metalness: 0.5,
    });

    if (oldMaterial) {
        // Transfer standard properties
        material.color.copy(oldMaterial.color || new THREE.Color(0x808080));
        material.roughness = oldMaterial.roughness !== undefined ? oldMaterial.roughness : 0.5;
        material.metalness = oldMaterial.metalness !== undefined ? oldMaterial.metalness : 0.5;
        material.normalMap = oldMaterial.normalMap || null;
        material.normalScale.copy(oldMaterial.normalScale || new THREE.Vector2(1, 1));
        material.map = oldMaterial.map || null;

        // Handle PBR Specular Glossiness properties
        if (oldMaterial.userData && oldMaterial.userData.gltfExtensions &&
            oldMaterial.userData.gltfExtensions.KHR_materials_pbrSpecularGlossiness) {
            const specGloss = oldMaterial.userData.gltfExtensions.KHR_materials_pbrSpecularGlossiness;

            if (specGloss.diffuseFactor) {
                material.color.fromArray(specGloss.diffuseFactor);
            }
            if (specGloss.glossinessFactor !== undefined) {
                material.roughness = 1 - specGloss.glossinessFactor;
            }
            if (specGloss.diffuseTexture) {
                material.map = oldMaterial.map;
            }
        }
    }

    return material;
};

function Model() {
    const { scene } = useGLTF('/model.glb');
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    const oldMaterial = child.material;
                    child.material = createMaterial(oldMaterial);

                    console.log('Mesh:', child.name);
                    console.log('New material:', child.material);
                    if (oldMaterial.userData && oldMaterial.userData.gltfExtensions) {
                        console.log('GLTF Extensions:', oldMaterial.userData.gltfExtensions);
                    }
                }
            });
            setHasLoaded(true);
        }
    }, [scene]);

    return hasLoaded ? <primitive object={scene} scale={1} /> : null;
}

export function ModelViewer() {
    return (
        <div className="w-screen h-screen">
            <Canvas
                camera={{
                    position: [0, 0, 10],
                    fov: 45,
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: true,
                    outputColorSpace: THREE.SRGBColorSpace,
                    toneMapping: THREE.ReinhardToneMapping,
                    toneMappingExposure: 1,
                }}
            >
                <Environment preset="sunset" background={false} />

                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />

                <Model />

                <OrbitControls
                    autoRotate
                    autoRotateSpeed={4}
                    enableZoom={true}
                    enablePan={true}
                    minDistance={1}
                    maxDistance={1000}
                />
            </Canvas>
        </div>
    );
}

useGLTF.preload('/model.glb');