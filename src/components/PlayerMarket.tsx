import { useState, useEffect } from 'react';
import { Search, Trophy, Coins, Plus, Trash2, ArrowRight } from 'lucide-react';
import { WorldCupPlayer, Position } from '../types';
import { FORMATIONS_CONFIG } from './PitchLayout';

interface PlayerMarketProps {
  players: WorldCupPlayer[];
  selectedPlayerIds: string[];
  onTogglePlayer: (playerId: string) => void;
  maxSquadSize?: number;
  formation: string;
}

export default function PlayerMarket({
  players,
  selectedPlayerIds,
  onTogglePlayer,
  maxSquadSize = 11,
  formation,
}: PlayerMarketProps) {
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [warningMessage, setWarningMessage] = useState('');

  // Clear warning after 4 seconds automatically
  useEffect(() => {
    if (warningMessage) {
      const t = setTimeout(() => setWarningMessage(''), 4500);
      return () => clearTimeout(t);
    }
  }, [warningMessage]);

  // Find unique countries
  const countries = Array.from(new Set(players.map((p) => p.country)));

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = selectedPosition === 'ALL' || player.position === selectedPosition;
    const matchesCountry = selectedCountry === 'ALL' || player.country === selectedCountry;
    return matchesSearch && matchesPosition && matchesCountry;
  });

  // Calculate current counts per position
  const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
  const countGk = selectedPlayers.filter(p => p.position === 'GK').length;
  const countDef = selectedPlayers.filter(p => p.position === 'DEF').length;
  const countMid = selectedPlayers.filter(p => p.position === 'MID').length;
  const countStr = selectedPlayers.filter(p => p.position === 'STR').length;

  const formationLimit = FORMATIONS_CONFIG[formation] || { def: 4, mid: 4, str: 2 };
  
  const getPositionLimit = (pos: Position) => {
    if (pos === 'GK') return 1;
    if (pos === 'DEF') return formationLimit.def;
    if (pos === 'MID') return formationLimit.mid;
    if (pos === 'STR') return formationLimit.str;
    return 0;
  };

  const getPositionCount = (pos: Position) => {
    if (pos === 'GK') return countGk;
    if (pos === 'DEF') return countDef;
    if (pos === 'MID') return countMid;
    if (pos === 'STR') return countStr;
    return 0;
  };

  const handleRecruitClick = (player: WorldCupPlayer) => {
    const isSelected = selectedPlayerIds.includes(player.id);
    if (isSelected) {
      // Always allowed to remove
      onTogglePlayer(player.id);
      setWarningMessage('');
      return;
    }

    // Squad full checks
    if (selectedPlayerIds.length >= maxSquadSize) {
      setWarningMessage(`Your team already has a full lineup of ${maxSquadSize} players! Click a player on the soccer field to release one first.`);
      return;
    }

    // Formation role checks
    const limit = getPositionLimit(player.position);
    const currentCount = getPositionCount(player.position);

    if (currentCount >= limit) {
      const positionLabel = player.position === 'GK' ? 'Goalkeeper' : player.position === 'DEF' ? 'Defender' : player.position === 'MID' ? 'Midfielder' : 'Striker';
      setWarningMessage(`Under your chosen ${formation} formation, you can only pick ${limit} ${positionLabel}s. To recruit this player, swap out one of your current ${positionLabel}s on the field first!`);
      return;
    }

    // Success! Toggle
    onTogglePlayer(player.id);
    setWarningMessage('');
  };

  return (
    <div id="player-market-section" className="glass-card p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-base font-display font-medium text-white flex items-center gap-2 uppercase tracking-wide">
            <Trophy className="text-xaccent w-5 h-5 animate-pulse" />
            World Cup Star Market
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build your team by picking players below. Scoring updates automatically on matchday!
          </p>
        </div>
        <div className="bg-[#05070A]/85 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
          Selected Star Count: <span className="text-xaccent font-extrabold">{selectedPlayerIds.length}</span> / {maxSquadSize}
        </div>
      </div>

      {/* Recruited Categories Dashboard Mini-Bar (Super intuitive!) */}
      <div className="bg-black/45 border border-white/5 p-2 rounded-lg grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
        <div>
          <span className="text-slate-500 block">GK Slot</span>
          <span className={`font-bold ${countGk === 1 ? 'text-xaccent' : 'text-slate-300'}`}>
            {countGk} / 1
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Defenders</span>
          <span className={`font-bold ${countDef === formationLimit.def ? 'text-xaccent' : 'text-slate-300'}`}>
            {countDef} / {formationLimit.def}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Midfielders</span>
          <span className={`font-bold ${countMid === formationLimit.mid ? 'text-xaccent' : 'text-slate-300'}`}>
            {countMid} / {formationLimit.mid}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Strikers</span>
          <span className={`font-bold ${countStr === formationLimit.str ? 'text-xaccent' : 'text-slate-300'}`}>
            {countStr} / {formationLimit.str}
          </span>
        </div>
      </div>

      {/* Temporary warning/alert styled beautifully */}
      {warningMessage && (
        <div className="bg-amber-950/20 border border-amber-900/60 p-2.5 rounded text-xs text-amber-350 animate-bounce flex items-start gap-1.5 leading-snug">
          <span className="text-sm">💡</span>
          <div>
            <p className="font-bold uppercase tracking-wider text-[10px]">Substitution Draft Warning</p>
            <p className="text-[11px] mt-0.5">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            id="player-search-input"
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-[#05070A]/80 border border-white/10 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-xaccent"
            placeholder="Find active players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            id="position-filter"
            className="w-full px-3 py-2 bg-[#05070A]/80 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-xaccent cursor-pointer"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value as Position | 'ALL')}
          >
            <option value="ALL">All Positions</option>
            <option value="GK">Goalkeepers (GK)</option>
            <option value="DEF">Defenders (DEF)</option>
            <option value="MID">Midfielders (MID)</option>
            <option value="STR">Strikers (STR)</option>
          </select>
        </div>

        <div>
          <select
            id="country-filter"
            className="w-full px-3 py-2 bg-[#05070A]/80 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-xaccent cursor-pointer"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="ALL">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players grid */}
      <div className="max-h-[460px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 font-mono border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
            No players matching your filter. Try changing your filters!
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id);

            return (
              <div
                id={`player-card-${player.id}`}
                key={player.id}
                className={`relative border p-3 rounded-lg flex items-center justify-between transition-all duration-150 ${
                  isSelected
                    ? 'border-xaccent/40 bg-xaccent/5 shadow-md shadow-xaccent/5'
                    : 'border-white/10 hover:border-white/15 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#05070A] flex items-center justify-center text-xs font-mono font-bold border border-white/10 text-slate-300">
                      {player.position}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-bold font-mono bg-black border border-white/10 text-xaccent px-1.5 rounded-full select-none leading-none pt-0.5">
                      {player.rating}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white font-display leading-tight">{player.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">{player.country}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-0.5 font-mono">
                        <Coins className="w-3.5 h-3.5 text-xaccent" />
                        {player.price.toFixed(1)}M Coins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-toggle-player-${player.id}`}
                    type="button"
                    onClick={() => handleRecruitClick(player)}
                    className={`p-2 rounded cursor-pointer transition-all duration-150 text-xs font-bold leading-none ${
                      isSelected
                        ? 'bg-red-955/20 text-red-400 border border-red-900/45 hover:bg-red-900/30'
                        : 'bg-xaccent/10 text-xaccent border border-xaccent/30 hover:bg-xaccent/20'
                    }`}
                  >
                    {isSelected ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
