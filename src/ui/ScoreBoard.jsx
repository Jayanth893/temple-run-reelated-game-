export function ScoreBoard({ score = 0, distance = 0, coins = 0, highScore = 0, powerUps = {} }) {
  const formatTime = (ms) => (ms / 1000).toFixed(1)

  return (
    <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none select-none">
      <div className="flex justify-between items-start">
        
        {/* Top Corner Score - Clean minimal design */}
        <div className="flex bg-gradient-to-r from-emerald-900/90 to-stone-900/90 backdrop-blur-xl rounded-widest rounded-2xl p-4 md:p-5 shadow-2xl border border-emerald-500/30 font-sans">
          <div className="mr-6 md:mr-8">
            <span className="text-emerald-400/80 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] block mb-1">Score</span>
            <span className="text-3xl md:text-4xl text-white font-black tabular-nums tracking-tighter drop-shadow-lg">{score.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col gap-2 justify-center border-l-2 border-emerald-500/20 pl-6 pr-2">
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest w-16">Distance</span>
              <span className="text-sm md:text-base text-emerald-50 font-bold tabular-nums">{distance}m</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-500/80 text-[9px] md:text-[10px] font-black uppercase tracking-widest w-16">Coins</span>
              <span className="text-sm md:text-base text-yellow-400 font-bold tabular-nums">{coins}</span>
            </div>
          </div>
        </div>

        {/* High Score Panel */}
        <div className="bg-gradient-to-l from-emerald-900/90 to-stone-900/90 backdrop-blur-xl rounded-2xl p-4 px-6 shadow-2xl border border-emerald-500/30 text-right">
          <span className="text-emerald-400/80 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">High Score</span>
          <span className="text-2xl text-white font-black tabular-nums tracking-tighter drop-shadow-lg">{Math.max(highScore, score).toLocaleString()}</span>
        </div>
      </div>

      {/* Central Power-up Indicators */}
      <div className="mt-6 flex justify-center gap-4">
        {powerUps.magnet > 0 && (
          <div className="bg-gradient-to-b from-blue-900/80 to-stone-900/80 px-4 py-3 rounded-2xl border border-blue-500/50 flex flex-col items-center min-w-[100px] shadow-lg animate-bounce">
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Magnet</span>
            <span className="text-xl text-white font-black tabular-nums leading-none mb-2">{formatTime(powerUps.magnet)}s</span>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: `${(powerUps.magnet / 8000) * 100}%` }} />
            </div>
          </div>
        )}

        {powerUps.boost > 0 && (
          <div className="bg-gradient-to-b from-rose-900/80 to-stone-900/80 px-4 py-3 rounded-2xl border border-rose-500/50 flex flex-col items-center min-w-[100px] shadow-lg animate-bounce">
            <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest mb-1">Boost</span>
            <span className="text-xl text-white font-black tabular-nums leading-none mb-2">{formatTime(powerUps.boost)}s</span>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" style={{ width: `${(powerUps.boost / 8000) * 100}%` }} />
            </div>
          </div>
        )}

        {powerUps.shield && (
          <div className="bg-gradient-to-b from-emerald-900/80 to-stone-900/80 px-4 py-3 rounded-2xl border border-emerald-500/50 flex flex-col items-center min-w-[100px] shadow-lg">
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Shield</span>
            <div className="mt-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/30 animate-pulse">
              ACTIVE
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScoreBoard
