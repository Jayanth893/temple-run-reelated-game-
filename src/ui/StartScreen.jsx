import { useState, useMemo } from 'react'
import { THEME_KEYS, SKIN_KEYS, ENVIRONMENTS, SKINS } from '../utils/themes'

// Pre-generate random particles once to satisfy strict linter purity rules
const PARTICLE_DATA = Array.from({ length: 20 }).map(() => ({
  width: Math.random() * 200 + 50,
  height: Math.random() * 200 + 50,
  left: Math.random() * 100 + '%',
  top: Math.random() * 100 + '%',
  duration: Math.random() * 5 + 5
}))

export function StartScreen({ onStart, themeIdx = 0, setThemeIdx, skinIdx = 0, setSkinIdx }) {
  const handleNextTheme = () => setThemeIdx(p => (p + 1) % THEME_KEYS.length)
  const handlePrevTheme = () => setThemeIdx(p => (p - 1 + THEME_KEYS.length) % THEME_KEYS.length)
  
  const handleNextSkin = () => setSkinIdx(p => (p + 1) % SKIN_KEYS.length)
  const handlePrevSkin = () => setSkinIdx(p => (p - 1 + SKIN_KEYS.length) % SKIN_KEYS.length)

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-50 backdrop-blur-md transition-all duration-700 ease-out overflow-hidden">
      {/* Modern Gradient background (Green to dark) */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-stone-900 to-black opacity-90 pointer-events-none" />
      
      {/* Floating particles background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {PARTICLE_DATA.map((data, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-emerald-400 blur-xl"
            style={{
              width: data.width,
              height: data.height,
              left: data.left,
              top: data.top,
              animation: `pulse ${data.duration}s infinite alternate`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-700 mb-2 tracking-tighter drop-shadow-2xl">
          TEMPLE RUN
        </h1>
        <div className="h-1 w-24 bg-emerald-500 rounded-full blur-[2px] mb-4 animate-pulse" />
        <p className="text-emerald-100/50 uppercase tracking-[0.5em] text-xs font-black">
          Lost Expedition Chronicles
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-6 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
        {/* Environment Selector */}
        <div className="bg-black/40 backdrop-blur-lg px-8 py-4 rounded-[1.5rem] border border-emerald-500/20 flex flex-col items-center min-w-[240px] shadow-xl transition-all hover:bg-black/50">
          <span className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Environment</span>
          <div className="flex items-center justify-between w-full">
            <button onClick={handlePrevTheme} className="text-emerald-500/50 hover:text-emerald-300 p-2 hover:scale-125 transition-transform">◀</button>
            <span className="text-emerald-50 font-black text-center tracking-widest uppercase text-sm">
              {ENVIRONMENTS[THEME_KEYS[themeIdx]]?.name}
            </span>
            <button onClick={handleNextTheme} className="text-emerald-500/50 hover:text-emerald-300 p-2 hover:scale-125 transition-transform">▶</button>
          </div>
        </div>

        {/* Skin Selector */}
        <div className="bg-black/40 backdrop-blur-lg px-8 py-4 rounded-[1.5rem] border border-emerald-500/20 flex flex-col items-center min-w-[240px] shadow-xl transition-all hover:bg-black/50">
          <span className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Character</span>
          <div className="flex items-center justify-between w-full">
            <button onClick={handlePrevSkin} className="text-emerald-500/50 hover:text-emerald-300 p-2 hover:scale-125 transition-transform">◀</button>
            <span className="text-emerald-50 font-black text-center tracking-widest uppercase text-sm">
              {SKINS[SKIN_KEYS[skinIdx]]?.name}
            </span>
            <button onClick={handleNextSkin} className="text-emerald-500/50 hover:text-emerald-300 p-2 hover:scale-125 transition-transform">▶</button>
          </div>
        </div>
      </div>

      {/* Animated Play Button */}
      <button 
        onClick={onStart}
        className="relative z-10 group px-20 py-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black uppercase tracking-[0.25em] rounded-full overflow-hidden transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 active:scale-95 shadow-[0_10px_40px_rgba(16,185,129,0.4)] text-2xl animate-in fade-in slide-in-from-bottom-10 delay-500"
      >
        <span className="relative z-10 drop-shadow-md">PLAY</span>
        {/* Shimmer Effect */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      </button>

      {/* Clean Controls Legend */}
      <div className="relative z-10 mt-16 flex gap-10 text-center text-emerald-100/50 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 px-10 py-5 rounded-full border border-white/5 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-20 delay-700">
        <div><span className="text-emerald-400">A/D</span> LANES</div>
        <div><span className="text-emerald-400">SPACE</span> JUMP</div>
        <div><span className="text-emerald-400">S</span> SLIDE</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1) translate(0, 0); opacity: 0.2; }
          100% { transform: scale(1.5) translate(20px, 20px); opacity: 0.5; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}

export default StartScreen
