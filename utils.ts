import * as THREE from 'three';
import { PositionData, FrameData } from './types';

// Constants
const TREE_HEIGHT = 12;
const TREE_RADIUS = 5;
const EXPLOSION_RADIUS = 25;

/**
 * Generates random positions inside a cone volume for ornaments
 */
export const generateOrnamentData = (count: number): PositionData[] => {
  const data: PositionData[] = [];
  const colors = ['#D32F2F', '#1B5E20', '#FFD700', '#C62828', '#2E7D32']; // Red, Green, Gold variants

  for (let i = 0; i < count; i++) {
    // Height from 0 to TREE_HEIGHT
    const y = Math.random() * TREE_HEIGHT;
    
    // Radius at this height (linear taper)
    const currentRadius = ((TREE_HEIGHT - y) / TREE_HEIGHT) * TREE_RADIUS;
    
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Random distance from center (fill the volume, not just surface)
    const r = Math.sqrt(Math.random()) * currentRadius;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    // Shift y down so tree is centered roughly
    const finalY = y - TREE_HEIGHT / 2;

    // Explosion vector: direction from center outwards + some randomness
    const explodeDir = new THREE.Vector3(x, finalY, z).normalize().multiplyScalar(Math.random() * 10 + 5);

    data.push({
      position: new THREE.Vector3(x, finalY, z),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: Math.random() * 0.25 + 0.1, // Reduced scale (0.1 to 0.35)
      explodeVector: explodeDir,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: Math.random() > 0.5 ? 'sphere' : 'cube'
    });
  }
  return data;
};

/**
 * Generates positions specifically on the surface of the cone for frames
 */
export const generateFrameData = (count: number): FrameData[] => {
  const data: FrameData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Spiral distribution for frames to look even
    const y = (i / count) * (TREE_HEIGHT * 0.8) + 1; // Start a bit up, end before top
    const currentRadius = ((TREE_HEIGHT - y) / TREE_HEIGHT) * TREE_RADIUS;
    
    const angle = i * 2.5; // Golden angle-ish offset
    
    // Slightly push out so they sit on the "leaves"
    const r = currentRadius + 0.5;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const finalY = y - TREE_HEIGHT / 2;

    const initialPos = new THREE.Vector3(x, finalY, z);
    
    // Look away from center
    const lookAtPos = new THREE.Vector3(x * 2, finalY, z * 2);
    const dummy = new THREE.Object3D();
    dummy.position.copy(initialPos);
    dummy.lookAt(lookAtPos);
    
    // Explosion: simply move further out along the radius
    const explodePos = initialPos.clone().normalize().multiplyScalar(EXPLOSION_RADIUS * 0.5 + Math.random() * 5);

    data.push({
      id: i,
      initialPos,
      explodePos,
      rotation: dummy.rotation.clone(),
    });
  }
  return data;
};