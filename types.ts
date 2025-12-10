import * as THREE from 'three';

export interface PositionData {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  explodeVector: THREE.Vector3;
  color: string;
  type: 'sphere' | 'cube';
  group: 'accent' | 'glow' | 'particle';
}

export interface FrameData {
  id: number;
  initialPos: THREE.Vector3;
  explodePos: THREE.Vector3;
  rotation: THREE.Euler;
  explodeRotation: THREE.Euler;
}