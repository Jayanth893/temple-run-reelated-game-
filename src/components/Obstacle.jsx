import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

// ─── Module-level texture singletons (no hooks needed) ───────────────────────
let _stoneTexture = null
let _woodTexture  = null
let _metalTexture = null

function getStoneTexture() {
  if (_stoneTexture) return _stoneTexture
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#4a4a4a'; ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40,50,40,0.6)' : 'rgba(10,10,10,0.4)'
    ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.strokeStyle = '#2d3a28'; ctx.lineWidth = 3
  for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(Math.random() * 256, Math.random() * 256); ctx.lineTo(Math.random() * 256, Math.random() * 256); ctx.stroke() }
  _stoneTexture = new THREE.CanvasTexture(canvas)
  _stoneTexture.wrapS = _stoneTexture.wrapT = THREE.RepeatWrapping
  return _stoneTexture
}

function getWoodTexture() {
  if (_woodTexture) return _woodTexture
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#3e2723'; ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = '#1b100e'; ctx.lineWidth = 2
  for (let i = 0; i < 50; i++) { ctx.beginPath(); ctx.moveTo(0, Math.random() * 256); ctx.lineTo(256, Math.random() * 256 + (Math.random() * 20 - 10)); ctx.stroke() }
  _woodTexture = new THREE.CanvasTexture(canvas)
  _woodTexture.wrapS = _woodTexture.wrapT = THREE.RepeatWrapping
  return _woodTexture
}

function getMetalTexture() {
  if (_metalTexture) return _metalTexture
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 256, 256)
  grad.addColorStop(0, '#888'); grad.addColorStop(0.5, '#ddd'); grad.addColorStop(1, '#666')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1
  for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(0, i * 8 + Math.random() * 4); ctx.lineTo(256, i * 8 + Math.random() * 4); ctx.stroke() }
  _metalTexture = new THREE.CanvasTexture(canvas)
  _metalTexture.wrapS = _metalTexture.wrapT = THREE.RepeatWrapping
  return _metalTexture
}

// ─── Warning Indicators ─────────────────────────────────────────────────────

function JumpWarning({ color = '#ff4400', yBase = 2.8 }) {
  const arrowRef = useRef()
  const ringRef  = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (arrowRef.current) { arrowRef.current.position.y = yBase + Math.sin(t * 9) * 0.25; arrowRef.current.material.opacity = 0.7 + Math.sin(t * 12) * 0.3 }
    if (ringRef.current)  { ringRef.current.material.opacity = 0.3 + Math.sin(t * 8 + 1) * 0.25; ringRef.current.scale.setScalar(1 + Math.sin(t * 6) * 0.15) }
  })
  return (
    <group>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}><ringGeometry args={[0.7, 0.9, 32]} /><meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} /></mesh>
      <mesh ref={arrowRef} position={[0, yBase, 0]}><coneGeometry args={[0.22, 0.45, 4]} /><meshBasicMaterial color={color} transparent opacity={0.9} /></mesh>
      <Billboard position={[0, yBase + 0.7, 0]}><Text fontSize={0.32} color={color} anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000" fontWeight="bold">JUMP!</Text></Billboard>
      <pointLight color={color} intensity={2} distance={5} position={[0, 1.5, 0]} />
    </group>
  )
}

function SlideWarning({ color = '#3b82f6', yBase = 0.5 }) {
  const arrowRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (arrowRef.current) { arrowRef.current.position.y = yBase + Math.sin(t * 9) * 0.15; arrowRef.current.material.opacity = 0.7 + Math.sin(t * 12) * 0.3 }
  })
  return (
    <group>
      <mesh ref={arrowRef} position={[0, yBase + 1.2, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.22, 0.45, 4]} /><meshBasicMaterial color={color} transparent opacity={0.9} /></mesh>
      <Billboard position={[0, yBase + 1.8, 0]}><Text fontSize={0.32} color={color} anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000" fontWeight="bold">SLIDE!</Text></Billboard>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}><planeGeometry args={[2.0, 1.5]} /><meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} /></mesh>
      <pointLight color={color} intensity={1.5} distance={4} position={[0, 0.5, 0]} />
    </group>
  )
}

