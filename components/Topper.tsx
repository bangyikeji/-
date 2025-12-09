import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const Topper = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
      // Bobbing motion
      meshRef.current.position.y = 6.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 6.5, 0]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700"
        emissiveIntensity={0.5}
        metalness={1} 
        roughness={0.1} 
      />
      <pointLight distance={5} intensity={5} color="#FFD700" />
    </mesh>
  );
};

export default Topper;
