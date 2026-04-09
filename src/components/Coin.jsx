import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function Coin({ position = [0, 1, 0] }) {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth continuous spin around the vertical Y axis
      groupRef.current.rotation.y += delta * 4
    }
  })

  return (
    <Float 
      position={position}
      speed={4} 
      rotationIntensity={0.2} // slight wobble
      floatIntensity={0.8} // nice up and down motion
      floatingRange={[-0.2, 0.2]}
    >
      <group ref={groupRef}>
        
        {/* Inner Coin Core with high metallic shine */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
          <meshStandardMaterial 
            color="#ffe066" 
            metalness={1} 
            roughness={0.2} 
            emissive="#d4af37"
            emissiveIntensity={0.8}
            envMapIntensity={2}
          />
        </mesh>

        {/* Outer Ring / Rim (Makes it look complex and minted) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.35, 0.04, 16, 32]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            metalness={1} 
            roughness={0.1}
            emissive="#fbbf24"
            emissiveIntensity={1}
          />
        </mesh>

        {/* Inner Engraving Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.02, 16, 32]} />
          <meshStandardMaterial 
            color="#d4af37" 
            metalness={1} 
            roughness={0.3}
          />
        </mesh>

        {/* Dynamic Glow Light (Soft yellow illumination) */}
        <pointLight 
          color="#ffdd44" 
          intensity={1.5} 
          distance={3} 
          decay={2} 
        />

        {/* Magical Sparkles/Shine Effect */}
        <Sparkles 
          count={15} 
          scale={1.5} 
          size={5} 
          speed={0.6} 
          opacity={0.8} 
          color="#ffffff" 
          noise={0.1} // subtle chaotic movement
        />
        
        {/* Golden dust trailing */}
        <Sparkles 
          count={5} 
          scale={1.2} 
          size={8} 
          speed={0.2} 
          opacity={0.5} 
          color="#ffcc00" 
        />
      </group>
    </Float>
  )
}

export default Coin
