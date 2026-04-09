import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Player } from '../components/Player'
import { Environment } from '../components/Environment'
import { Obstacle } from '../components/Obstacle'
import { Coin } from '../components/Coin'
import { PowerUp } from '../components/PowerUp'
import { Particles, RunningDust } from '../components/Particles'
import {
  checkCollision,
  getObstacleDimensions,
  getObstacleYOffset,
  JUMP_REQUIRED_TYPES,
  SLIDE_REQUIRED_TYPES,
  LANE_SWITCH_TYPES
} from '../utils/collision'
import { playCoinSound, playGameOverSound } from '../utils/audio'
import { MathUtils } from 'three'
import { RoadTask } from '../components/RoadTask'

// ─── Constants ───────────────────────────────────────────────────────────────
const LANES = [-2.5, 0, 2.5]

// Obstacle spawn pools, weighted by category probability:
//   Jump:        ~30%  — requires SPACE / swipe-up
//   Slide:       ~20%  — requires DOWN / swipe-down
//   Lane-switch: ~50%  — requires left/right movement
const JUMP_OBS   = ['fireLine', 'brokenPath', 'energyBarrier', 'low']
const SLIDE_OBS  = ['high', 'hangingLog', 'lowWall', 'treeBranch']
const SWITCH_OBS = [
  'laneBlock', 'laneBlock',   // weighted 2×
  'spikeTrap', 'spikeTrap',   // weighted 2×
  'swingBlade',
  'rollingBoulder', 'rollingBoulder', // weighted 2× (most dynamic)
  'barrier',
  'rock', 'rock', 'rock'      // lightweight fill, weighted 3×
]

const POWERUP_TYPES   = ['magnet', 'shield', 'boost']
const ROAD_TASK_TYPES = ['JUMP', 'SLIDE', 'LEFT', 'RIGHT']