/**
 * LaneSwitchWarning — displays pulsing arrows pointing sideways and "MOVE!" text.
 * laneX is the X world position of the obstacle lane, used to decide which direction to hint.
 */
function LaneSwitchWarning({ color = '#d946ef', laneX = 0 }) {
  const leftRef  = useRef()
  const rightRef = useRef()
  const glowRef  = useRef()

  // Determine safe sides: if obstacle is in left lane, point right; right lane → left; centre → both
  const showLeft  = laneX >= 0   // centre or right → hint left
  const showRight = laneX <= 0   // centre or left  → hint right

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 0.5 + Math.sin(t * 8) * 0.5  // 0 → 1 ping
    if (leftRef.current)  leftRef.current.position.x  = -0.8 - Math.sin(t * 8) * 0.3
    if (rightRef.current) rightRef.current.position.x =  0.8 + Math.sin(t * 8) * 0.3
    if (glowRef.current)  glowRef.current.material.opacity = 0.08 + pulse * 0.15
    if (leftRef.current)  leftRef.current.material.opacity  = 0.5 + pulse * 0.5
    if (rightRef.current) rightRef.current.material.opacity = 0.5 + pulse * 0.5
  })

  return (
    <group>
      {/* Ground warning stripe */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[2.4, 2.0]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Left arrow cone */}
      {showLeft && (
        <mesh ref={leftRef} position={[-0.8, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}

      {/* Right arrow cone */}
      {showRight && (
        <mesh ref={rightRef} position={[0.8, 1.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}

      {/* "MOVE!" label */}
      <Billboard position={[0, 3.2, 0]}>
        <Text fontSize={0.36} color={color} anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000000" fontWeight="bold">MOVE!</Text>
      </Billboard>

      <pointLight color={color} intensity={2.5} distance={6} position={[0, 1.0, 0]} />
    </group>
  )
}

// ─── Jump Obstacles ─────────────────────────────────────────────────────────

function FireLine({ position }) {
  const innerRef = useRef()
  useFrame((state) => { if (innerRef.current) innerRef.current.material.opacity = 0.75 + Math.sin(state.clock.elapsedTime * 15) * 0.25 })
  return (
    <group position={[position[0], 0, position[2]]}>
      <JumpWarning color="#ff5500" yBase={3.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><planeGeometry args={[2.4, 0.9]} /><meshBasicMaterial color="#1a0800" transparent opacity={0.95} /></mesh>
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}><planeGeometry args={[2.2, 0.55]} /><meshBasicMaterial color="#ff3300" transparent opacity={0.9} depthWrite={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><planeGeometry args={[2.6, 1.1]} /><meshBasicMaterial color="#ff7700" transparent opacity={0.25} depthWrite={false} /></mesh>
      <Sparkles count={40} scale={[2.2, 1.8, 0.3]} size={7} speed={5} opacity={0.9} color="#ffaa00" />
      <Sparkles count={20} scale={[2.2, 0.8, 0.3]} size={5} speed={8} opacity={0.6} color="#ff2200" />
      <pointLight color="#ff5500" intensity={4} distance={6} position={[0, 0.5, 0]} />
    </group>
  )
}

function BrokenPath({ position }) {
  return (
    <group position={[position[0], 0, position[2]]}>
      <JumpWarning color="#a855f7" yBase={3.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[2.4, 2.2]} /><meshBasicMaterial color="#000000" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}><planeGeometry args={[2.4, 2.2]} /><meshStandardMaterial color="#040c08" roughness={0.05} metalness={0.95} /></mesh>
      <mesh position={[-0.85, -0.22, 0.3]} rotation={[0.1, 0, 0.05]} castShadow><boxGeometry args={[0.55, 0.3, 2.4]} /><meshStandardMaterial color="#3d3023" roughness={1} /></mesh>
      <mesh position={[0.85, -0.22, 0.4]} rotation={[-0.1, 0, -0.05]} castShadow><boxGeometry args={[0.55, 0.3, 2.4]} /><meshStandardMaterial color="#3d3023" roughness={1} /></mesh>
      <Sparkles count={12} scale={[2.0, 1.0, 2.0]} size={8} speed={0.3} opacity={0.4} color="#7c3aed" />
      <pointLight color="#4400aa" intensity={1.5} distance={5} position={[0, -0.5, 0]} />
    </group>
  )
}

function EnergyBarrier({ position }) {
  const beamRef = useRef()
  const glowRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (beamRef.current) beamRef.current.material.emissiveIntensity = 2 + Math.sin(t * 20) * 1
    if (glowRef.current) glowRef.current.material.opacity = 0.2 + Math.sin(t * 14) * 0.15
  })
  return (
    <group position={[position[0], 0, position[2]]}>
      <JumpWarning color="#00ffaa" yBase={3.0} />
      <mesh position={[-1.05, 0.5, 0]} castShadow><cylinderGeometry args={[0.06, 0.08, 1.0, 8]} /><meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} /></mesh>
      <mesh position={[1.05, 0.5, 0]} castShadow><cylinderGeometry args={[0.06, 0.08, 1.0, 8]} /><meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.8} /></mesh>
      <mesh ref={beamRef} position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.1, 8]} /><meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} transparent opacity={0.95} /></mesh>
      <mesh ref={glowRef} position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 2.3, 8]} /><meshBasicMaterial color="#00ffaa" transparent opacity={0.2} depthWrite={false} /></mesh>
      <pointLight color="#00ffaa" intensity={3} distance={6} position={[0, 0.8, 0]} />
    </group>
  )
}

