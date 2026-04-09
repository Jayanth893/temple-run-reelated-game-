import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import GameScene from './scenes/GameScene'
import StartScreen from './ui/StartScreen'
import GameOver from './ui/GameOver'
import ScoreBoard from './ui/ScoreBoard'
import { THEME_KEYS, SKIN_KEYS } from './utils/themes'
import { PCFShadowMap } from 'three'

const POWER_UP_DURATION = 8000 // 8 seconds
const SHADOW_CONFIG = { type: PCFShadowMap }

function App() {
  const [gameState, setGameState] = useState('start')
  const [restarts, setRestarts] = useState(0)
  const [distance, setDistance] = useState(0)
  const [coins, setCoins] = useState(0)
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('templeRunHighScore')) || 0)
  
  const [themeIdx, setThemeIdx] = useState(0)
  const [skinIdx, setSkinIdx] = useState(0)

  
  // Power-up state
  const [activePowerUps, setActivePowerUps] = useState({
    magnet: 0, // Time remaining
    shield: false, // Shield is one-time use or timed? Usually one use. 
    boost: 0
  })

  const currentTotalScore = distance + (coins * 50)

  // Timer logic for power-ups
  useEffect(() => {
    if (gameState !== 'playing') return
    
    const interval = setInterval(() => {
      setActivePowerUps(prev => ({
        ...prev,
        magnet: Math.max(0, prev.magnet - 100),
        boost: Math.max(0, prev.boost - 100)
      }))
    }, 100)

    return () => clearInterval(interval)
  }, [gameState])

  const startGame = () => {
    setDistance(0)
    setCoins(0)
    setActivePowerUps({ magnet: 0, shield: false, boost: 0 })
    setGameState('playing')
    setRestarts(r => r + 1)
  }

  const handlePowerUpCollected = (type) => {
    if (type === 'shield_break') {
      setActivePowerUps(prev => ({ ...prev, shield: false }))
    } else if (type === 'shield') {
      setActivePowerUps(prev => ({ ...prev, shield: true }))
    } else {
      setActivePowerUps(prev => ({ ...prev, [type]: POWER_UP_DURATION }))
    }
  }

  useEffect(() => {
    if (gameState === 'gameover' && currentTotalScore > highScore) {
      setHighScore(currentTotalScore)
      localStorage.setItem('templeRunHighScore', currentTotalScore.toString())
    }
  }, [gameState, currentTotalScore, highScore])

  return (
    <div className="w-screen h-screen bg-slate-900 overflow-hidden relative">
      {gameState === 'start' && (
        <StartScreen 
          onStart={startGame} 
          themeIdx={themeIdx} 
          setThemeIdx={setThemeIdx}
          skinIdx={skinIdx}
          setSkinIdx={setSkinIdx}
        />
      )}
      {gameState === 'gameover' && <GameOver score={currentTotalScore} highScore={highScore} onRestart={startGame} />}
      {gameState === 'playing' && (
        <ScoreBoard 
          score={currentTotalScore} 
          distance={distance}
          coins={coins} 
          highScore={highScore}
          powerUps={activePowerUps}
        />
      )}

      <Canvas shadows={SHADOW_CONFIG}>
        <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={60} />
        <GameScene 
          key={restarts}
          themeId={THEME_KEYS[themeIdx]}
          skinId={SKIN_KEYS[skinIdx]}
          isGameOver={gameState === 'gameover'}
          onCollision={() => setGameState('gameover')} 
          onCollectCoin={() => setCoins(c => c + 1)}
          onUpdateScore={setDistance}
          onPowerUpCollected={handlePowerUpCollected}
          activePowerUps={{
            magnet: activePowerUps.magnet > 0,
            shield: activePowerUps.shield,
            boost: activePowerUps.boost > 0
          }}
        />
      </Canvas>
    </div>
  )
}

export default App
