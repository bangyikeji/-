
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
  
  // Palettes - Deep Traditional Christmas Tones
  const accentColors = ['#8B0000', '#700000', '#006400', '#1A5220']; 
  
  const glowColors = ['#FFFFE0', '#FFFACD', '#FFF8DC', '#FFD700', '#F0E68C']; // Warm Whites/Gold/Yellows
  const particleColors = ['#FFD700', '#FFA500', '#FFC107']; // Gold/Orange

  for (let i = 0; i < count; i++) {
    // Height generation using sqrt to reduce density at the top tip
    const hRaw = 1 - Math.sqrt(Math.random());
    const y = hRaw * TREE_HEIGHT;
    
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

    // Explosion vector
    const explodeDir = new THREE.Vector3(x, finalY, z).normalize().multiplyScalar(15 + Math.random() * 20);

    // Determine Group and Properties
    const rand = Math.random();
    let group: 'accent' | 'glow' | 'particle';
    let color: string;
    let baseScale: number;
    let type: 'sphere' | 'cube';

    if (rand < 0.15) {
        // 15% Accents (Red/Green LEDs)
        group = 'accent';
        color = accentColors[Math.floor(Math.random() * accentColors.length)];
        // Scale: Increased to match Glows (was 0.06 - 0.10)
        baseScale = Math.random() * 0.04 + 0.08; // 0.08 - 0.12
        type = 'sphere'; 
    } else if (rand < 0.40) {
        // 25% Glow (Yellow/White) - Larger bulbs
        group = 'glow';
        color = glowColors[Math.floor(Math.random() * glowColors.length)];
        // Scale: (0.08 - 0.12)
        baseScale = Math.random() * 0.04 + 0.08;
        type = 'sphere'; 
    } else {
        // 60% Particles (Gold) - Medium sparkles
        group = 'particle';
        color = particleColors[Math.floor(Math.random() * particleColors.length)];
        // Scale: (0.04 - 0.08)
        baseScale = Math.random() * 0.04 + 0.04; 
        type = Math.random() > 0.7 ? 'cube' : 'sphere'; 
    }

    data.push({
      position: new THREE.Vector3(x, finalY, z),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      scale: baseScale,
      explodeVector: explodeDir,
      color: color,
      type: type,
      group: group
    });
  }
  return data;
};

/**
 * Generates positions specifically on the surface of the cone for frames
 */
export const generateFrameData = (count: number): FrameData[] => {
  const data: FrameData[] = [];
  const RING_RADIUS = 6; // Compact ring
  
  for (let i = 0; i < count; i++) {
    // 1. Initial Tree Positions
    const y = (i / count) * (TREE_HEIGHT * 0.8) + 1; 
    const currentRadius = ((TREE_HEIGHT - y) / TREE_HEIGHT) * TREE_RADIUS;
    const angle = i * 2.5; 
    const r = currentRadius + 0.5;

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
    // Rotate so index 0 is at front (PI/2)
    const ringAngle = (i / count) * Math.PI * 2 + Math.PI / 2; 
    const ex = Math.cos(ringAngle) * RING_RADIUS;
    const ez = Math.sin(ringAngle) * RING_RADIUS;
    const explodePos = new THREE.Vector3(ex, 0, ez);

    // Look away from center (outward)
    dummy.position.copy(explodePos);
    dummy.lookAt(new THREE.Vector3(ex * 2, 0, ez * 2));
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
