import { WorldCupPlayer } from '../types';
import { Shield, Users, Award, AlertCircle } from 'lucide-react';

interface PitchLayoutProps {
  selectedPlayers: WorldCupPlayer[];
  onRemovePlayer?: (playerId: string) => void;
  liveStatsSimulating?: boolean;
  formation: string;
  onChangeFormation: (formation: string) => void;
}

export const FORMATIONS_CONFIG: Record<string, { def: number; mid: number; str: number }> = {
  '4-4-2': { def: 4, mid: 4, str: 2 },
  '4-3-3': { def: 4, mid: 3, str: 3 },
  '3-5-2': { def: 3, mid: 5, str: 2 },
  '5-3-2': { def: 5, mid: 3, str: 2 }
};

export default function PitchLayout({
  selectedPlayers,
  onRemovePlayer,
  liveStatsSimulating = false,
  formation,
  onChangeFormation,
}: PitchLayoutProps) {
  // Get active limits based on chosen formation
  const activeLimits = FORMATIONS_CONFIG[formation] || { def: 4, mid: 4, str: 2 };
  
  const gks = selectedPlayers.filter((p) => p.position === 'GK');
  const defs = selectedPlayers.filter((p) => p.position === 'DEF');
  const mids = selectedPlayers.filter((p) => p.position === 'MID');
  const strs = selectedPlayers.filter((p) => p.position === 'STR');

  const maxGks = 1;
  const maxDefs = activeLimits.def;
  const maxMids = activeLimits.mid;
  const maxStrs = activeLimits.str;

  // Render a player on the soccer pitch
  const renderPlayerToken = (player: WorldCupPlayer) => {
    return (
      <div
        id={`pitch-player-${player.id}`}
        key={player.id}
        className="flex flex-col items-center group relative cursor-pointer"
        onClick={() => onRemovePlayer?.(player.id)}
      >
        <div className="relative">
          {/* Main jersey logo */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-xaccent via-[#0088FF] to-transparent p-[1.5px] flex items-center justify-center shadow-lg shadow-xaccent/10 group-hover:scale-110 group-hover:from-white group-hover:to-xaccent transition-all duration-200">
            <div className="w-full h-full bg-[#05070A] rounded-full flex flex-col items-center justify-center text-[10px] font-bold text-white font-mono uppercase">
              <span>{player.position}</span>
              <span className="text-xaccent tracking-tighter text-[9.5px] font-extrabold">{player.rating}</span>
            </div>
          </div>

          {/* Points badge */}
          <div className="absolute -top-1 -right-2 bg-gradient-to-r from-xaccent to-xblue text-black px-1.5 py-0.5 rounded-full text-[9px] font-extrabold font-mono border border-[#05070A] shadow-md">
            {player.stats.points > 0 ? `+${player.stats.points}` : '0'}
          </div>
        </div>

        {/* Name and country */}
        <div className="mt-1.5 bg-[#05070A]/90 border border-white/10 rounded px-1.5 py-0.5 max-w-[85px] truncate text-center shadow-md">
          <p className="text-[10px] font-extrabold text-white leading-none truncate">{player.name.split(' ').pop()}</p>
          <p className="text-[8px] text-slate-400 font-mono mt-0.5 leading-none">{player.country}</p>
        </div>

        {/* Live Stat tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col glass-card p-2.5 rounded shadow-xl pointer-events-none z-30 min-w-[150px] bg-[#05070A]/95">
          <p className="text-xs font-black text-white">{player.name}</p>
          <p className="text-[10px] text-xaccent font-mono">{player.position} • {player.country}</p>
          <div className="border-t border-white/10 my-1"></div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-mono text-slate-300">
            <span>Goals:</span> <span className="text-white text-right">{player.stats.goals}</span>
            <span>Assists:</span> <span className="text-white text-right">{player.stats.assists}</span>
            <span>Clean Sheet:</span> <span className={player.stats.cleanSheet ? 'text-xaccent text-right font-bold' : 'text-slate-500 text-right'}>{player.stats.cleanSheet ? 'Yes' : 'No'}</span>
            <span>Match Points:</span> <span className="text-xaccent text-right font-extrabold">{player.stats.points}</span>
          </div>
          <p className="text-[8px] text-slate-400 mt-1 italic text-center">Click player node to release</p>
        </div>
      </div>
    );
  };

  // Render slot placeholders
  const renderPlaceholder = (pos: string) => {
    return (
      <div key={`empty-${pos}-${Math.random()}`} className="flex flex-col items-center opacity-65">
        <div className="w-12 h-12 rounded-full border border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center text-slate-500">
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <span className="mt-1.5 text-[8.5px] font-mono text-slate-400 uppercase tracking-widest font-bold">{pos} Slot</span>
      </div>
    );
  };

  return (
    <div id="tactical-pitch-card" className="glass-card p-5 flex flex-col justify-between h-full min-h-[500px]">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-display font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <Shield className="text-xaccent w-4 h-4" />
              My Active Soccer Team
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click players to replace them, or choose your tactical style below!
            </p>
          </div>
          {liveStatsSimulating && (
            <span className="bg-red-955/20 border border-red-900/40 text-red-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse self-start sm:self-auto">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              MATCH SIMULATOR LIVE
            </span>
          )}
        </div>

        {/* Formation Selector Row */}
        <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-350 uppercase tracking-wider">
            Choose Formation Style:
          </span>
          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
            {Object.keys(FORMATIONS_CONFIG).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onChangeFormation(f)}
                className={`px-3 py-1 text-xs font-mono rounded font-bold cursor-pointer transition-colors duration-100 flex-1 sm:flex-initial ${
                  formation === f
                    ? 'bg-gradient-to-r from-xaccent to-xblue text-black font-extrabold shadow-sm'
                    : 'bg-[#05070a]/60 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {selectedPlayers.length === 0 && (
          <div className="bg-xaccent/5 border border-xaccent/20 rounded-lg p-3 text-xs text-xaccent flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase tracking-wide">Get Your Stars</p>
              <p className="text-slate-300 mt-0.5">Use the market checklist on the right side to draft players. Once you have exactly 11 players matching your plan, your team is ready!</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Pitch field */}
      <div className="relative flex-1 pitch-gradient border border-white/10 rounded-xl overflow-hidden shadow-inner p-4 flex flex-col justify-between gap-6 min-h-[380px] mt-4">
        {/* Pitch Lines Markings */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10"></div>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/10"></div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 border border-white/5 rounded-b-xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 border border-white/5 rounded-t-xl"></div>

        {/* 1. Attackers Zone (STR) */}
        <div className="relative z-10 flex justify-around px-8">
          {strs.slice(0, maxStrs).map(renderPlayerToken)}
          {Array.from({ length: Math.max(0, maxStrs - strs.length) }).map(() =>
            renderPlaceholder('STR')
          )}
        </div>

        {/* 2. Midfielders Zone (MID) */}
        <div className="relative z-10 flex justify-around px-2">
          {mids.slice(0, maxMids).map(renderPlayerToken)}
          {Array.from({ length: Math.max(0, maxMids - mids.length) }).map(() =>
            renderPlaceholder('MID')
          )}
        </div>

        {/* 3. Defenders Zone (DEF) */}
        <div className="relative z-10 flex justify-around px-2">
          {defs.slice(0, maxDefs).map(renderPlayerToken)}
          {Array.from({ length: Math.max(0, maxDefs - defs.length) }).map(() =>
            renderPlaceholder('DEF')
          )}
        </div>

        {/* 4. Goalkeeper Zone (GK) */}
        <div className="relative z-10 flex justify-center">
          {gks.slice(0, maxGks).map(renderPlayerToken)}
          {Array.from({ length: Math.max(0, maxGks - gks.length) }).map(() =>
            renderPlaceholder('GK')
          )}
        </div>
      </div>

      {/* Squad Summary Stats */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex gap-4">
          <div>
            My Team Skill Level:{' '}
            <span className="text-white font-bold font-mono">
              {selectedPlayers.length > 0
                ? Math.round(selectedPlayers.reduce((acc, p) => acc + p.rating, 0) / selectedPlayers.length)
                : '0'}
            </span>
          </div>
          <div>
            Team Coin Value:{' '}
            <span className="text-xaccent font-bold font-mono">
              {selectedPlayers.reduce((acc, p) => acc + p.price, 0).toFixed(1)}M Coins
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-xaccent fill-current" />
          <span>Total Matchday Play Points:</span>
          <span className="text-xaccent font-extrabold font-mono text-sm ml-1 animate-pulse">
            {selectedPlayers.reduce((acc, p) => acc + p.stats.points, 0)} pts
          </span>
        </div>
      </div>
    </div>
  );
}