function FallenLog({ position }) {
  return (
    <group position={[position[0], 0.38, position[2]]}>
      <JumpWarning color="#f59e0b" yBase={2.5} />
      <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.4, 0.45, 2.1, 14]} /><meshStandardMaterial map={getWoodTexture()} roughness={1} /></mesh>
    </group>
  )
}

// ─── Slide Obstacles ─────────────────────────────────────────────────────────

function HangingLog({ position }) {
  return (
    <group position={[position[0], 0.8, position[2]]}>
      <SlideWarning color="#3b82f6" />
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.35, 2.4, 12]} /><meshStandardMaterial map={getWoodTexture()} roughness={1} /></mesh>
      <mesh position={[-1, 1, 0]}><cylinderGeometry args={[0.02, 0.02, 2, 4]} /><meshStandardMaterial color="#2d1b0d" /></mesh>
      <mesh position={[1, 1, 0]}><cylinderGeometry args={[0.02, 0.02, 2, 4]} /><meshStandardMaterial color="#2d1b0d" /></mesh>
    </group>
  )
}

function LowWall({ position }) {
  return (
    <group position={[position[0], 1.2, position[2]]}>
      <SlideWarning color="#eab308" />
      <mesh castShadow><boxGeometry args={[2.2, 1.2, 0.5]} /><meshStandardMaterial map={getStoneTexture()} color="#4b5548" roughness={1} /></mesh>
      <mesh position={[-1.05, -0.6, 0]} castShadow><boxGeometry args={[0.1, 1.2, 0.5]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
      <mesh position={[1.05, -0.6, 0]} castShadow><boxGeometry args={[0.1, 1.2, 0.5]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
    </group>
  )
}

function TreeBranch({ position }) {
  const isRight = position[0] > 0
  return (
    <group position={[position[0], 0.9, position[2]]}>
      <SlideWarning color="#22c55e" />
      <mesh rotation={[0, 0, isRight ? -0.2 : 0.2]} position={[isRight ? 0.5 : -0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.5, 8]} />
        <meshStandardMaterial map={getWoodTexture()} roughness={1} />
      </mesh>
    </group>
  )
}

function HighFireTrap({ position }) {
  const meshRef = useRef()
  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.x += delta * 2 })
  return (
    <group ref={meshRef} position={[position[0], 2.2, position[2]]}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 2.2, 16]} /><meshStandardMaterial color="#1a1a1a" roughness={0.9} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.25, 0.25, 1.8, 16]} /><meshStandardMaterial color="#ff5500" emissive="#ff2a00" emissiveIntensity={2} transparent opacity={0.9} /></mesh>
      <pointLight color="#ff4400" intensity={2} distance={5} />
      <Sparkles count={20} scale={[2.5, 0.5, 0.5]} size={8} speed={3} opacity={0.8} color="#ffaa00" />
    </group>
  )
}

