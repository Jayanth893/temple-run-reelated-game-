import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { playJumpSound } from '../utils/audio'
import { SKINS } from '../utils/themes'

const LANE_WIDTH = 2.5
const MathPI = Math.PI
const GRAVITY = 32

// Base character colours (overridden per skin)
const BASE_COLORS = {
  skin: '#f1c27d',
  pants: '#4b5320',
  boots: '#3e2723',
  hat: '#5c4033',
  pack: '#4e342e'
}

export const Player = forwardRef(({ powerUps = {}, speedFn, skinId = 'default' }, ref) => {
  const meshRef = useRef()
  const bodyGroupRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()

  const skin = SKINS[skinId] || SKINS.default
  const shirtColor = powerUps.boost ? '#f43f5e' : (skin?.color ?? '#3b82f6')
  const metalness = skin?.metalness ?? 0
  const wireframe = skin?.wireframe ?? false

  const [lane, setLane] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const forwardPos = useRef(0)
  const velocityY = useRef(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const slideTimeout = useRef(null)

  useImperativeHandle(ref, () => ({
    getPosition: () => meshRef.current?.position,
    getIsSliding: () => isSliding,
    getIsJumping: () => isJumping,
    reset: () => {
      forwardPos.current = 0
      setLane(0)
      setIsJumping(false)
      setIsSliding(false)
    }
  }))

  // ── Input: Keyboard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          setLane(p => Math.max(p - 1, -1))
          break
        case 'ArrowRight':
        case 'd':
          setLane(p => Math.min(p + 1, 1))
          break
        case ' ':
        case 'w':
        case 'ArrowUp':
          if (!isJumping && !isSliding) {
            setIsJumping(true)
            velocityY.current = 13
            playJumpSound()
          }
          break
        case 'ArrowDown':
        case 's':
          if (!isJumping && !isSliding) {
            setIsSliding(true)
            clearTimeout(slideTimeout.current)
            slideTimeout.current = setTimeout(() => setIsSliding(false), 800)
          }
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isJumping, isSliding])

  // ── Input: Touch / Swipe ─────────────────────────────────────────────────────
  useEffect(() => {
    const onTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    const onTouchEnd = (e) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) setLane(p => Math.min(p + 1, 1))
        if (dx < -30) setLane(p => Math.max(p - 1, -1))
      } else {
        if (dy < -30 && !isJumping && !isSliding) {
          setIsJumping(true)
          velocityY.current = 13
          playJumpSound()
        }
        if (dy > 30 && !isJumping && !isSliding) {
          setIsSliding(true)
          clearTimeout(slideTimeout.current)
          slideTimeout.current = setTimeout(() => setIsSliding(false), 800)
        }
      }
      touchStartX.current = null
      touchStartY.current = null
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isJumping, isSliding])

  // ── Frame update ─────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!meshRef.current || !bodyGroupRef.current) return

    const t = state.clock.getElapsedTime()
    const speed = speedFn ? speedFn() : 14

    // Forward movement
    forwardPos.current -= speed * delta
    meshRef.current.position.z = forwardPos.current

    // Lateral lerp + banking tilt
    const targetX = lane * LANE_WIDTH
    meshRef.current.position.x = MathUtils.lerp(meshRef.current.position.x, targetX, delta * 14)
    const bankAngle = (meshRef.current.position.x - targetX) * -0.12
    meshRef.current.rotation.z = MathUtils.lerp(meshRef.current.rotation.z, bankAngle, delta * 10)

    // Vertical physics
    if (isJumping) {
      velocityY.current -= GRAVITY * delta
      const newY = meshRef.current.position.y + velocityY.current * delta
      if (newY <= 0) {
        meshRef.current.position.y = 0
        meshRef.current.rotation.x = 0
        velocityY.current = 0
        setIsJumping(false)
      } else {
        meshRef.current.position.y = newY
        meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, -0.8, delta * 8)
      }
    } else {
      meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 15)
      meshRef.current.position.y = MathUtils.lerp(
        meshRef.current.position.y,
        isSliding ? -0.35 : 0,
        delta * 18
      )
    }

    // Procedural animation
    if (isSliding) {
      bodyGroupRef.current.rotation.x = MathUtils.lerp(bodyGroupRef.current.rotation.x, -MathPI / 2 + 0.4, delta * 16)
      leftArmRef.current.rotation.x  = MathUtils.lerp(leftArmRef.current.rotation.x, MathPI, delta * 16)
      rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, MathPI, delta * 16)
      leftLegRef.current.rotation.x  = MathUtils.lerp(leftLegRef.current.rotation.x, -0.2, delta * 16)
      rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, 0.2, delta * 16)
    } else if (isJumping) {
      bodyGroupRef.current.rotation.x = MathUtils.lerp(bodyGroupRef.current.rotation.x, 0.4, delta * 10)
      leftArmRef.current.rotation.x  = MathUtils.lerp(leftArmRef.current.rotation.x, -MathPI / 2, delta * 14)
      rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, -MathPI / 2, delta * 14)
      leftLegRef.current.rotation.x  = MathUtils.lerp(leftLegRef.current.rotation.x, 1.1, delta * 14)
      rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, 1.1, delta * 14)
    } else {
      // Running cycle
      bodyGroupRef.current.rotation.x = MathUtils.lerp(bodyGroupRef.current.rotation.x, -0.18, delta * 10)
      const freq = speed * 1.6
      leftArmRef.current.rotation.x  = Math.sin(t * freq) * 1.1
      rightArmRef.current.rotation.x = Math.sin(t * freq + MathPI) * 1.1
      leftLegRef.current.rotation.x  = Math.sin(t * freq + MathPI) * 1.1
      rightLegRef.current.rotation.x = Math.sin(t * freq) * 1.1
      bodyGroupRef.current.position.y = Math.abs(Math.sin(t * freq)) * 0.08
    }

    // Smooth camera follow
    const camDist = powerUps.boost ? 10 : 7
    const camHeight = 4.5
    const targetCamZ = meshRef.current.position.z + camDist
    const targetCamX = meshRef.current.position.x * 0.4
    state.camera.position.z = MathUtils.lerp(state.camera.position.z, targetCamZ, delta * 10)
    state.camera.position.x = MathUtils.lerp(state.camera.position.x, targetCamX, delta * 6)
    state.camera.position.y = MathUtils.lerp(state.camera.position.y, camHeight, delta * 6)
    state.camera.lookAt(meshRef.current.position.x * 0.6, meshRef.current.position.y + 1.2, meshRef.current.position.z - 6)
  })

  return (
    <group ref={meshRef}>
      <group ref={bodyGroupRef} position={[0, 0, 0]}>

        {/* Torso */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.3]} />
          <meshStandardMaterial color={shirtColor} metalness={metalness} wireframe={wireframe} />
        </mesh>

        {/* Backpack */}
        <mesh position={[0, 0.9, 0.2]} castShadow>
          <boxGeometry args={[0.38, 0.48, 0.22]} />
          <meshStandardMaterial color={BASE_COLORS.pack} roughness={0.8} />
        </mesh>

        {/* Head */}
        <group position={[0, 1.42, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={BASE_COLORS.skin} />
          </mesh>
          {/* Hat brim */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.05, 12]} />
            <meshStandardMaterial color={BASE_COLORS.hat} roughness={0.9} />
          </mesh>
          {/* Hat top */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.21, 0.21, 0.22, 12]} />
            <meshStandardMaterial color={BASE_COLORS.hat} roughness={0.9} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.1, 0.05, -0.21]}>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          <mesh position={[0.1, 0.05, -0.21]}>
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        </group>

        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.32, 1.15, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color={BASE_COLORS.skin} />
          </mesh>
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.18, 0.3, 0.18]} />
            <meshStandardMaterial color={shirtColor} metalness={metalness} wireframe={wireframe} />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArmRef} position={[0.32, 1.15, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color={BASE_COLORS.skin} />
          </mesh>
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.18, 0.3, 0.18]} />
            <meshStandardMaterial color={shirtColor} metalness={metalness} wireframe={wireframe} />
          </mesh>
        </group>

        {/* Left leg */}
        <group ref={leftLegRef} position={[-0.15, 0.55, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial color={BASE_COLORS.pants} />
          </mesh>
          <mesh position={[0, -0.65, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.15, 0.26]} />
            <meshStandardMaterial color={BASE_COLORS.boots} />
          </mesh>
        </group>

        {/* Right leg */}
        <group ref={rightLegRef} position={[0.15, 0.55, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial color={BASE_COLORS.pants} />
          </mesh>
          <mesh position={[0, -0.65, 0.05]} castShadow>
            <boxGeometry args={[0.2, 0.15, 0.26]} />
            <meshStandardMaterial color={BASE_COLORS.boots} />
          </mesh>
        </group>
      </group>

      {/* Shield bubble VFX */}
      {powerUps.shield && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[1.45, 18, 18]} />
          <meshStandardMaterial color="#34d399" transparent opacity={0.28} wireframe />
        </mesh>
      )}

      {/* Boost aura VFX */}
      {powerUps.boost && (
        <mesh position={[0, 0.8, 0.4]}>
          <coneGeometry args={[0.35, 1.2, 8]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={3} transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  )
})

export default Player
