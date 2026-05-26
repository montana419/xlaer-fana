import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ShieldCheck,
  Activity,
  Play,
  Clock,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

import {
  WorldCupPlayer,
  UserProfile,
  EscrowWager,
  LiveWorldCupMatch,
  MatchSimulationEvent,
  INITIAL_PLAYERS,
  WORLD_CUP_TEAMS,
  calculatePlayerPoints,
  WagerPrediction
} from './types';

import WalletConnector, { THEME_PRESETS } from './components/WalletConnector';
import PlayerMarket from './components/PlayerMarket';
import PitchLayout from './components/PitchLayout';
import WagerVault from './components/WagerVault';
import SubmissionKit from './components/SubmissionKit';

// Default pre-configured accounts
const INITIAL_PROFILES: UserProfile[] = [
  {
    address: '0x7a91B1F935EfCc344600171ffEefd00067ff3E4',
    username: 'strikerpro',
    registeredAt: Date.now() - 1000000,
    balanceUSDC: 850,
    lineup: [
      'arg_messi',
      'fra_mbappe',
      'esp_yamal',
      'ger_musiala',
      'eng_bellingham',
      'esp_rodri',
      'fra_saliba',
      'ned_vandijk',
      'arg_romero',
      'esp_carvajal',
      'arg_martinez_e'
    ],
    theme: 'cyan',
    formation: '4-4-2'
  },
  {
    address: '0x9e120b6f7fefc344600171ffEefd00067ffb998',
    username: 'x_wizard',
    registeredAt: Date.now() - 500000,
    balanceUSDC: 1200,
    lineup: [
      'por_ronaldo',
      'eng_kane',
      'por_fernandes',
      'fra_griezmann',
      'ned_simons',
      'eng_rice',
      'ger_rudiger',
      'bra_marquinhos',
      'ned_frimpong',
      'eng_stones',
      'bra_alisson'
    ],
    theme: 'emerald',
    formation: '4-4-2'
  },
  {
    address: '0xFe92A2Bfdfdd344600171ffEefd00067fec8842',
    username: 'cryptomessi',
    registeredAt: Date.now() - 200000,
    balanceUSDC: 2400,
    lineup: [
      'bra_vinicius',
      'arg_lautaro',
      'ger_wirtz',
      'arg_depaul',
      'eng_saka',
      'fra_tchouameni',
      'esp_pedri',
      'fra_maignan',
      'por_costa',
      'por_dias',
      'esp_simon'
    ],
    theme: 'sunset',
    formation: '4-4-2'
  }
];

// Initial wager to show on startup
const INITIAL_WAGER: EscrowWager = {
  id: 'wager_sample_101',
  creatorAddress: '0x9e120b6f7fefc344600171ffEefd00067ffb998',
  creatorUsername: 'x_wizard',
  targetAddress: '0x7a91B1F935EfCc344600171ffEefd00067ff3E4',
  targetUsername: 'strikerpro',
  amountUSDC: 150,
  prediction: 'win',
  status: 'pending',
  txHashCreate: '0x43ae7c9634ff1b3bc2fcd458eef8bd7fa65e94b238a2c270bcff61dae9882294',
  createdAt: Date.now() - 360000
};

