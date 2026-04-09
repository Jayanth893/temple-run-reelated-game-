import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment as DreiEnvironment } from '@react-three/drei'
import * as THREE from 'three'

function createStoneTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#3d3023'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 5000; i++) {
    const isMoss = Math.random() > 0.5
    ctx.fillStyle = isMoss
      ? `rgba(20, 60, 20, ${Math.random() * 0.5})`
      : `rgba(10, 10, 10, ${Math.random() * 0.4})`
    ctx.beginPath()
    ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#1a140f'
  ctx.lineCap = 'round'
  for (let i = 0; i < 15; i++) {
    const y = Math.random() * 512
    ctx.lineWidth = 2 + Math.random() * 4
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y + (Math.random() * 20 - 10))
    ctx.stroke()
  }
  const map = new THREE.CanvasTexture(canvas)
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  return map
}

// Individual scenery object that loops itself infinitely
const SceneryItem = ({ type, x, initialZ, rot, playerRef }) => {
  const meshRef = useRef()

  useFrame(() => {
    if (!meshRef.current || !playerRef?.current) return
    const pos = playerRef.current.getPosition()
    if (!pos) return
    const pZ = pos.z
    // Wrap: when the object is behind the player, send it 400 units ahead
    if (meshRef.current.position.z > pZ + 40) {
      meshRef.current.position.z -= 420
    }
  })

  // All scenery items sit on the ground (y=0). Each mesh positions itself above that internally.
  if (type === 'tree') {
    return (
      <group position={[x, 0, initialZ]} rotation={rot} ref={meshRef}>
        {/* Trunk — bottom at y=0, so it sits on the ground */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.55, 4, 8]} />
          <meshStandardMaterial color="#3e2723" roughness={0.95} />
        </mesh>
        {/* Canopy layers */}
        <mesh position={[0, 5.5, 0]} castShadow>
          <coneGeometry args={[2.8, 4, 7]} />
          <meshStandardMaterial color="#1b4a14" roughness={0.8} />
        </mesh>
        <mesh position={[0, 7.5, 0]} castShadow>
          <coneGeometry args={[2.0, 3, 7]} />
          <meshStandardMaterial color="#236b18" roughness={0.8} />
        </mesh>
        <mesh position={[0, 9, 0]} castShadow>
          <coneGeometry args={[1.2, 2.5, 7]} />
          <meshStandardMaterial color="#2d8620" roughness={0.8} />
        </mesh>
      </group>
    )
  }

  if (type === 'palm') {
    return (
      <group position={[x, 0, initialZ]} rotation={rot} ref={meshRef}>
        <mesh position={[0, 4, 0]} rotation={[0, 0, x > 0 ? 0.2 : -0.2]} castShadow>
          <cylinderGeometry args={[0.2, 0.35, 8, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={1} />
        </mesh>
        {[0, 1, 2, 3, 4].map(i => (
          <mesh
            key={i}
            position={[Math.cos(i * 1.26) * 1.5, 8.5, Math.sin(i * 1.26) * 1.5]}
            rotation={[0.6, i * 1.26, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, 0.05, 2.5]} />
            <meshStandardMaterial color="#2e7d32" roughness={0.7} />
          </mesh>
        ))}
      </group>
    )
  }

  if (type === 'rock') {
    return (
      <group position={[x, 0, initialZ]} rotation={rot} ref={meshRef}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <dodecahedronGeometry args={[1.2 + Math.random() * 0.6, 0]} />
          <meshStandardMaterial color="#2e3b32" roughness={1} />
        </mesh>
      </group>
    )
  }

  if (type === 'ruin') {
    return (
      <group position={[x, 0, initialZ]} rotation={rot} ref={meshRef}>
        <mesh position={[0, 3, 0]} castShadow>
          <boxGeometry args={[1.5, 6, 1.5]} />
          <meshStandardMaterial color="#4a5446" roughness={1} />
        </mesh>
        <mesh position={[1.8, 0.8, 0]} rotation={[0, 0, Math.PI / 5]} castShadow>
          <boxGeometry args={[1.2, 3, 1.2]} />
          <meshStandardMaterial color="#3d4a3a" roughness={1} />
        </mesh>
        {/* Moss accent */}
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[1.6, 0.3, 1.6]} />
          <meshStandardMaterial color="#1e3a1e" roughness={1} />
        </mesh>
      </group>
    )
  }

  if (type === 'bamboo') {
    return (
      <group position={[x, 0, initialZ]} rotation={rot} ref={meshRef}>
        {[-0.3, 0, 0.3].map((offset, i) => (
          <mesh key={i} position={[offset, 4 + i * 0.5, offset * 0.5]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 8 + i, 6]} />
            <meshStandardMaterial color="#558b2f" roughness={0.6} />
          </mesh>
        ))}
      </group>
    )
  }

  return null
}

