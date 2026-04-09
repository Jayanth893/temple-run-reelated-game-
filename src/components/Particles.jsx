import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'

// Generic Burst Particle System (for coins, explosions, impacts)
export function Particles({ position = [0, 0, 0], type = 'coin' }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  
  const isExplosion = type === 'explosion'
  const particleCount = isExplosion ? 30 : 15
  const color = isExplosion ? '#ef4444' : '#fcd34d'
  const emissive = isExplosion ? '#991b1b' : '#fbbf24'
  
  // Create explosion data
  const particleData = useMemo(() => {
    const data = []
    for (let i = 0; i < particleCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2 + (isExplosion ? 1 : 0),
        z: (Math.random() - 0.5) * 2,
        scale: Math.random() * (isExplosion ? 0.6 : 0.4) + 0.1,
        life: 0,
        speed: Math.random() * (isExplosion ? 6 : 2) + (isExplosion ? 3 : 2)
      })
    }
    return data
  }, [particleCount, isExplosion])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    particleData.forEach((p, i) => {
      p.life += delta * (isExplosion ? 1.5 : 2) // Fade out speed
      
      // Calculate scaling so particles shrink as they age
      const scale = p.scale * Math.max(0, 1 - p.life)
      
      // Calculate outward explosion movement
      dummy.position.set(
        position[0] + p.x * p.life * p.speed, 
        position[1] + p.y * p.life * p.speed, 
        position[2] + p.z * p.life * p.speed
      )
      
      // Add gravity for explosion
      if (isExplosion) dummy.position.y -= (p.life * p.life) * 5 

      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, particleCount]} castShadow>
      {isExplosion ? <dodecahedronGeometry args={[0.4]} /> : <boxGeometry args={[0.3, 0.3, 0.3]} />}
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} />
    </instancedMesh>
  )
}

// Continuous Dust Particles attached globally but following the player
export function RunningDust({ playerRef }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  
  // Pool of 40 dust particles
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      active: false,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 1, scale: 0
    }))
  }, [])
  
  const nextParticle = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current || !playerRef?.current) return
    
    const pPos = playerRef.current.getPosition()
    if (!pPos) return
    
    const isJumping = playerRef.current.getIsJumping ? playerRef.current.getIsJumping() : false
    const isSliding = playerRef.current.getIsSliding ? playerRef.current.getIsSliding() : false

    // Spawn new dust if not jumping
    if (!isJumping) {
      // Spawn more intensely if sliding
      const spawnCount = isSliding ? 3 : 1
      for (let i = 0; i < spawnCount; i++) {
        const p = particles[nextParticle.current]
        p.active = true
        p.life = 0
        p.scale = Math.random() * 0.3 + 0.1
        
        // Spawn slightly randomly around feet
        p.x = pPos.x + (Math.random() - 0.5) * 0.8
        p.y = 0.2
        p.z = pPos.z + (Math.random() - 0.5) * 0.8
        
        p.vx = (Math.random() - 0.5) * 2
        p.vy = Math.random() * 2 + 0.5
        p.vz = Math.random() * 2 + 1 // Pushed subtly backward (positive Z)
        
        nextParticle.current = (nextParticle.current + 1) % particles.length
      }
    }
    
    // Update active particles
    particles.forEach((p, i) => {
      if (!p.active) {
        dummy.scale.set(0, 0, 0)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        return
      }
      
      p.life += delta * 1.5 // Particle lifetime (approx 0.6 seconds)
      if (p.life >= 1) {
        p.active = false
        dummy.scale.set(0, 0, 0)
      } else {
        // Move particle
        p.x += p.vx * delta
        p.y += p.vy * delta
        p.z += p.vz * delta
        
        const s = p.scale * (1 - p.life) // Shrink
        dummy.position.set(p.x, p.y, p.z)
        dummy.scale.set(s, s, s)
      }
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, 40]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#6b5b4e" transparent opacity={0.6} roughness={1} />
    </instancedMesh>
  )
}

export default Particles
