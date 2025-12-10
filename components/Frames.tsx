
import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { generateFrameData } from '../utils';
import { FrameData } from '../types';

interface FramesProps {
  isExploded: boolean;
  activeFrameId: number | null;
  setActiveFrameId: (id: number | null) => void;
}

// Individual Frame Component
const SingleFrame: React.FC<{ 
  data: FrameData; 
  isExploded: boolean;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
}> = ({ data, isExploded, isActive, onActivate, onClose }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const { camera, size } = useThree();
  
  // Default image
  const [imageUrl, setImageUrl] = useState(`https://picsum.photos/seed/${data.id}/400/400`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Texture state
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture reliably
  useEffect(() => {
    // Clear previous texture to avoid flashing wrong image
    setTexture(null);
    
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'Anonymous';
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      // Standard plane geometry matches standard texture orientation
      setTexture(tex);
    });
  }, [imageUrl]);
  
  // Current position and rotation state helpers for smoothing
  const currentPos = useRef(data.initialPos.clone());
  const qCurrent = useRef(new THREE.Quaternion().setFromEuler(data.rotation));
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    let targetPosition = isExploded ? data.explodePos : data.initialPos;
    let targetQuaternion = new THREE.Quaternion().setFromEuler(isExploded ? data.explodeRotation : data.rotation);

    // Override if Active: Calculate position in front of camera
    if (isActive) {
      // 1. Get Camera World Position and Direction
      const cameraWorldPos = new THREE.Vector3();
      const cameraDirection = new THREE.Vector3();
      camera.getWorldPosition(cameraWorldPos);
      camera.getWorldDirection(cameraDirection);

      // 2. Determine target World Position
      // We adjust distance based on screen width to fit mobile
      const dist = size.width < 600 ? 5 : 4.5;
      const targetWorldPos = cameraWorldPos.clone().add(cameraDirection.clone().multiplyScalar(dist));

      // 3. Convert World Position to Local Position (relative to parent group)
      if (meshRef.current.parent) {
         targetPosition = meshRef.current.parent.worldToLocal(targetWorldPos.clone());
      }

      // 4. Face the camera (LookAt)
      if (meshRef.current.parent) {
          const localCamPos = meshRef.current.parent.worldToLocal(cameraWorldPos.clone());
          const dummy = new THREE.Object3D();
          dummy.position.copy(targetPosition);
          dummy.lookAt(localCamPos);
          targetQuaternion = dummy.quaternion;
      }
    } else {
       // Float effect when exploded and not active
       if (isExploded) {
         const floatY = Math.sin(time * 2 + data.id) * 0.2;
         targetPosition = new THREE.Vector3(targetPosition.x, targetPosition.y + floatY, targetPosition.z);
       }
    }

    // Lerp Position
    const posSpeed = isActive ? 5 : 3;
    currentPos.current.lerp(targetPosition, delta * posSpeed);
    meshRef.current.position.copy(currentPos.current);

    // Slerp Rotation
    qCurrent.current.slerp(targetQuaternion, delta * posSpeed);
    meshRef.current.rotation.setFromQuaternion(qCurrent.current);

    // Scale effect
    const scaleTarget = isActive ? 1.5 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), delta * 5);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isActive) {
        onActivate();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      e.target.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <group>
        {/* Fullscreen UI Overlay for Active State */}
        {isActive && (
           <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
             <div className="w-full h-full relative">
                
                {/* Close Button - Top Right */}
                <div className="absolute top-6 right-6 md:top-8 md:right-8 pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onClose(); }}
                      className="bg-black/40 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-md transition-colors shadow-lg active:scale-95 border border-white/10"
                      title="Close"
                    >
                      {/* X Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                    </button>
                </div>

                {/* Change Photo Button - Bottom Center (Above the main navigation) */}
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-auto w-max">
                   <button 
                     onClick={triggerUpload}
                     className="bg-white/90 hover:bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 transition-transform active:scale-95 border-2 border-transparent hover:border-yellow-400"
                   >
                     {/* Upload Icon */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
                     </svg>
                     Change Photo
                   </button>
                </div>
             </div>
           </Html>
        )}

        <Html style={{ display: 'none' }}>
           <input 
             ref={fileInputRef} 
             type="file" 
             accept="image/*" 
             onChange={handleFileChange} 
           />
        </Html>

        <mesh
          ref={meshRef}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          {/* Frame structure */}
          <boxGeometry args={[1.2, 1.2, 0.1]} />
          <meshStandardMaterial 
            color={hovered || isActive ? "#ffaa00" : "#d4af37"} 
            metalness={1} 
            roughness={0.2} 
          />
          
          {/* The Photo inside */}
          <mesh position={[0, 0, 0.055]}>
             <planeGeometry args={[1, 1]} />
             <meshBasicMaterial 
                key={imageUrl} 
                map={texture || undefined} 
                color={texture ? "white" : "#eee"} 
                toneMapped={false} 
             />
          </mesh>
        </mesh>
    </group>
  );
};

const Frames: React.FC<FramesProps> = ({ isExploded, activeFrameId, setActiveFrameId }) => {
  const frames = useMemo(() => generateFrameData(12), []);

  return (
    <>
      {frames.map((frame) => (
        <SingleFrame 
            key={frame.id} 
            data={frame} 
            isExploded={isExploded}
            isActive={activeFrameId === frame.id}
            onActivate={() => setActiveFrameId(frame.id)}
            onClose={() => setActiveFrameId(null)}
        />
      ))}
    </>
  );
};

export default Frames;
