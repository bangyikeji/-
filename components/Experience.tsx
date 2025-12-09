import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Ornaments from './Ornaments';
import Frames from './Frames';
import Topper from './Topper';

interface ExperienceProps {
  isExploded: boolean;
}

const TreeGroup: React.FC<{ isExploded: boolean }> = ({ isExploded }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow rotation of the entire tree structure
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Ornaments isExploded={isExploded} />
      <Frames isExploded={isExploded} />
      <Topper />
    </group>
  );
};

const Experience: React.FC<ExperienceProps> = ({ isExploded }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback={null}>
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
        <pointLight position={[-10, -10, -10]} intensity={500} color="#ff0000" />
        
        {/* PBR Environment */}
        <Environment preset="city" />

        {/* Main Content */}
        <TreeGroup isExploded={isExploded} />

        {/* Floor Shadows */}
        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
      </Suspense>

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={5}
        maxDistance={40}
      />
    </Canvas>
  );
};

export default Experience;