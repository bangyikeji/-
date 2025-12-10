
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const Topper = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate 3D Star Shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Changed to 6 points for a hexagram star
    const points = 6; 
    const outerRadius = 1.2;
    const innerRadius = 0.6;
    
    for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2; // Rotate to point up
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
        steps: 1,
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Center the geometry
  useMemo(() => {
     starGeometry.center();
  }, [starGeometry]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
      // Bobbing motion
      meshRef.current.position.y = 6.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 6.8, 0]} geometry={starGeometry}>
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700"
        emissiveIntensity={0.6}
        metalness={0.2} // Reduced reflection (Was 0.8)
        roughness={0.8} // Matte finish (Was 0.2)
      />
      {/* Reduced light intensity */}
      <pointLight distance={10} intensity={5} color="#FFD700" decay={2} />
    </mesh>
  );
};

export default Topper;
