import * as THREE from 'three';
import { PositionData, FrameData } from './types';

// Constants
const TREE_HEIGHT = 12;
const TREE_RADIUS = 5;

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

    // Explosion vector: direction from center outwards + significant distance to clear center
    // Normalized vector * (Base distance + random variance)
    const explodeDir = new THREE.Vector3(x, finalY, z).normalize().multiplyScalar(15 + Math.random() * 20);

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
  const RING_RADIUS = 7;
  
  for (let i = 0; i < count; i++) {
    // 1. Initial Tree Positions
    const y = (i / count) * (TREE_HEIGHT * 0.8) + 1; // Start a bit up, end before top
    const currentRadius = ((TREE_HEIGHT - y) / TREE_HEIGHT) * TREE_RADIUS;
    const angle = i * 2.5; // Golden angle-ish offset
    const r = currentRadius + 0.5; // Slightly push out so they sit on the "leaves"

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const finalY = y - TREE_HEIGHT / 2;

    const initialPos = new THREE.Vector3(x, finalY, z);
    
    // Look away from center for tree mode
    const lookAtPos = new THREE.Vector3(x * 2, finalY, z * 2);
    const dummy = new THREE.Object3D();
    dummy.position.copy(initialPos);
    dummy.lookAt(lookAtPos);
    const initialRotation = dummy.rotation.clone();
    
    // 2. Exploded Ring Positions
    const ringAngle = (i / count) * Math.PI * 2; // Evenly distributed circle
    const ex = Math.cos(ringAngle) * RING_RADIUS;
    const ez = Math.sin(ringAngle) * RING_RADIUS;
    const explodePos = new THREE.Vector3(ex, 0, ez);

    // Look away from center for ring mode
    dummy.position.copy(explodePos);
    dummy.lookAt(explodePos.clone().multiplyScalar(2));
    const explodeRotation = dummy.rotation.clone();

    data.push({
      id: i,
      initialPos,
      explodePos,
      rotation: initialRotation,
      explodeRotation
    });
  }
  return data;
};