// ─── Lane-Switch Obstacles ───────────────────────────────────────────────────

/**
 * LaneBlock — a full-width stone wall filling an entire lane.
 * Player MUST switch to an adjacent lane. Cannot be jumped or slid under.
 */
function LaneBlock({ position }) {
  const stone = getStoneTexture()
  const glowRef = useRef()
  useFrame((state) => {
    if (glowRef.current) glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2
  })
  return (
    <group position={[position[0], 0, position[2]]}>
      <LaneSwitchWarning color="#d946ef" laneX={position[0]} />
      {/* Main wall — full height, fills the lane */}
      <mesh ref={glowRef} castShadow receiveShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[2.3, 3.2, 0.65]} />
        <meshStandardMaterial map={stone} color="#3d2a4e" emissive="#4a0080" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
      {/* Rune carvings glow strips */}
      <mesh position={[0, 1.6, -0.34]}>
        <boxGeometry args={[2.1, 0.08, 0.02]} />
        <meshBasicMaterial color="#d946ef" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 2.2, -0.34]}>
        <boxGeometry args={[1.6, 0.08, 0.02]} />
        <meshBasicMaterial color="#d946ef" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.0, -0.34]}>
        <boxGeometry args={[1.8, 0.08, 0.02]} />
        <meshBasicMaterial color="#d946ef" transparent opacity={0.6} />
      </mesh>
      {/* Base anchor */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.3, 0.9]} />
        <meshStandardMaterial map={stone} color="#2a1a3a" roughness={1} />
      </mesh>
      <pointLight color="#cc00ff" intensity={3} distance={7} position={[0, 2, 0.5]} />
    </group>
  )
}

/**
 * SpikeTrap — floor spikes that shoot up and retract rhythmically.
 * Player must avoid the lane entirely.
 */
function SpikeTrap({ position }) {
  const groupRef = useRef()
  const spikeRefs = [useRef(), useRef(), useRef(), useRef(), useRef()]
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Spikes pulse up and down in a wave pattern
    spikeRefs.forEach((ref, i) => {
      if (!ref.current) return
      const phase = t * 6 + i * 0.8
      const height = Math.max(0, Math.sin(phase)) // 0 → 1
      ref.current.scale.y = 0.3 + height * 1.2
      ref.current.position.y = height * 0.6
      ref.current.material.emissiveIntensity = 0.5 + height * 2
    })
    if (glowRef.current) glowRef.current.material.opacity = 0.1 + Math.abs(Math.sin(t * 6)) * 0.25
  })

  // 5 spike positions spread across the lane
  const spikeXPositions = [-0.9, -0.45, 0, 0.45, 0.9]

  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]}>
      <LaneSwitchWarning color="#ef4444" laneX={position[0]} />

      {/* Ground plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[2.3, 1.8]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
      </mesh>

      {/* Pulsing ground glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[2.4, 2.0]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* Animated spikes */}
      {spikeXPositions.map((sx, i) => (
        <mesh key={i} ref={spikeRefs[i]} position={[sx, 0.3, 0]} castShadow>
          <coneGeometry args={[0.12, 0.9, 6]} />
          <meshStandardMaterial color="#cc1111" emissive="#ff0000" emissiveIntensity={0.8} metalness={0.8} roughness={0.2} map={getMetalTexture()} />
        </mesh>
      ))}

      {/* Danger light */}
      <pointLight color="#ff0000" intensity={3} distance={6} position={[0, 1, 0]} />
    </group>
  )
}

/**
 * SwingBlade — a pendulum blade that sweeps rhythmically through a lane.
 * Timing matters: wait for it to swing away, then dash through — or just switch lanes!
 */
