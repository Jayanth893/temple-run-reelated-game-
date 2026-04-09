import { useState, useEffect } from 'react'

export function useControls() {
  const [movement, setMovement] = useState({
    left: false,
    right: false,
    jump: false
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setMovement(m => ({ ...m, left: true }))
      if (e.key === 'ArrowRight' || e.key === 'd') setMovement(m => ({ ...m, right: true }))
      if (e.key === ' ' || e.key === 'w') setMovement(m => ({ ...m, jump: true }))
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setMovement(m => ({ ...m, left: false }))
      if (e.key === 'ArrowRight' || e.key === 'd') setMovement(m => ({ ...m, right: false }))
      if (e.key === ' ' || e.key === 'w') setMovement(m => ({ ...m, jump: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return movement
}

export default useControls
