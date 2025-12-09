import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateOrnamentData } from '../utils';

interface OrnamentsProps {
  isExploded: boolean;
}

const Ornaments: React.FC<OrnamentsProps> = ({ isExploded }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cubeMeshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1200; // Total decorative elements
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate data once
  const data = useMemo(() => generateOrnamentData(count), []);
  
  // Split into spheres and cubes for visual variety
  const spheres = useMemo(() => data.filter(d => d.type === 'sphere'), [data]);
  const cubes = useMemo(() => data.filter(d => d.type === 'cube'), [data]);

  useLayoutEffect(() => {
    // Set initial colors
    if (meshRef.current) {
      spheres.forEach((d, i) => {
        meshRef.current!.setColorAt(i, new THREE.Color(d.color));
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
    if (cubeMeshRef.current) {
      cubes.forEach((d, i) => {
        cubeMeshRef.current!.setColorAt(i, new THREE.Color(d.color));
      });
      cubeMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [spheres, cubes]);

  useFrame((state, delta) => {
    // Update Spheres
    // Note: We don't perform the update loop if there are no spheres to avoid errors, 
    // though count is high so this is unlikely.
  });
  
  // To Achieve the smooth animation without per-instance state storage in React:
  // We utilize a simple simulation loop.
  // We create a Float32Array to store current positions to allow individual lerping.
  const currentPositionsSpheres = useMemo(() => new Float32Array(spheres.length * 3), [spheres]);
  const currentPositionsCubes = useMemo(() => new Float32Array(cubes.length * 3), [cubes]);
  
  // Initialize
  useLayoutEffect(() => {
    spheres.forEach((d, i) => {
      currentPositionsSpheres[i*3] = d.position.x;
      currentPositionsSpheres[i*3+1] = d.position.y;
      currentPositionsSpheres[i*3+2] = d.position.z;
    });
    cubes.forEach((d, i) => {
      currentPositionsCubes[i*3] = d.position.x;
      currentPositionsCubes[i*3+1] = d.position.y;
      currentPositionsCubes[i*3+2] = d.position.z;
    });
  }, [spheres, cubes, currentPositionsSpheres, currentPositionsCubes]);


  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const smooth = 4 * delta; // Lerp speed

    // Update Spheres
    if (meshRef.current) {
      for (let i = 0; i < spheres.length; i++) {
        const d = spheres[i];
        
        // Target
        let tx = d.position.x;
        let ty = d.position.y;
        let tz = d.position.z;

        if (isExploded) {
           tx = d.position.x + d.explodeVector.x;
           ty = d.position.y + d.explodeVector.y + Math.sin(time + i) * 0.5; // Add float
           tz = d.position.z + d.explodeVector.z;
        }

        // Lerp Current to Target
        currentPositionsSpheres[i*3] += (tx - currentPositionsSpheres[i*3]) * smooth;
        currentPositionsSpheres[i*3+1] += (ty - currentPositionsSpheres[i*3+1]) * smooth;
        currentPositionsSpheres[i*3+2] += (tz - currentPositionsSpheres[i*3+2]) * smooth;

        dummy.position.set(
          currentPositionsSpheres[i*3],
          currentPositionsSpheres[i*3+1],
          currentPositionsSpheres[i*3+2]
        );
        dummy.rotation.copy(d.rotation);
        // Add slow rotation to ornaments themselves
        dummy.rotation.x += delta * 0.2; 
        dummy.rotation.y += delta * 0.2;
        
        dummy.scale.setScalar(d.scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Cubes
    if (cubeMeshRef.current) {
      for (let i = 0; i < cubes.length; i++) {
        const d = cubes[i];
         // Target
         let tx = d.position.x;
         let ty = d.position.y;
         let tz = d.position.z;
 
         if (isExploded) {
            tx = d.position.x + d.explodeVector.x;
            ty = d.position.y + d.explodeVector.y + Math.cos(time + i) * 0.5;
            tz = d.position.z + d.explodeVector.z;
         }
 
         currentPositionsCubes[i*3] += (tx - currentPositionsCubes[i*3]) * smooth;
         currentPositionsCubes[i*3+1] += (ty - currentPositionsCubes[i*3+1]) * smooth;
         currentPositionsCubes[i*3+2] += (tz - currentPositionsCubes[i*3+2]) * smooth;

        dummy.position.set(
          currentPositionsCubes[i*3],
          currentPositionsCubes[i*3+1],
          currentPositionsCubes[i*3+2]
        );
        dummy.rotation.copy(d.rotation);
        dummy.rotation.z += delta * 0.5; // Cubes spin faster
        dummy.scale.setScalar(d.scale);
        dummy.updateMatrix();
        cubeMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      cubeMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, spheres.length]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial roughness={0.1} metalness={0.8} />
      </instancedMesh>
      
      <instancedMesh ref={cubeMeshRef} args={[undefined, undefined, cubes.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.2} metalness={0.9} />
      </instancedMesh>
    </>
  );
};

export default Ornaments;