function SceneryLayer({ playerRef }) {
  const items = useMemo(() => {
    const types = ['tree', 'tree', 'tree', 'palm', 'rock', 'ruin', 'bamboo']
    return Array.from({ length: 100 }).map((_, i) => {
      const type = types[Math.floor(Math.random() * types.length)]
      const side = Math.random() > 0.5 ? 1 : -1
      // Keep scenery well outside the 3-lane track (lanes at x=-2.5,0,2.5)
      const x = side * (5.5 + Math.random() * 8)
      const rot = [0, Math.random() * Math.PI * 2, 0]
      return {
        id: i,
        type,
        x,
        initialZ: -(i * 4.2) - Math.random() * 5,
        rot
      }
    })
  }, [])

  return (
    <group>
      {items.map(item => (
        <SceneryItem key={item.id} {...item} playerRef={playerRef} />
      ))}
    </group>
  )
}

export function Environment({ playerRef }) {
  const laneWidth = 2.5
  const trackRef = useRef()
  const followRef = useRef()

  const materials = useMemo(() => {
    if (typeof document === 'undefined') return {}
    const groundTex = createStoneTexture()
    groundTex.repeat.set(1, 150)
    const wallTex = createStoneTexture()
    wallTex.repeat.set(1, 80)
    return { ground: groundTex, wall: wallTex }
  }, [])

  useFrame(() => {
    if (playerRef?.current) {
      const pZ = playerRef.current.getPosition()?.z || 0
      // Tile the track chunk to follow just behind the player
      if (trackRef.current) trackRef.current.position.z = Math.floor(pZ / 100) * 100 - 300
      if (followRef.current) followRef.current.position.z = pZ
    }
  })

  return (
    <group>
      <DreiEnvironment preset="forest" />

      {/* Fireflies that follow the player */}
      <group ref={followRef}>
        <group position={[0, 3, -15]}>
          {Array.from({ length: 25 }).map((_, i) => (
            <mesh
              key={`ff-${i}`}
              position={[
                (Math.random() - 0.5) * 30,
                Math.random() * 10 + 1,
                (Math.random() - 0.5) * 50
              ]}
            >
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshBasicMaterial
                color={Math.random() > 0.5 ? '#baff66' : '#ffe066'}
                transparent
                opacity={0.5 + Math.random() * 0.5}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Infinite scenery trees / rocks / ruins on both sides */}
      <SceneryLayer playerRef={playerRef} />

      <group ref={trackRef}>
        {/* Three lane track tiles */}
        {[-laneWidth, 0, laneWidth].map((xOffset, i) => (
          <mesh key={`lane-${i}`} position={[xOffset, -0.25, 0]} receiveShadow>
            <boxGeometry args={[2.3, 0.5, 1000]} />
            <meshStandardMaterial
              map={materials.ground}
              bumpMap={materials.ground}
              bumpScale={0.04}
              roughness={0.85}
              color="#6b5b4e"
            />
          </mesh>
        ))}

        {/* Lane dividers — thin raised strips between lanes */}
        {[-laneWidth / 2, laneWidth / 2].map((xOffset, i) => (
          <mesh key={`divider-${i}`} position={[xOffset, -0.01, 0]}>
            <boxGeometry args={[0.12, 0.06, 1000]} />
            <meshStandardMaterial color="#3a3028" roughness={1} />
          </mesh>
        ))}

        {/* Abyss water below */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 1000]} />
          <meshStandardMaterial color="#041510" roughness={0.05} metalness={0.9} />
        </mesh>

        {/* Boundary jungle walls */}
        <mesh position={[-15, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 12, 1000]} />
          <meshStandardMaterial map={materials.wall} color="#162613" roughness={1} />
        </mesh>
        <mesh position={[15, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 12, 1000]} />
          <meshStandardMaterial map={materials.wall} color="#162613" roughness={1} />
        </mesh>

        {/* Overhanging vines */}
        <mesh position={[-13, 9, 0]}>
          <boxGeometry args={[0.4, 0.12, 1000]} />
          <meshStandardMaterial color="#0c1a0c" roughness={1} />
        </mesh>
        <mesh position={[13, 8.5, 0]}>
          <boxGeometry args={[0.5, 0.15, 1000]} />
          <meshStandardMaterial color="#0c1a0c" roughness={1} />
        </mesh>
      </group>
    </group>
  )
}

export default Environment