export default function App() {
  // App states
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentAddress, setCurrentAddress] = useState<string>('0x7a91B1F935EfCc344600171ffEefd00067ff3E4');
  const [players, setPlayers] = useState<WorldCupPlayer[]>(INITIAL_PLAYERS);
  const [wagers, setWagers] = useState<EscrowWager[]>([INITIAL_WAGER]);
  const [activeTab, setActiveTab] = useState<'roster' | 'vaults' | 'live' | 'spec'>('roster');

  // Custom visual theme settings derived from user profiles
  const [currentThemeId, setCurrentThemeId] = useState<string>('cyan');
  const [formation, setFormation] = useState<string>('4-4-2');

  // Interactive Live Day Simulator Schedule selection state
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('group_stage_a');

  // Matchday simulation state
  const [simStatus, setSimStatus] = useState<'idle' | 'simulating' | 'completed'>('idle');
  const [simMinute, setSimMinute] = useState<number>(0);
  const [simMatches, setSimMatches] = useState<LiveWorldCupMatch[]>([]);
  const [simLogs, setSimLogs] = useState<MatchSimulationEvent[]>([]);

  // Current active profile
  const currentProfile = profiles.find((p) => p.address.toLowerCase() === currentAddress.toLowerCase()) || null;

  // Sync active theme and formation selection whenever profile switches
  useEffect(() => {
    if (currentProfile) {
      setCurrentThemeId(currentProfile.theme || 'cyan');
      setFormation(currentProfile.formation || '4-4-2');
    }
  }, [currentAddress, currentProfile]);

  // Handle address switching & connections
  const handleConnectWallet = (address: string) => {
    setCurrentAddress(address);
    // If not exists in pre-registered, we register empty profile, triggering nickname registration
    if (!profiles.some((p) => p.address.toLowerCase() === address.toLowerCase())) {
      const newProf: UserProfile = {
        address,
        username: '',
        registeredAt: Date.now(),
        balanceUSDC: 1500, // starting dry balance
        lineup: [],
        theme: 'cyan',
        formation: '4-4-2'
      };
      setProfiles((prev) => [...prev, newProf]);
    }
  };

  const handleDisconnect = () => {
    setCurrentAddress('');
  };

  const handleRegisterUsername = (username: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === currentAddress.toLowerCase()) {
          return { ...p, username };
        }
        return p;
      })
    );
  };

  const handleChangeTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === currentAddress.toLowerCase()) {
          return { ...p, theme: themeId };
        }
        return p;
      })
    );
  };

  const handleChangeFormation = (newFormation: string) => {
    setFormation(newFormation);
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === currentAddress.toLowerCase()) {
          return { ...p, formation: newFormation };
        }
        return p;
      })
    );
  };

  // Add or remove player from active lineup
  const handleTogglePlayer = (playerId: string) => {
    if (!currentProfile) return;

    const isSelected = currentProfile.lineup.includes(playerId);
    let updatedLineup = [...currentProfile.lineup];

    if (isSelected) {
      updatedLineup = updatedLineup.filter((id) => id !== playerId);
    } else {
      if (updatedLineup.length >= 11) return;
      updatedLineup.push(playerId);
    }

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === currentAddress.toLowerCase()) {
          return { ...p, lineup: updatedLineup };
        }
        return p;
      })
    );
  };

  // Create wager escrow
  const handleCreateWager = (targetUser: string, amount: number, prediction: WagerPrediction) => {
    if (!currentProfile) return;

    const targetAccount = profiles.find((p) => p.username.toLowerCase() === targetUser.toLowerCase());
    if (!targetAccount) return;

    const newWager: EscrowWager = {
      id: `wager_${Date.now()}`,
      creatorAddress: currentProfile.address,
      creatorUsername: currentProfile.username,
      targetAddress: targetAccount.address,
      targetUsername: targetAccount.username,
      amountUSDC: amount,
      prediction,
      status: 'pending',
      txHashCreate: `0x${Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      createdAt: Date.now()
    };

    setWagers((prev) => [newWager, ...prev]);

    // Subtract balance from creator
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === currentProfile.address.toLowerCase()) {
          return { ...p, balanceUSDC: p.balanceUSDC - amount };
        }
        return p;
      })
    );
  };

  // Accept inbound wager escrow
  const handleAcceptWager = (wagerId: string) => {
    const wager = wagers.find((w) => w.id === wagerId);
    if (!wager || !currentProfile) return;

    // Check balance
    if (currentProfile.balanceUSDC < wager.amountUSDC) {
      alert('Insufficient simulated Coins in active wallet to accept this challenge!');
      return;
    }

    setWagers((prev) =>
      prev.map((w) => {
        if (w.id === wagerId) {
          return {
            ...w,
            status: 'active',
            txHashAccept: `0x${Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
          };
        }
        return w;
      })
    );

    // Subtract balance from target acceptor
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === currentProfile.address.toLowerCase()) {
          return { ...p, balanceUSDC: p.balanceUSDC - wager.amountUSDC };
        }
        return p;
      })
    );
  };

  // Decline wager challenge
  const handleDeclineWager = (wagerId: string) => {
    const wager = wagers.find((w) => w.id === wagerId);
    if (!wager) return;

    setWagers((prev) =>
      prev.map((w) => {
        if (w.id === wagerId) {
          return { ...w, status: 'declined' };
        }
        return w;
      })
    );

    // Refund creator account
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.address.toLowerCase() === wager.creatorAddress.toLowerCase()) {
          return { ...p, balanceUSDC: p.balanceUSDC + wager.amountUSDC };
        }
        return p;
      })
    );
  };

  // Execute actual point computation and settle pools
  const handleSettlePendingWagers = (finalPlayers: WorldCupPlayer[]) => {
    const activeWagers = wagers.filter((w) => w.status === 'active');
    if (activeWagers.length === 0) return;

    const updatedWagers = wagers.map((w) => {
      if (w.status !== 'active') return w;

      const creatorProf = profiles.find((p) => p.address.toLowerCase() === w.creatorAddress.toLowerCase());
      const targetProf = profiles.find((p) => p.address.toLowerCase() === w.targetAddress.toLowerCase());

      if (!creatorProf || !targetProf) return w;

      const creatorScore = creatorProf.lineup.reduce((acc, pId) => {
        const found = finalPlayers.find((fp) => fp.id === pId);
        return acc + (found ? calculatePlayerPoints(found) : 0);
      }, 0);

      const targetScore = targetProf.lineup.reduce((acc, pId) => {
        const found = finalPlayers.find((fp) => fp.id === pId);
        return acc + (found ? calculatePlayerPoints(found) : 0);
      }, 0);

      const totalPot = w.amountUSDC * 2;
      let winnerAddr = '';
      let payoutCreator = 0;
      let payoutTarget = 0;

      if (creatorScore > targetScore) {
        winnerAddr = w.creatorAddress;
        payoutCreator = totalPot;
      } else if (targetScore > creatorScore) {
        winnerAddr = w.targetAddress;
        payoutTarget = totalPot;
      } else {
        // Draw splits pot
        winnerAddr = 'draw';
        payoutCreator = w.amountUSDC;
        payoutTarget = w.amountUSDC;
      }

      setProfiles((prev) =>
        prev.map((p) => {
          if (p.address.toLowerCase() === w.creatorAddress.toLowerCase()) {
            return { ...p, balanceUSDC: p.balanceUSDC + payoutCreator };
          }
          if (p.address.toLowerCase() === w.targetAddress.toLowerCase()) {
            return { ...p, balanceUSDC: p.balanceUSDC + payoutTarget };
          }
          return p;
        })
      );

      return {
        ...w,
        status: 'resolved' as const,
        winnerAddress: winnerAddr,
        scoreCard: { creatorScore, targetScore },
        txHashSettle: `0x${Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };
    });

    setWagers(updatedWagers);
  };

  // Dynamic Live Day Simulator Matches configurations
  const FIFA_SIMULATION_SCHEDULES = [
    {
      id: 'group_stage_a',
      name: 'FIFA World Cup Group Stage Matches',
      matches: [
        { id: 'm1', teamA: WORLD_CUP_TEAMS.ARG, teamB: WORLD_CUP_TEAMS.FRA, scoreA: 0, scoreB: 4, status: 'live' as const, minute: 0, events: [] },
        { id: 'm2', teamA: WORLD_CUP_TEAMS.BRA, teamB: WORLD_CUP_TEAMS.ENG, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm3', teamA: WORLD_CUP_TEAMS.POR, teamB: WORLD_CUP_TEAMS.NED, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm4', teamA: WORLD_CUP_TEAMS.ESP, teamB: WORLD_CUP_TEAMS.GER, scoreA: 4, scoreB: 0, status: 'live' as const, minute: 0, events: [] }
      ]
    },
    {
      id: 'quarter_finals',
      name: 'FIFA World Cup Quarter-Final Derbies',
      matches: [
        { id: 'm1', teamA: WORLD_CUP_TEAMS.ARG, teamB: WORLD_CUP_TEAMS.BRA, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm2', teamA: WORLD_CUP_TEAMS.FRA, teamB: WORLD_CUP_TEAMS.ENG, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm3', teamA: WORLD_CUP_TEAMS.POR, teamB: WORLD_CUP_TEAMS.ESP, scoreA: 0, scoreB: 4, status: 'live' as const, minute: 0, events: [] },
        { id: 'm4', teamA: WORLD_CUP_TEAMS.NED, teamB: WORLD_CUP_TEAMS.GER, scoreA: 0, scoreB: 1, status: 'live' as const, minute: 0, events: [] }
      ]
    },
    {
      id: 'stadium_finals',
      name: 'FIFA World Cup Grand Finale Match (Messi vs Ronaldo Live)',
      matches: [
        { id: 'm1', teamA: WORLD_CUP_TEAMS.ARG, teamB: WORLD_CUP_TEAMS.POR, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm2', teamA: WORLD_CUP_TEAMS.BRA, teamB: WORLD_CUP_TEAMS.ESP, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm3', teamA: WORLD_CUP_TEAMS.FRA, teamB: WORLD_CUP_TEAMS.GER, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] },
        { id: 'm4', teamA: WORLD_CUP_TEAMS.ENG, teamB: WORLD_CUP_TEAMS.NED, scoreA: 0, scoreB: 0, status: 'live' as const, minute: 0, events: [] }
      ]
    }
  ];

  // Simulated live matchday play scheduler
  const triggerLiveMatchdaySim = () => {
    // Reset player scores
    const resetPlayers = players.map((p) => ({
      ...p,
      stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
    }));
    setPlayers(resetPlayers);

    setSimStatus('simulating');
    setSimMinute(0);
    setSimLogs([]);

    const selectedSchedule = FIFA_SIMULATION_SCHEDULES.find(s => s.id === selectedScheduleId) || FIFA_SIMULATION_SCHEDULES[0];
    const initialMatches: LiveWorldCupMatch[] = selectedSchedule.matches.map(m => ({
      ...m,
      scoreA: 0,
      scoreB: 0,
      status: 'live' as const,
      minute: 0,
      events: []
    }));

    setSimMatches(initialMatches);
    setActiveTab('live');
  };

  // Run the clock and trigger events
  useEffect(() => {
    if (simStatus !== 'simulating') return;

    const timer = setInterval(() => {
      setSimMinute((prevMin) => {
        const nextMin = prevMin + 10;

        if (nextMin > 90) {
          clearInterval(timer);
          setSimStatus('completed');

          setPlayers((currentPlayers) => {
            const finalPlayers = currentPlayers.map((player) => {
              const updatedStats = { ...player.stats };

              if (player.country === 'Argentina' || player.country === 'England' || player.country === 'Portugal' || player.country === 'Spain') {
                updatedStats.teamWon = true;

                if (player.country !== 'Argentina' && (player.position === 'DEF' || player.position === 'GK')) {
                  updatedStats.cleanSheet = true;
                }
              } else {
                updatedStats.teamLost = true;
              }

              const finalPlayer = { ...player, stats: updatedStats };
              finalPlayer.stats.points = calculatePlayerPoints(finalPlayer);
              return finalPlayer;
            });

            handleSettlePendingWagers(finalPlayers);
            return finalPlayers;
          });

          return 90;
        }

        // Real-time Event trigger at specific ticks
        setSimMatches((currentMatches) => {
          let updatedMatches = currentMatches.map((m) => ({ ...m, minute: nextMin }));

          // 1. Min 10 Goal Event (Messi & Mac Allister)
          if (nextMin === 10) {
            updatedMatches = updatedMatches.map((m) => {
              if (m.id === 'm1') {
                const ev: MatchSimulationEvent = {
                  minute: 12,
                  type: 'goal',
                  description: '⚽ Argentina Goal! Lionel Messi scores an exquisite dipping free-kick into the top corner!',
                  playerId: 'arg_messi',
                  playerName: 'Lionel Messi',
                  pointsAdded: 4
                };
                m.events = [ev, ...m.events];
                m.scoreA = 1;

                setSimLogs((l) => [ev, ...l]);
                updatePlayerStatsInSim('arg_messi', 'goals', 1);
                updatePlayerStatsInSim('arg_macallister', 'assists', 1);
                const evAssist: MatchSimulationEvent = {
                  minute: 12,
                  type: 'assist',
                  description: '🎯 Assist credited to Alexis Mac Allister with a short lay-off.',
                  playerId: 'arg_macallister',
                  playerName: 'Alexis Mac Allister',
                  pointsAdded: 5
                };
                setSimLogs((l) => [evAssist, ...l]);
              }
              return m;
            });
          }

          // 2. Min 30 Goal Event (Mbappe)
          if (nextMin === 30) {
            updatedMatches = updatedMatches.map((m) => {
              if (m.id === 'm1' || m.id === 'm2') {
                const ev: MatchSimulationEvent = {
                  minute: 26,
                  type: 'goal',
                  description: '⚡ France Goal! Kylian Mbappé speeds past defenders and drives a low bullet past the goalkeeper!',
                  playerId: 'fra_mbappe',
                  playerName: 'Kylian Mbappé',
                  pointsAdded: 4
                };
                m.events = [ev, ...m.events];
                if (m.id === 'm1') m.scoreB = 1;
                else m.scoreA = 1;

                setSimLogs((l) => [ev, ...l]);
                updatePlayerStatsInSim('fra_mbappe', 'goals', 1);
              }
              return m;
            });
          }

          // 3. Min 40 Goal Event (Bellingham & Saka)
          if (nextMin === 40) {
            updatedMatches = updatedMatches.map((m) => {
              if (m.id === 'm2') {
                const ev: MatchSimulationEvent = {
                  minute: 38,
                  type: 'goal',
                  description: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England Goal! Jude Bellingham rises highest from Bukayo Saka\'s cross to score!',
                  playerId: 'eng_bellingham',
                  playerName: 'Jude Bellingham',
                  pointsAdded: 6
                };
                m.events = [ev, ...m.events];
                m.scoreB = 1;
                setSimLogs((l) => [ev, ...l]);
                updatePlayerStatsInSim('eng_bellingham', 'goals', 1);
                updatePlayerStatsInSim('eng_saka', 'assists', 1);
              }
              return m;
            });
          }

          // 4. Min 60 Goal Event (Ronaldo & Fernandes)
          if (nextMin === 60) {
            updatedMatches = updatedMatches.map((m) => {
              if (m.id === 'm3' || m.id === 'm1') {
                const ev: MatchSimulationEvent = {
                  minute: 54,
                  type: 'goal',
                  description: '🐐 Portugal Goal! Cristiano Ronaldo hooks a stunning clinical volley from Bruno Fernandes\' lob!',
                  playerId: 'por_ronaldo',
                  playerName: 'Cristiano Ronaldo',
                  pointsAdded: 4
                };
                m.events = [ev, ...m.events];
                if (m.id === 'm3') m.scoreA = 1;
                else m.scoreB = 1;

                setSimLogs((l) => [ev, ...l]);
                updatePlayerStatsInSim('por_ronaldo', 'goals', 1);
                updatePlayerStatsInSim('por_fernandes', 'assists', 1);
              }
              return m;
            });
          }

          // 5. Min 70 Goal Event (Yamal & Rodri)
          if (nextMin === 70) {
            updatedMatches = updatedMatches.map((m) => {
              if (m.id === 'm4' || m.id === 'm2') {
                const ev: MatchSimulationEvent = {
                  minute: 68,
                  type: 'goal',
                  description: '💎 Spain Goal! Lamine Yamal cuts inside three players and curls a classic into the top left!',
                  playerId: 'esp_yamal',
                  playerName: 'Lamine Yamal',
                  pointsAdded: 4
                };
                m.events = [ev, ...m.events];
                if (m.id === 'm4') m.scoreA = 1;
                else m.scoreB = 1;

                setSimLogs((l) => [ev, ...l]);
                updatePlayerStatsInSim('esp_yamal', 'goals', 1);
                updatePlayerStatsInSim('esp_rodri', 'assists', 1);
              }
              return m;
            });
          }

          // 6. Min 80 Goal Event (Mac Allister & Messi)
          if (nextMin === 80) {
            updatedMatches = updatedMatches.map((m) => {
              if (m.id === 'm1') {
                const ev: MatchSimulationEvent = {
                  minute: 78,
                  type: 'goal',
                  description: '🇦🇷 Argentina Goal! Mac Allister slots a clinical volley after Messi nutmegs the defense!',
                  playerId: 'arg_macallister',
                  playerName: 'Alexis Mac Allister',
                  pointsAdded: 6
                };
                m.events = [ev, ...m.events];
                m.scoreA = 2;
                setSimLogs((l) => [ev, ...l]);
                updatePlayerStatsInSim('arg_macallister', 'goals', 1);
                updatePlayerStatsInSim('arg_messi', 'assists', 1);
              }
              return m;
            });
          }

          return updatedMatches;
        });

        return nextMin;
      });
    }, 1805); // Speed simulation interval

    return () => clearInterval(timer);
  }, [simStatus]);

  // Assist dynamic scorers tracker
  const updatePlayerStatsInSim = (playerId: string, statKey: 'goals' | 'assists', amount: number) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === playerId) {
          const updatedStats = { ...player.stats, [statKey]: player.stats[statKey] + amount };
          const p = { ...player, stats: updatedStats };
          p.stats.points = calculatePlayerPoints(p);
          return p;
        }
        return player;
      })
    );
  };

  const getSelectedProfileScore = (prof: UserProfile) => {
    return prof.lineup.reduce((acc, pId) => {
      const found = players.find((p) => p.id === pId);
      return acc + (found ? found.stats.points : 0);
    }, 0);
  };

  // Dynamically resolve target styling metrics from chosen theme
  const activePreset = THEME_PRESETS.find((t) => t.id === currentThemeId) || THEME_PRESETS[0];
  const dynamicStyles = {
    '--color-xaccent': activePreset.accent,
    '--color-xblue': activePreset.blue,
  } as React.CSSProperties;

  return (
    <div
      style={dynamicStyles}
      className="min-h-screen bg-[#05070a] selection:bg-xaccent selection:text-black text-slate-200 flex flex-col transition-all duration-300"
    >
      {/* Dynamic Header */}
      <header id="main-app-header" className="border-b border-white/10 bg-[#05070A]/95 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded bg-gradient-to-tr from-xaccent to-xblue flex items-center justify-center text-black font-black text-xl shadow-lg transition-all"
              style={{ boxShadow: `0 4px 15px ${activePreset.accent}20` }}
            >
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-medium uppercase tracking-wider text-white leading-none">
                  X Layer World Cup Fantasy
                </h1>
                <span className="text-[9px] text-xaccent border border-xaccent/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                  OKX Safe Pass
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                Connect your OKX Wallet, select tactics, and challenge friends!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-white/5 px-3 py-1.5 rounded border border-white/10 text-slate-300">
            <Clock className="w-4 h-4 text-xaccent animate-pulse" />
            <span>Time: 2026-05-26 UTC</span>
          </div>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Wallet connection pass & Theme Dashboard */}
        <WalletConnector
          currentAddress={currentAddress}
          currentProfile={currentProfile}
          onConnectWallet={handleConnectWallet}
          onDisconnect={handleDisconnect}
          onRegisterUsername={handleRegisterUsername}
          allProfiles={profiles}
          onSwitchSimulatedAccount={setCurrentAddress}
          currentThemeId={currentThemeId}
          onChangeTheme={handleChangeTheme}
        />

        {/* Navigation Tabs bar */}
        <div id="navigation-tabs" className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
          <button
            id="tab-roster-selector"
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest font-display transition-all duration-150 cursor-pointer shrink-0 ${
              activeTab === 'roster'
                ? 'border-b-2 border-xaccent text-white bg-white/5 font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏟️ Squad & Tactics Layout
          </button>
          <button
            id="tab-vault-selector"
            type="button"
            onClick={() => setActiveTab('vaults')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest font-display transition-all duration-150 cursor-pointer shrink-0 ${
              activeTab === 'vaults'
                ? 'border-b-2 border-xaccent text-white bg-white/5 font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏦 Matchup Challenge Pools ({wagers.filter((w) => w.status === 'pending').length})
          </button>
          <button
            id="tab-live-selector"
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest font-display transition-all duration-150 cursor-pointer shrink-0 ${
              activeTab === 'live'
                ? 'border-b-2 border-xaccent text-white bg-white/5 font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚽ Live Matchday Play Simulator
          </button>
          <button
            id="tab-spec-selector"
            type="button"
            onClick={() => setActiveTab('spec')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest font-display transition-all duration-150 cursor-pointer shrink-0 ${
              activeTab === 'spec'
                ? 'border-b-2 border-xaccent text-white bg-white/5 font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📜 Code Setup Guide
          </button>
        </div>

        {/* Viewport Content */}
        <div id="main-viewport-content">
          {activeTab === 'roster' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tactical Pitch Section */}
              <div className="lg:col-span-6">
                <PitchLayout
                  selectedPlayers={players.filter((p) => currentProfile?.lineup.includes(p.id))}
                  onRemovePlayer={handleTogglePlayer}
                  liveStatsSimulating={simStatus === 'simulating'}
                  formation={formation}
                  onChangeFormation={handleChangeFormation}
                />
              </div>

              {/* Recruitment Market Checklist */}
              <div className="lg:col-span-6 h-full flex flex-col justify-between space-y-4">
                <PlayerMarket
                  players={players}
                  selectedPlayerIds={currentProfile ? currentProfile.lineup : []}
                  onTogglePlayer={handleTogglePlayer}
                  maxSquadSize={11}
                  formation={formation}
                />

                {/* Squad readiness validation message */}
                {currentProfile && currentProfile.lineup.length === 11 ? (
                  <div className="glass-card p-4 rounded-xl flex items-center gap-3 border-xaccent/30 bg-xaccent/5">
                    <CheckCircle2 className="w-8 h-8 text-xaccent shrink-0 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lineup Saved & Approved!</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Your custom squad of 11 world stars is locked and saved! Cumulative score index currently tracks at <strong className="text-xaccent font-mono font-bold">{getSelectedProfileScore(currentProfile)} pts</strong>. Set up a matchup challenge pool now!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tactical Squad Incomplete</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Please recruit exactly 11 players for your squad to validate your active {formation} tactics (Currently: {currentProfile ? currentProfile.lineup.length : 0} of 11 picked).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vaults' && (
            <WagerVault
              currentProfile={currentProfile}
              allProfiles={profiles}
              wagers={wagers}
              onCreateWager={handleCreateWager}
              onAcceptWager={handleAcceptWager}
              onDeclineWager={handleDeclineWager}
            />
          )}

          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Matchday Simulator Control Center */}
              <div className="glass-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-display font-medium text-white flex items-center gap-2 uppercase tracking-wide">
                      <Activity className="text-xaccent w-5 h-5" />
                      FIFA Live Matchday Play Simulator
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose which tournament round to simulate below, then start the whistle!
                    </p>

                    {/* Choose the FIFA live day simulator Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-350 uppercase tracking-wider">
                        Select Tournament Day Plan:
                      </span>
                      <select
                        id="live-simulation-day-chooser"
                        disabled={simStatus === 'simulating'}
                        className="bg-[#05070A]/90 border border-white/15 text-xs text-xaccent rounded px-2.5 py-1.5 focus:outline-none focus:border-xaccent cursor-pointer disabled:opacity-50 font-bold"
                        value={selectedScheduleId}
                        onChange={(e) => setSelectedScheduleId(e.target.value)}
                      >
                        {FIFA_SIMULATION_SCHEDULES.map((sch) => (
                          <option key={sch.id} value={sch.id}>
                            ⚽ {sch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {simStatus !== 'simulating' ? (
                    <button
                      id="btn-trigger-matchday-simulation"
                      type="button"
                      onClick={triggerLiveMatchdaySim}
                      className="btn-primary text-black font-extrabold text-xs px-5 py-2.5 rounded hover:opacity-90 transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-md uppercase tracking-wider border-0"
                    >
                      <Play className="w-4 h-4 fill-current text-black" /> Kick-off Match Simulation
                    </button>
                  ) : (
                    <span className="bg-white/5 border border-white/15 text-xaccent font-mono text-xs font-bold px-4 py-2 rounded flex items-center gap-2 animate-pulse self-start sm:self-auto">
                      <Clock className="w-4 h-4 animate-spin-slow" />
                      SIMULATOR RUNNING: {simMinute}' / 90'
                    </span>
                  )}
                </div>

                {simStatus === 'idle' && (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Select your tournament day option, then click "KICK-OFF MATCH SIMULATION" above. Live scores will update fantasy points automatically!
                    </p>
                  </div>
                )}

                {/* Scoreboards grid */}
                {(simStatus === 'simulating' || simStatus === 'completed') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {simMatches.map((m) => (
                      <div
                        id={`scoreboard-card-${m.id}`}
                        key={m.id}
                        className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
                          <span className="uppercase tracking-widest font-bold font-sans">FIFA Game Match</span>
                          {simStatus === 'simulating' ? (
                            <span className="text-xaccent animate-pulse font-extrabold">{m.minute}' LIVE</span>
                          ) : (
                            <span className="text-slate-400 font-extrabold uppercase">Finished</span>
                          )}
                        </div>

                        {/* Teams Scoreline */}
                        <div className="flex items-center justify-between my-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl">{m.teamA.flag}</span>
                            <span className="text-xs font-bold font-display text-white">{m.teamA.code}</span>
                          </div>
                          <span className="text-sm font-black font-mono text-white/90 px-2.5 py-0.5 bg-white/5 border border-white/5 rounded">
                            {m.scoreA} - {m.scoreB}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold font-display text-white">{m.teamB.code}</span>
                            <span className="text-xl">{m.teamB.flag}</span>
                          </div>
                        </div>

                        {/* Recent Event scroll */}
                        <div className="border-t border-white/10 pt-2 mt-2 h-10 overflow-y-auto">
                          {m.events.length > 0 ? (
                            <p className="text-[9.5px] font-mono text-xaccent leading-snug">
                              {m.events[0].minute}' {m.events[0].description.split('!').shift()}!
                            </p>
                          ) : (
                            <p className="text-[9.5px] font-mono text-slate-500 italic">No key events recorded</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Feed and Standings layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Event stream console */}
                <div className="lg:col-span-5 glass-card p-5 flex flex-col justify-between h-[450px]">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-xaccent" /> Live Matchday Play Log
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Matches events calculated and fed instantly to determine player fantasy performance points.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 bg-black/40 border border-white/5 p-3 rounded font-mono text-xs">
                    {simLogs.length === 0 ? (
                      <p className="text-slate-500 italic text-center py-24">Awaiting kickoff whistle...</p>
                    ) : (
                      simLogs.map((log, index) => (
                        <div
                          key={`log-${index}`}
                          className="border-b border-white/5 pb-2 flex items-start gap-2 text-[11px] leading-relaxed"
                        >
                          <span className="text-xaccent font-extrabold font-mono">[{log.minute}']</span>
                          <div>
                            <p className="text-slate-200">{log.description}</p>
                            <p className="text-[10px] text-xaccent flex items-center gap-1 mt-0.5 font-bold font-sans">
                              <span>Score updates:</span>
                              <span className="underline">@{log.playerName} ({log.pointsAdded > 0 ? `+${log.pointsAdded}` : '0'} pts added)</span>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Standings tracker */}
                <div className="lg:col-span-7 glass-card p-5 flex flex-col justify-between h-[450px]">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-xaccent" /> Live Leaderboard Standings
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Displaying live total points for each fan. Coins are safely updated upon the final match whistle.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    {profiles.map((p) => {
                      if (!p.username) return null;
                      const score = getSelectedProfileScore(p);
                      return (
                        <div key={p.address} className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-black text-xaccent uppercase text-sm shadow-inner">
                              {p.username.slice(0, 2)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white uppercase font-display leading-none">
                                @{p.username}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {p.address.slice(0, 10)}...{p.address.slice(-10)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Points</span>
                            <span className="text-sm font-mono font-black text-xaccent">{score} PTS</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {simStatus === 'completed' && (
                    <div className="mt-4 p-3 bg-xaccent/10 border border-xaccent/20 rounded text-center text-xs text-xaccent font-semibold animate-pulse">
                      🎉 Matchday concluded! All challenge coin pools have updated successfully. Settle status is details in matchup tab!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spec' && <SubmissionKit />}
        </div>
      </main>

      {/* Understated Footer */}
      <footer id="main-app-footer" className="border-t border-gray-800 bg-black/40 py-8 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            &copy; 2026 World Cup Fantasy &bull; Powered by OKX and Secured on X Layer L2.
          </p>
          <div className="flex gap-4">
            <span className="text-slate-600">Built for World Cup Sports-Fi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
