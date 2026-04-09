import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sphere, Torus, Octahedron } from '@react-three/drei'

export function PowerUp({ type = 'magnet', position = [0, 1, 0] }) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2
      meshRef.current.rotation.z += delta
    }
  })

  const getModel = () => {
    switch (type) {
      case 'magnet':
        return (
          <Torus args={[0.4, 0.1, 16, 32]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
          </Torus>
        )
      case 'shield':
        return (
          <Sphere args={[0.5, 16, 16]}>
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} transparent opacity={0.6} />
          </Sphere>
        )
      case 'boost':
        return (
          <Octahedron args={[0.6]}>
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
          </Octahedron>
        )
      default:
        return null
    }
  }

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={1}>
      <group ref={meshRef} position={position}>
        {getModel()}
        {/* Glow point light */}
        <pointLight intensity={0.5} distance={3} color={
          type === 'magnet' ? '#3b82f6' : (type === 'shield' ? '#10b981' : '#f43f5e')
        } />
      </group>
    </Float>
  )
}

export default PowerUp
