import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { generateFrameData } from '../utils';
import { FrameData } from '../types';

interface FramesProps {
  isExploded: boolean;
}

// Individual Frame Component to handle interaction and texture state independently
const SingleFrame: React.FC<{ data: FrameData; isExploded: boolean }> = ({ data, isExploded }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Default image - using a placeholder service
  const [imageUrl, setImageUrl] = useState(`https://picsum.photos/seed/${data.id}/200/200`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Texture state
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture when URL changes
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [imageUrl]);
  
  // Current position state for lerping
  const currentPos = useRef(data.initialPos.clone());

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const target = isExploded ? data.explodePos : data.initialPos;
    
    // Float effect when exploded
    const floatY = isExploded ? Math.sin(time * 2 + data.id) * 0.2 : 0;
    
    // Lerp position
    currentPos.current.lerp(new THREE.Vector3(target.x, target.y + floatY, target.z), delta * 3);
    meshRef.current.position.copy(currentPos.current);

    // Look at camera when exploded, look out when in tree
    if (isExploded) {
        // Let's add a slow spin when exploded
        meshRef.current.rotation.y += delta * 0.1;
    } else {
        // Return to initial rotation
        meshRef.current.rotation.x = data.rotation.x;
        meshRef.current.rotation.y = data.rotation.y;
        meshRef.current.rotation.z = data.rotation.z;
    }
  });

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  return (
    <group>
        {/* Hidden Input for this specific frame, wrapped in Html component */}
        <Html style={{ display: 'none' }}>
           <input 
             ref={fileInputRef} 
             type="file" 
             accept="image/*" 
             onChange={handleFileChange} 
             style={{ display: 'none' }} 
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
            color={hovered ? "#ffaa00" : "#d4af37"} 
            metalness={1} 
            roughness={0.2} 
          />
          
          {/* The Photo inside */}
          <mesh position={[0, 0, 0.06]}>
             <planeGeometry args={[1, 1]} />
             <meshBasicMaterial 
               map={texture || undefined} 
               color={texture ? "white" : "#eee"} 
             />
          </mesh>
        </mesh>
    </group>
  );
};

const Frames: React.FC<FramesProps> = ({ isExploded }) => {
  const frames = useMemo(() => generateFrameData(12), []);

  return (
    <>
      {frames.map((frame) => (
        <SingleFrame key={frame.id} data={frame} isExploded={isExploded} />
      ))}
    </>
  );
};

export default Frames;