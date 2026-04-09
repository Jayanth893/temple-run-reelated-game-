const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

export function playCoinSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume()
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
  oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1) // E6 tip

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.2)
}

export function playJumpSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume()
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(150, audioCtx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1)
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
  
  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.15)
}

export function playGameOverSound() {
  if (audioCtx.state === 'suspended') audioCtx.resume()
  const oscillator = audioCtx.createOscillator()
  const oscillator2 = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  
  oscillator.type = 'sawtooth'
  oscillator2.type = 'square'
  
  oscillator.frequency.setValueAtTime(120, audioCtx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.6)
  
  oscillator2.frequency.setValueAtTime(115, audioCtx.currentTime)
  oscillator2.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 0.6)

  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8)

  oscillator.connect(gainNode)
  oscillator2.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.start()
  oscillator2.start()
  oscillator.stop(audioCtx.currentTime + 0.8)
  oscillator2.stop(audioCtx.currentTime + 0.8)
}

export default { playCoinSound, playJumpSound, playGameOverSound }
