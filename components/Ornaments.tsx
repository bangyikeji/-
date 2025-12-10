
import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateOrnamentData } from '../utils';
import { PositionData } from '../types';

interface OrnamentsProps {
  isExploded: boolean;
}

const Ornaments: React.FC<OrnamentsProps> = ({ isExploded }) => {
  const redMeshRef = useRef<THREE.InstancedMesh>(null);
  const greenMeshRef = useRef<THREE.InstancedMesh>(null);
  const glowMeshRef = useRef<THREE.InstancedMesh>(null);
  const particleMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Reduced count slightly
  const count = 2700; 
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate data once
  const data = useMemo(() => generateOrnamentData(count), []);
  
  // Split data groups
  // We identify Green by checking if the color hex contains typical green values or is explicitly green
  // Using the new dark green palette: #006400 and #228B22
  const isGreen = (c: string) => c === '#006400' || c === '#228B22';
  
  const redAccents = useMemo(() => data.filter(d => d.group === 'accent' && !isGreen(d.color)), [data]);
  const greenAccents = useMemo(() => data.filter(d => d.group === 'accent' && isGreen(d.color)), [data]);
  const glows = useMemo(() => data.filter(d => d.group === 'glow'), [data]);
  const particles = useMemo(() => data.filter(d => d.group === 'particle'), [data]);

  // Apply Colors
  useLayoutEffect(() => {
    const tempColor = new THREE.Color();

    // Helper to safely set color
    const setColors = (mesh: THREE.InstancedMesh | null, items: PositionData[]) => {
      if (!mesh) return;
      for (let i = 0; i < items.length; i++) {
        tempColor.set(items[i].color);
        mesh.setColorAt(i, tempColor);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    setColors(redMeshRef.current, redAccents);
    setColors(greenMeshRef.current, greenAccents);
    setColors(glowMeshRef.current, glows);
    setColors(particleMeshRef.current, particles);
  }, [redAccents, greenAccents, glows, particles]);
  
  // Simulation Buffers
  const redPositions = useMemo(() => new Float32Array(redAccents.length * 3), [redAccents]);
  const greenPositions = useMemo(() => new Float32Array(greenAccents.length * 3), [greenAccents]);
  const glowPositions = useMemo(() => new Float32Array(glows.length * 3), [glows]);
  const particlePositions = useMemo(() => new Float32Array(particles.length * 3), [particles]);

  // Initialize buffers
  useLayoutEffect(() => {
    const initBuffer = (arr: Float32Array, source: PositionData[]) => {
      source.forEach((d, i) => {
        arr[i*3] = d.position.x;
        arr[i*3+1] = d.position.y;
        arr[i*3+2] = d.position.z;
      });
    };
    initBuffer(redPositions, redAccents);
    initBuffer(greenPositions, greenAccents);
    initBuffer(glowPositions, glows);
    initBuffer(particlePositions, particles);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const smooth = 4 * delta;

    // Helper to update a specific mesh group
    const updateGroup = (
      mesh: THREE.InstancedMesh, 
      items: PositionData[], 
      buffer: Float32Array, 
      speedMod: number,
      floatScale: number,
      breathing: boolean
    ) => {
      for (let i = 0; i < items.length; i++) {
        const d = items[i];
        let tx = d.position.x;
        let ty = d.position.y;
        let tz = d.position.z;

        if (isExploded) {
           tx = d.position.x + d.explodeVector.x;
           ty = d.position.y + d.explodeVector.y + Math.sin(time * speedMod + i) * floatScale; 
           tz = d.position.z + d.explodeVector.z;
        }

        buffer[i*3] += (tx - buffer[i*3]) * smooth;
        buffer[i*3+1] += (ty - buffer[i*3+1]) * smooth;
        buffer[i*3+2] += (tz - buffer[i*3+2]) * smooth;

        dummy.position.set(buffer[i*3], buffer[i*3+1], buffer[i*3+2]);
        dummy.rotation.copy(d.rotation);
        dummy.rotation.x += delta * speedMod;
        dummy.rotation.y += delta * speedMod;
        
        // Scale breathing for lights
        let s = d.scale;
        if (breathing) s += Math.sin(time * 3 + i) * (d.scale * 0.15);
        
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (redMeshRef.current) updateGroup(redMeshRef.current, redAccents, redPositions, 0.5, 0.5, true);
    if (greenMeshRef.current) updateGroup(greenMeshRef.current, greenAccents, greenPositions, 0.5, 0.5, true);
    if (glowMeshRef.current) updateGroup(glowMeshRef.current, glows, glowPositions, 0.2, 0.8, true);
    if (particleMeshRef.current) updateGroup(particleMeshRef.current, particles, particlePositions, 1.0, 1.5, false);
  });

  return (
    <>
      {/* 1. Red Accents: Dark Red LEDs */}
      <instancedMesh ref={redMeshRef} args={[undefined, undefined, redAccents.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          roughness={1} 
          metalness={0} 
          emissive="#8B0000" 
          emissiveIntensity={2.0}
        />
      </instancedMesh>

      {/* 2. Green Accents: Deep Forest Green LEDs */}
      <instancedMesh ref={greenMeshRef} args={[undefined, undefined, greenAccents.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          roughness={1} 
          metalness={0} 
          emissive="#006400" 
          emissiveIntensity={2.0}
        />
      </instancedMesh>
      
      {/* 3. Glows: Yellow/White, Soft LED */}
      <instancedMesh ref={glowMeshRef} args={[undefined, undefined, glows.length]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            roughness={1} 
            metalness={0} 
            emissive="#FFD700" 
            emissiveIntensity={0.6}
        />
      </instancedMesh>

      {/* 4. Particles: Gold, Tiny, Sparkly */}
      <instancedMesh ref={particleMeshRef} args={[undefined, undefined, particles.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={0.8}
            roughness={0.4}
            metalness={1}
        />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
