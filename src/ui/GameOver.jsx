export function GameOver({ score, highScore, onRestart }) {
  const isNewRecord = score >= highScore && score > 0

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-[100] transition-all duration-500 animate-in fade-in zoom-in">
      
      {/* Clean Minimal Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-emerald-900 to-stone-950 border border-emerald-500/30 shadow-[0_20px_60px_rgba(16,185,129,0.2)] p-10 flex flex-col items-center transform transition-all hover:scale-[1.02]">
        
        {/* Subtle top highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full opacity-50" />

        <h2 className="text-emerald-500/80 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Run Terminated</h2>
        <h1 className="text-5xl font-black text-white mb-10 tracking-tighter drop-shadow-xl text-center leading-none">
          GAME OVER
        </h1>
        
        <div className="w-full space-y-3 mb-10">
          {/* Highlighted Score Box */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-t from-emerald-950/50 to-emerald-900/50 pt-6 pb-4 rounded-2xl border border-emerald-500/20 shadow-inner relative overflow-hidden">
            {isNewRecord && (
              <div className="absolute top-0 w-full bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest text-center py-1">
                New Record
              </div>
            )}
            <span className="text-emerald-400/80 font-bold uppercase text-[10px] tracking-widest mb-1 mt-2">Final Score</span>
            <span className="text-5xl text-white font-black tabular-nums drop-shadow-md">{score.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center bg-black/40 px-5 py-4 rounded-xl border border-white/5">
            <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">High Score</span>
            <span className="text-xl text-white/80 font-black tabular-nums">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Animated Rounded Restart Button */}
        <button 
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-lg uppercase tracking-[0.2em] rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)] relative group overflow-hidden"
        >
          <span className="relative z-10">PLAY AGAIN</span>
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}

export default GameOver
