import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Custom hook to manage the core game progression loop.
 * Centralizes speed increases, distance tracking, and object spawning logic.
 */
export function useGameLoop({ 
  playerRef,
  isGameOver,
  onSpawn, 
  onUpdateScore, 
  activePowerUps = {} 
}) {
  const BASE_SPEED = 14
  // Tighter spawn interval so lanes feel properly packed
  const INITIAL_SPAWN_INTERVAL = 22
  
  const gameSpeed = useRef(BASE_SPEED)
  const nextSpawnZ = useRef(-20)
  const lastScoreUpdateZ = useRef(0)
  const currentZRef = useRef(0)

  useFrame((state, delta) => {
    if (isGameOver) {
      gameSpeed.current = 0
      return
    }
    if (!playerRef.current) return

    // 1. Calculate Game Speed (scales 1x → 2.5x over 90 seconds)
    const timeMultiplier = Math.min(2.5, 1 + (state.clock.elapsedTime / 90))
    const boostMultiplier = activePowerUps.boost ? 1.8 : 1.0
    gameSpeed.current = BASE_SPEED * timeMultiplier * boostMultiplier

    // 2. Track Player Position
    const playerPos = playerRef.current.getPosition()
    if (!playerPos) return
    const currentZ = playerPos.z
    currentZRef.current = currentZ

    // 3. Spawning Controller — keep a generous lookahead buffer
    const spawnRateMultiplier = activePowerUps.boost ? 0.6 : 1.0
    const adjustedInterval = INITIAL_SPAWN_INTERVAL * Math.max(0.55, 1 - (timeMultiplier - 1) * 0.25) * spawnRateMultiplier

    while (currentZ < nextSpawnZ.current + 180) {
      if (onSpawn) onSpawn(nextSpawnZ.current)
      nextSpawnZ.current -= adjustedInterval
    }

    // 4. Distance / Score Processing
    const distanceScore = Math.floor(Math.abs(currentZ))
    if (distanceScore > lastScoreUpdateZ.current) {
      lastScoreUpdateZ.current = distanceScore
      if (onUpdateScore) onUpdateScore(distanceScore)
    }
  })

  return {
    getSpeed: () => gameSpeed.current,
    get currentZ() { return currentZRef.current }
  }
}

export default useGameLoop