function SwingBlade({ position }) {
  const pivotRef   = useRef()
  const glowRef    = useRef()
  const phaseOffset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    const t     = state.clock.elapsedTime + phaseOffset.current
    const angle = Math.sin(t * 2.5) * (Math.PI / 3.5)
    if (pivotRef.current) pivotRef.current.rotation.z = angle
    const speed = Math.abs(Math.cos(t * 2.5))
    // glowRef points directly to the material (ref on meshStandardMaterial)
    if (glowRef.current) glowRef.current.emissiveIntensity = 0.5 + speed * 2.5
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      <LaneSwitchWarning color="#f97316" laneX={position[0]} />

      {/* Ceiling anchor post */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
        <meshStandardMaterial map={getMetalTexture()} color="#555" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Pivot group that rotates */}
      <group ref={pivotRef} position={[0, 3.6, 0]}>
        {/* Chain / rod */}
        <mesh position={[0, -1.2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Blade */}
        <mesh position={[0, -2.5, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 0.4]} />
          <meshStandardMaterial ref={glowRef} map={getMetalTexture()} color="#cc9900" emissive="#ff6600" emissiveIntensity={1} metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Blade tip accents */}
        <mesh position={[-0.9, -2.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <coneGeometry args={[0.1, 0.35, 4]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={1.5} metalness={0.9} />
        </mesh>
        <mesh position={[0.9, -2.5, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.1, 0.35, 4]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={1.5} metalness={0.9} />
        </mesh>
      </group>

      <pointLight color="#ff8800" intensity={2.5} distance={6} position={[0, 2, 0]} />
    </group>
  )
}

/**
 * RollingBoulder — an improved rolling boulder that moves across lanes.
 * Has a glowing trail and proper warning.
 */
function RollingBoulder({ position, velocity }) {
  const meshRef  = useRef()
  const trailRef = useRef()
  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x -= delta * 7
    meshRef.current.rotation.z -= delta * (velocity * 2)
    if (velocity !== 0) meshRef.current.position.x += velocity * delta
    if (trailRef.current) {
      trailRef.current.position.x = meshRef.current.position.x - velocity * 0.05
    }
  })
  return (
    <group>
      <LaneSwitchWarning color="#f97316" laneX={position[0]} />
      <group ref={meshRef} position={[position[0], 0.9, position[2]]}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial map={getStoneTexture()} color="#4b5548" roughness={1} />
        </mesh>
        {/* Glowing crack lines */}
        <mesh>
          <dodecahedronGeometry args={[0.92, 0]} />
          <meshBasicMaterial color="#ff8800" wireframe transparent opacity={0.15} />
        </mesh>
      </group>
      {/* Motion trail glow */}
      <mesh ref={trailRef} position={[position[0], 0.9, position[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.1, 1.5, 8]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ─── Existing lane-switch helpers (kept for pool compatibility) ───────────────

function Barrier({ position }) {
  return (
    <group position={[position[0], 1.5, position[2]]}>
      <LaneSwitchWarning color="#d946ef" laneX={position[0]} />
      <mesh castShadow receiveShadow><boxGeometry args={[1.5, 3, 0.6]} /><meshStandardMaterial map={getStoneTexture()} color="#5e6659" roughness={0.9} /></mesh>
    </group>
  )
}

function Rock({ position }) {
  return (
    <group position={[position[0], 0.5, position[2]]}>
      <mesh castShadow receiveShadow><dodecahedronGeometry args={[0.6]} /><meshStandardMaterial map={getStoneTexture()} color="#586354" roughness={1} /></mesh>
    </group>
  )
}

// ─── Main Obstacle Router (zero hooks — pure router) ────────────────────────

export function Obstacle({ type = 'rock', position = [0, 0, 0], velocity = 0 }) {
  switch (type) {
    // Jump
    case 'fireLine':       return <FireLine position={position} />
    case 'brokenPath':     return <BrokenPath position={position} />
    case 'energyBarrier':  return <EnergyBarrier position={position} />
    case 'low':            return <FallenLog position={position} />
    // Slide
    case 'hangingLog':     return <HangingLog position={position} />
    case 'lowWall':        return <LowWall position={position} />
    case 'treeBranch':     return <TreeBranch position={position} />
    case 'high':           return <HighFireTrap position={position} />
    // Lane-switch
    case 'laneBlock':      return <LaneBlock position={position} />
    case 'spikeTrap':      return <SpikeTrap position={position} />
    case 'swingBlade':     return <SwingBlade position={position} />
    case 'rollingBoulder': return <RollingBoulder position={position} velocity={velocity} />
    case 'barrier':        return <Barrier position={position} />
    // Default
    default:               return <Rock position={position} />
  }
}

export default Obstacle
