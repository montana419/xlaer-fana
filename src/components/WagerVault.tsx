import React, { useState } from 'react';
import { Coins, ArrowRight, ExternalLink, Sparkles, Check, Search, UserCheck, AlertCircle } from 'lucide-react';
import { EscrowWager, UserProfile, WagerPrediction } from '../types';

interface WagerVaultProps {
  currentProfile: UserProfile | null;
  allProfiles: UserProfile[];
  wagers: EscrowWager[];
  onCreateWager: (targetUsername: string, amount: number, prediction: WagerPrediction) => void;
  onAcceptWager: (wagerId: string) => void;
  onDeclineWager: (wagerId: string) => void;
}

export default function WagerVault({
  currentProfile,
  allProfiles,
  wagers,
  onCreateWager,
  onAcceptWager,
  onDeclineWager,
}: WagerVaultProps) {
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState<number>(100);
  const [prediction, setPrediction] = useState<WagerPrediction>('win');
  const [isDeployingContract, setIsDeployingContract] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Search keyword for finding active players
  const [opponentSearch, setOpponentSearch] = useState('');

  // Filter out the active user to look at available opponents
  const opponentOptions = allProfiles.filter(
    (p) => currentProfile && p.address.toLowerCase() !== currentProfile.address.toLowerCase() && p.username
  );

  // Search filter results
  const searchedOpponents = opponentSearch.trim()
    ? opponentOptions.filter((opp) =>
        opp.username.toLowerCase().includes(opponentSearch.toLowerCase())
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;
    if (!targetUsername) return;
    if (amount <= 0 || amount > currentProfile.balanceUSDC) return;

    setIsDeployingContract(true);

    // Simulate safe escrow pool set-up
    setTimeout(() => {
      onCreateWager(targetUsername, amount, prediction);
      setIsDeployingContract(false);
      setCreationSuccess(true);
      setTimeout(() => setCreationSuccess(false), 3000);
      setTargetUsername('');
      setOpponentSearch('');
    }, 1500);
  };

  const getStatusBadge = (status: EscrowWager['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-[10px] bg-yellow-950 text-yellow-500 border border-yellow-900/60 font-mono font-bold px-2 py-0.5 rounded-full uppercase">Waiting on Opponent</span>;
      case 'active':
        return <span className="text-[10px] bg-xaccent/10 text-xaccent border border-xaccent/20 font-mono font-bold px-2 py-0.5 rounded-full uppercase">Coins Locked & Live</span>;
      case 'resolved':
        return <span className="text-[10px] bg-gray-800 text-gray-400 border border-gray-75 * font-mono px-2 py-0.5 rounded-full uppercase">Finished</span>;
      case 'declined':
        return <span className="text-[10px] bg-red-955/20 text-red-400 border border-red-900/40 font-mono px-2 py-0.5 rounded-full uppercase">Declined</span>;
      default:
        return null;
    }
  };

  return (
    <div id="wager-vault-card" className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="text-xaccent w-5 h-5 animate-pulse" />
        <div>
          <h2 className="text-base font-display font-medium text-white tracking-widest uppercase">Safe Challenge Game Pools</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set up friendly matches with your simulated soccer coins. Winners are auto-calculated from live player performance!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Challenge Creator Form */}
        <div className="lg:col-span-5 bg-white/[0.01] border border-white/10 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Sparkles className="w-3.5 h-3.5 text-xaccent" /> Challenge Game Creator
          </h3>

          {!currentProfile || !currentProfile.username ? (
            <div className="text-center py-8 text-xs text-gray-500 font-mono">
              Please connect your wallet and register a nickname to start creating matchup pools!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* INTERACTIVE NICKNAME SEARCH ENGINE (Hides online users directly, only searchable) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  🔍 Search For Active Users To Challenge
                </label>
                
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <Search className="h-4.5 w-4.5 text-slate-500" />
                  </span>
                  <input
                    id="search-opponent-user"
                    type="text"
                    className="w-full pl-9 pr-3 py-2 bg-[#05070a]/80 border border-white/10 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-xaccent font-sans"
                    placeholder="Type opponent's nickname here..."
                    value={opponentSearch}
                    onChange={(e) => setOpponentSearch(e.target.value)}
                  />
                </div>

                {/* Display matches or search guideline */}
                {!opponentSearch.trim() ? (
                  <div className="bg-black/30 p-2.5 rounded border border-white/5 text-[10.5px] text-slate-400 leading-normal">
                    <span className="text-xaccent font-extrabold block mb-0.5">💡 Fan Search Guideline:</span>
                    Who is ready to wager? Try searching for preloaded opponents like <strong className="text-white hover:underline cursor-pointer" onClick={() => setOpponentSearch('strikerpro')}>strikerpro</strong>, <strong className="text-white hover:underline cursor-pointer" onClick={() => setOpponentSearch('cryptomessi')}>cryptomessi</strong>, or <strong className="text-white hover:underline cursor-pointer" onClick={() => setOpponentSearch('x_wizard')}>x_wizard</strong>.
                  </div>
                ) : (
                  <div className="bg-black/45 rounded border border-white/10 max-h-[140px] overflow-y-auto p-1.5 space-y-1">
                    {searchedOpponents.length === 0 ? (
                      <div className="text-[10.5px] text-slate-500 italic p-2 text-center">
                        No opponent matching "{opponentSearch}" is active right now.
                      </div>
                    ) : (
                      searchedOpponents.map((opp) => (
                        <div
                          key={opp.username}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 bg-[#05070a]/40 text-xs"
                        >
                          <div className="flex items-center gap-1.5 text-slate-250">
                            <span className="w-1.5 h-1.5 rounded-full bg-xgreen select-none animate-pulse"></span>
                            <span className="font-bold">@{opp.username}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetUsername(opp.username);
                              setOpponentSearch(opp.username);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors duration-100 uppercase ${
                              targetUsername === opp.username
                                ? 'bg-xaccent text-black font-black'
                                : 'bg-white/10 hover:bg-xaccent hover:text-black text-white'
                            }`}
                          >
                            {targetUsername === opp.username ? 'Selected ✓' : 'Pick'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Opponent Indicator */}
              {targetUsername && (
                <div className="bg-xaccent/5 border border-xaccent/30 p-2.5 rounded flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-xaccent" />
                    <span className="text-xs font-bold text-white">Challenging opponent: @{targetUsername}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTargetUsername('')}
                    className="text-[10px] text-red-400 hover:underline cursor-pointer leading-none"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* USDC Wager stake size */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Simulated Coins Wager Size ({currentProfile.balanceUSDC.toFixed(0)} available)
                </label>
                <div className="relative">
                  <input
                    id="wager-amount-input"
                    type="number"
                    min="5"
                    max={currentProfile.balanceUSDC}
                    required
                    className="w-full bg-[#05070a]/80 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-xaccent font-mono font-bold pr-14"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10.5px] font-mono text-slate-500 font-bold pointer-events-none uppercase">
                    Coins
                  </span>
                </div>
              </div>

              {/* Prediction selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Wager winning rule
                </label>
                <div className="bg-[#05070a]/60 border border-white/10 p-2.5 rounded-lg text-xs flex items-start gap-2.5">
                  <input
                    name="prediction-type"
                    type="radio"
                    className="mt-0.5 accent-xaccent"
                    checked={prediction === 'win'}
                    readOnly
                  />
                  <div>
                    <span className="font-bold text-white">Classic Match winner payout</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      If your cumulative team scores outscore your opponent's, you win the entire coin pool! A tie splits the coins back 50/50.
                    </p>
                  </div>
                </div>
              </div>

              {/* Send Escrow Contract Call */}
              <button
                id="btn-deploy-escrow"
                type="submit"
                disabled={isDeployingContract || !targetUsername}
                className="btn-primary w-full text-black font-extrabold text-xs py-2.5 rounded transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider border-0 cursor-pointer text-center"
              >
                {isDeployingContract ? (
                  <span className="animate-pulse">Locking in coins, setting up Match...</span>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-black" /> Lock & Setup Match ({amount} Coins)
                  </>
                )}
              </button>

              {!targetUsername && (
                <p className="text-[10px] text-amber-500 text-center select-none font-mono">
                  ⚠ Please search and select an opponent above to enable wager setups!
                </p>
              )}

              {creationSuccess && (
                <div className="text-[10.5px] font-mono bg-xaccent/10 text-xaccent border border-xaccent/20 p-2 rounded text-center">
                  ✓ Match pool successfully configured! Waiting on your opponent.
                </div>
              )}
            </form>
          )}
        </div>

        {/* Wagers List and Acceptance Box */}
        <div id="wagers-active-list" className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-405 block">
              Active Matchup Play Pools ({wagers.length})
            </h3>

            {wagers.length === 0 ? (
              <div className="border border-dashed border-white/10 p-12 text-center rounded-xl text-xs font-mono text-slate-500 bg-white/[0.01]">
                No live matches found. Set one up above using the creator form!
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {wagers.map((wager) => {
                  const isActiveUserOpponent = currentProfile && wager.targetUsername.toLowerCase() === currentProfile.username.toLowerCase();
                  const isActiveUserCreator = currentProfile && wager.creatorUsername.toLowerCase() === currentProfile.username.toLowerCase();

                  return (
                    <div
                      id={`wager-contract-${wager.id}`}
                      key={wager.id}
                      className="bg-[#05070a]/90 border border-white/10 p-3.5 rounded-xl transition-all duration-150 hover:border-xaccent/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-xaccent">@{wager.creatorUsername}</span>
                          <ArrowRight className="w-3 px-0.5 text-slate-500" />
                          <span className="text-xs font-bold text-white">@{wager.targetUsername}</span>
                        </div>
                        {getStatusBadge(wager.status)}
                      </div>

                      {/* Stake Info and Details */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-black/45 py-2 px-2.5 border border-white/5 rounded mb-3">
                        <div>
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Prize Pool Size</span>
                          <span className="text-white font-bold">{wager.amountUSDC * 2} Coins</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Game Ticket Cost</span>
                          <span className="text-xaccent font-extrabold">0.0001 Gas Coins</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-white/5">
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Winner Rule:</span>
                          <p className="text-[10px] text-slate-300 leading-snug">
                             Whoever scores higher points wins. A tie splits the prize coins back.
                          </p>
                        </div>
                      </div>

                      {/* Actions or hashes */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5 border-t border-white/5 text-[10px] font-mono">
                        <div className="flex gap-2 text-slate-500">
                          <span>Verified Receipt: {wager.txHashCreate.slice(0, 16)}...</span>
                        </div>

                        {/* Interactive actions for pending challenger */}
                        {wager.status === 'pending' && isActiveUserOpponent && (
                          <div className="flex gap-2">
                            <button
                              id={`wager-decline-${wager.id}`}
                              type="button"
                              onClick={() => onDeclineWager(wager.id)}
                              className="px-2.5 py-1 bg-red-955/20 text-red-400 border border-red-900/40 rounded hover:bg-red-900/30 font-bold cursor-pointer text-[10px]"
                            >
                              Decline Match
                            </button>
                            <button
                              id={`wager-accept-${wager.id}`}
                              type="button"
                              onClick={() => onAcceptWager(wager.id)}
                              className="px-3 py-1 bg-xaccent/10 text-xaccent border border-xaccent/30 rounded hover:bg-xaccent/25 font-black cursor-pointer flex items-center gap-1 text-[10px] uppercase tracking-wider"
                            >
                              <Check className="w-3.5 h-3.5 animate-bounce" /> Agree & Join Match
                            </button>
                          </div>
                        )}

                        {wager.status === 'pending' && isActiveUserCreator && (
                          <span className="text-slate-500 italic">Waiting for recipient to match coins</span>
                        )}

                        {wager.status === 'active' && (
                          <span className="text-xaccent animate-pulse font-bold flex items-center gap-1 font-mono uppercase tracking-widest text-[9px]">
                            ⚡ coins locked, Game live on pitch
                          </span>
                        )}

                        {wager.status === 'resolved' && wager.scoreCard && (
                          <div className="text-right w-full mt-1 border-t border-dashed border-white/5 pt-1.5 font-mono">
                            <div className="text-[11px] font-bold text-slate-300">
                              Final Scores: @{wager.creatorUsername} <span className="text-xaccent font-black">{wager.scoreCard.creatorScore} pts</span> vs @{wager.targetUsername} <span className="text-xaccent font-black">{wager.scoreCard.targetScore} pts</span>
                            </div>
                            <div className="text-[10px] text-xaccent mt-0.5 font-bold">
                              {wager.winnerAddress === 'draw' ? (
                                <span>Game Tied! Both fans received their coins back.</span>
                              ) : (
                                <span>Winner takes all coin payout dispatched successfully! ✓</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
