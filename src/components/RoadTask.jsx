import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { MathUtils } from 'three'

const TASK_COLORS = {
  JUMP: '#3b82f6', // Blue
  SLIDE: '#eab308', // Yellow
  LEFT: '#a855f7', // Purple
  RIGHT: '#ec4899', // Pink
}

const TASK_SYMBOLS = {
  JUMP: '▲',
  SLIDE: '▼',
  LEFT: '◀',
  RIGHT: '▶',
}

const TASK_LABELS = {
  JUMP: 'JUMP!',
  SLIDE: 'SLIDE!',
  LEFT: 'DODGE LEFT',
  RIGHT: 'DODGE RIGHT',
}

export function RoadTask({ type, position }) {
  const groupRef = useRef()
  const glowRef = useRef()

  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // Constant slow float/bobbing
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.2
    
    // Pulse glow
    if (glowRef.current) {
      glowRef.current.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.2
    }
  })

  // We place it slightly above ground
  return (
    <group ref={groupRef} position={[position[0], position[1] + 0.5, position[2]]}>
      
      {/* Holographic glowing base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial 
          ref={glowRef}
          color={TASK_COLORS[type]} 
          transparent 
          opacity={0.6} 
          depthWrite={false} 
        />
      </mesh>

      {/* Holographic Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
        <ringGeometry args={[1.1, 1.2, 32]} />
        <meshBasicMaterial color={TASK_COLORS[type]} transparent opacity={0.9} />
      </mesh>

      {/* Symbol (Arrow) */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={1.2}
        color={TASK_COLORS[type]}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        {TASK_SYMBOLS[type]}
      </Text>

      {/* Floating Instruction Text */}
      <Text
        position={[0, -0.2, 0.3]}
        rotation={[-Math.PI / 4, 0, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {TASK_LABELS[type]}
      </Text>
    </group>
  )
}

export default RoadTask
