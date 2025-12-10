
import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Ornaments from './Ornaments';
import Frames from './Frames';
import Topper from './Topper';

interface ExperienceProps {
  isExploded: boolean;
}

const TreeGroup: React.FC<{ isExploded: boolean; activeFrameId: number | null; setActiveFrameId: (id: number | null) => void }> = ({ isExploded, activeFrameId, setActiveFrameId }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Only rotate if no frame is active
      if (activeFrameId === null) {
         groupRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Ornaments isExploded={isExploded} />
      <Frames 
        isExploded={isExploded} 
        activeFrameId={activeFrameId}
        setActiveFrameId={setActiveFrameId}
      />
      <Topper />
    </group>
  );
};

const Experience: React.FC<ExperienceProps> = ({ isExploded }) => {
  const [activeFrameId, setActiveFrameId] = useState<number | null>(null);

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1000} 
          castShadow 
        />
        <pointLight position={[-10, -10, -10]} intensity={200} color="#ffaa00" />
        
        {/* Environment - Wrapped in isolated Suspense so failure doesn't crash the scene */}
        <Suspense fallback={null}>
           <Environment preset="city" />
        </Suspense>

        {/* Main Content */}
        <Suspense fallback={null}>
          <TreeGroup 
            isExploded={isExploded} 
            activeFrameId={activeFrameId}
            setActiveFrameId={setActiveFrameId}
          />
        </Suspense>

        {/* Floor Shadows */}
        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />

        {/* Post Processing for Glow/Bloom Effect */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={1.2} 
                mipmapBlur 
                intensity={0.35} // Reduced from 0.5 -> 0.35
                radius={0.25} 
            />
        </EffectComposer>

      {/* Controls - Disable interactions when a frame is active to prevent fighting */}
      <OrbitControls 
        enablePan={false} 
        enableRotate={activeFrameId === null}
        enableZoom={activeFrameId === null}
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={5}
        maxDistance={40}
      />
    </Canvas>
  );
};

export default Experience;