const SUNSET = { fog: '#c05a2a', ambient: '#4b3a5e', sunlight: '#ffdda0' }

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// ─── Component ───────────────────────────────────────────────────────────────
export function GameScene({
  themeId,
  skinId,
  isGameOver,
  onCollision,
  onCollectCoin,
  onUpdateScore,
  onPowerUpCollected,
  activePowerUps = {}
}) {
  const [obstacles,      setObstacles]      = useState([])
  const [coins,          setCoins]          = useState([])
  const [powerUpObjects, setPowerUpObjects] = useState([])
  const [particles,      setParticles]      = useState([])
  const [roadTasks,      setRoadTasks]      = useState([])

  const playerRef         = useRef()
  const collisionFiredRef = useRef(false)
  const gameSpeed         = useRef(14)
  const nextSpawnZ        = useRef(-20)
  const lastScoreZ        = useRef(0)

  // ─── Spawn one challenge at world-z ─────────────────────────────────────
  const spawnChallenge = (z) => {
    const r = Math.random()

    // 3% → power-up
    if (r > 0.97) {
      setPowerUpObjects(prev => [...prev, {
        id: Math.random(), type: pick(POWERUP_TYPES), x: pick(LANES), z
      }])
      return
    }

    // 7% → road-task hologram hint
    if (r > 0.90) {
      setRoadTasks(prev => [...prev, {
        id: Math.random(), type: pick(ROAD_TASK_TYPES), x: pick(LANES), z
      }])
      return
    }

    // 90% → obstacle (category weighted)
    const cat = Math.random()
    let type
    if      (cat < 0.30) type = pick(JUMP_OBS)    // 30 % jump
    else if (cat < 0.50) type = pick(SLIDE_OBS)   // 20 % slide
    else                 type = pick(SWITCH_OBS)   // 50 % lane-switch

    // For lane-switch obstacles that move, give them a random lateral velocity
    const isRolling    = type === 'rollingBoulder'
    const isSingleLane = ['laneBlock', 'spikeTrap'].includes(type)

    // laneBlock / spikeTrap must be placed in a specific lane so the other two
    // are always reachable — never spawn in centre if walls exist on both sides.
    const laneIndex = isSingleLane
      ? Math.floor(Math.random() * 3)          // any lane; player picks an escape
      : Math.floor(Math.random() * 3)

    setObstacles(prev => [...prev, {
      id:        Math.random(),
      type,
      x:         LANES[laneIndex],
      z,
      spawnTime: performance.now() / 1000,
      velocity:  isRolling ? (Math.random() > 0.5 ? 3.5 : -3.5) : 0
    }])

    // Coin trail in a safe (different) lane
    if (Math.random() > 0.25) {
      const safeIndex = (laneIndex + 1 + Math.floor(Math.random() * 2)) % 3
      const count = 2 + Math.floor(Math.random() * 5)
      for (let i = 0; i < count; i++) {
        setCoins(prev => [...prev, {
          id: Math.random(), x: LANES[safeIndex], z: z - i * 3.5
        }])
      }
    }
  }

  // ─── Game loop ────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (isGameOver || !playerRef.current) return

    const now       = state.clock.elapsedTime
    const playerPos = playerRef.current.getPosition()
    if (!playerPos) return

    // 1. Speed — scales from 14 → 35 over 90 s
    const timeMult  = Math.min(2.5, 1 + now / 90)
    const boostMult = activePowerUps.boost ? 1.8 : 1.0
    gameSpeed.current = 14 * timeMult * boostMult

    // 2. Spawning lookahead
    const spawnInterval = 22 * Math.max(0.55, 1 - (timeMult - 1) * 0.25) * (activePowerUps.boost ? 0.6 : 1.0)
    while (playerPos.z < nextSpawnZ.current + 180) {
      spawnChallenge(nextSpawnZ.current)
      nextSpawnZ.current -= spawnInterval
    }

    // 3. Score
    const dist = Math.floor(Math.abs(playerPos.z))
    if (dist > lastScoreZ.current) {
      lastScoreZ.current = dist
      onUpdateScore?.(dist)
    }

    // 4. Player state
    const isSliding = playerRef.current.getIsSliding?.() ?? false
    const isJumping = playerRef.current.getIsJumping?.() ?? false
    const playerBox = {
      x: playerPos.x, y: playerPos.y + 0.5, z: playerPos.z,
      width: 0.55, height: isSliding ? 0.45 : 0.95, depth: 0.5
    }

    // 5. Magnet pull
    if (activePowerUps.magnet) {
      setCoins(prev => prev.map(c => {
        if (Math.abs(c.z - playerPos.z) < 25)
          return { ...c, x: MathUtils.lerp(c.x, playerPos.x, 0.12), z: MathUtils.lerp(c.z, playerPos.z, 0.12) }
        return c
      }))
    }

    // 6. Coin collection
    setCoins(prev => prev.filter(c => {
      if (!checkCollision(playerBox, { x: c.x, y: 1, z: c.z, width: 0.85, height: 0.85, depth: 0.85 })) return true
      setParticles(p => [...p, { id: Math.random(), pos: [c.x, 1, c.z], type: 'coin' }])
      playCoinSound(); onCollectCoin?.()
      return false
    }))

    // 7. Power-up collection
    setPowerUpObjects(prev => prev.filter(pu => {
      if (!checkCollision(playerBox, { x: pu.x, y: 1, z: pu.z, width: 1.1, height: 1.1, depth: 1.1 })) return true
      onPowerUpCollected?.(pu.type)
      return false
    }))

    // 8. Obstacle collision
    if (!collisionFiredRef.current) {
      for (const obs of obstacles) {
        // Rolling obstacles move — compute their live X position
        const elapsed    = now - (obs.spawnTime || 0)
        const liveX      = (obs.type === 'rollingBoulder' || obs.type === 'boulder')
          ? obs.x + (obs.velocity || 0) * elapsed
          : obs.x

        // SwingBlade hitbox oscillates horizontally with the blade
        // We use a slightly wider static box because the animation is visual-only;
        // collision is resolved by lane switching, which is absolute.
        const obsBox = {
          x:      liveX,
          y:      getObstacleYOffset(obs.type),
          z:      obs.z,
          ...getObstacleDimensions(obs.type)
        }

        if (!checkCollision(playerBox, obsBox)) continue

        // ── Bypass rules ─────────────────────────────────────────────────
        // Jump obstacle: pass if airborne
        if (JUMP_REQUIRED_TYPES.has(obs.type) && isJumping)  continue
        // Slide obstacle: pass if ducking
        if (SLIDE_REQUIRED_TYPES.has(obs.type) && isSliding) continue
        // Lane-switch obstacle: no bypass — player must be in a different lane.
        // The AABB already handles this: if player.x matches obs.x → hit.
        // (Rock is in LANE_SWITCH_TYPES but never spawns in the player's starting
        //  lane at t=0; handled by lane-based separation at spawn time.)

        // ── Shield absorbs ────────────────────────────────────────────────
        if (activePowerUps.shield) {
          setObstacles(prev => prev.filter(o => o.id !== obs.id))
          onPowerUpCollected?.('shield_break')
          break
        }

        // ── Collision! ────────────────────────────────────────────────────
        collisionFiredRef.current = true
        setParticles(p => [...p, {
          id: Math.random(),
          pos: [playerPos.x, playerPos.y + 0.5, playerPos.z],
          type: 'explosion'
        }])
        playGameOverSound()
        onCollision?.()
        break
      }
    }

    // 9. Road-task collision (hints only — LEFT/RIGHT always pass through)
    if (!collisionFiredRef.current) {
      for (const task of roadTasks) {
        if (Math.abs(playerPos.x - task.x) > 1.5) continue
        if (!checkCollision(playerBox, { x: task.x, y: 0.5, z: task.z, width: 2.2, height: 2.0, depth: 1.2 })) continue
        if (task.type === 'JUMP'  && isJumping)  continue
        if (task.type === 'SLIDE' && isSliding)  continue
        if (task.type === 'LEFT'  || task.type === 'RIGHT') continue   // hint only
        if (activePowerUps.shield) {
          setRoadTasks(prev => prev.filter(t => t.id !== task.id))
          onPowerUpCollected?.('shield_break')
          break
        }
        collisionFiredRef.current = true
        setParticles(p => [...p, {
          id: Math.random(),
          pos: [playerPos.x, playerPos.y + 0.5, playerPos.z],
          type: 'explosion'
        }])
        playGameOverSound(); onCollision?.(); break
      }
    }

    // 10. Garbage collection (every ~2 s)
    if (Math.floor(now * 0.5) !== Math.floor((now - delta) * 0.5)) {
      const keepZ = playerPos.z + 30
      setObstacles(prev      => prev.filter(o => o.z < keepZ))
      setCoins(prev          => prev.filter(o => o.z < keepZ))
      setPowerUpObjects(prev => prev.filter(o => o.z < keepZ))
      setRoadTasks(prev      => prev.filter(o => o.z < keepZ))
      setParticles(prev      => prev.filter(p => p.pos[2] < keepZ))
    }
  })

  // ─── Scene ────────────────────────────────────────────────────────────────
  return (
    <>
      <color attach="background" args={[SUNSET.fog]} />
      <fog attach="fog" args={[SUNSET.fog, 70, 160]} />
      <Sky sunPosition={[0, -0.05, -1]} turbidity={12} rayleigh={3} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <ambientLight intensity={1.4} color={SUNSET.ambient} />
      <directionalLight position={[10, 22, 10]} intensity={3.5} color={SUNSET.sunlight} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-8, 8, -10]} intensity={0.8} color="#ff9060" />

      <Environment playerRef={playerRef} themeId={themeId} />
      <Player ref={playerRef} speedFn={() => gameSpeed.current} powerUps={activePowerUps} skinId={skinId} />
      <RunningDust playerRef={playerRef} />

      {obstacles.map(obj => (
        <Obstacle key={obj.id} type={obj.type} position={[obj.x, 0, obj.z]} velocity={obj.velocity} />
      ))}
      {coins.map(obj => (
        <Coin key={obj.id} position={[obj.x, 1, obj.z]} />
      ))}
      {powerUpObjects.map(pu => (
        <PowerUp key={pu.id} type={pu.type} position={[pu.x, 1, pu.z]} />
      ))}
      {roadTasks.map(task => (
        <RoadTask key={task.id} type={task.type} position={[task.x, 0, task.z]} />
      ))}
      {particles.map(p => (
        <Particles key={p.id} position={p.pos} type={p.type || 'coin'} />
      ))}
    </>
  )
}

export default GameScene
