/**
 * X Layer World Cup Fantasy - TypeScript System Types
 */

export type Position = 'GK' | 'DEF' | 'MID' | 'STR';

export interface WorldCupPlayer {
  id: string;
  name: string;
  country: string;
  position: Position;
  price: number; // in simulated USDC
  rating: number; // e.g., 88
  // Live score dynamics tracker
  stats: {
    points: number;
    goals: number;
    assists: number;
    cleanSheet: boolean;
    teamWon: boolean;
    teamDrawn: boolean;
    teamLost: boolean;
  };
}

export interface WorldCupTeam {
  name: string;
  code: string; // e.g. "ARG"
  flag: string; // emoji e.g. "🇦🇷"
  group: string;
}

export interface UserProfile {
  address: string;
  username: string;
  registeredAt: number;
  balanceUSDC: number;
  lineup: string[]; // 11 player IDs
  theme?: string;
  formation?: string;
}

export type WagerPrediction = 'win' | 'draw' | 'loss';

export interface EscrowWager {
  id: string;
  creatorAddress: string;
  creatorUsername: string;
  targetAddress: string;
  targetUsername: string;
  amountUSDC: number;
  prediction: WagerPrediction; // Creator's prediction of their fantasy score relative to target (win = high, draw = equal, loss = lower)
  status: 'pending' | 'active' | 'resolved' | 'declined';
  winnerAddress?: string;
  scoreCard?: {
    creatorScore: number;
    targetScore: number;
  };
  txHashCreate: string;
  txHashAccept?: string;
  txHashSettle?: string;
  createdAt: number;
}

export interface MatchSimulationEvent {
  minute: number;
  type: 'goal' | 'assist' | 'cleanSheet' | 'card' | 'status_info';
  description: string;
  playerId: string;
  playerName: string;
  pointsAdded: number;
}

export interface LiveWorldCupMatch {
  id: string;
  teamA: WorldCupTeam;
  teamB: WorldCupTeam;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'live' | 'completed';
  minute: number;
  events: MatchSimulationEvent[];
}

// Full global participant list
export const WORLD_CUP_TEAMS: Record<string, WorldCupTeam> = {
  ARG: { name: 'Argentina', code: 'ARG', flag: '🇦🇷', group: 'Group A' },
  FRA: { name: 'France', code: 'FRA', flag: '🇫🇷', group: 'Group A' },
  BRA: { name: 'Brazil', code: 'BRA', flag: '🇧🇷', group: 'Group B' },
  ENG: { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'Group B' },
  POR: { name: 'Portugal', code: 'POR', flag: '🇵🇹', group: 'Group C' },
  ESP: { name: 'Spain', code: 'ESP', flag: '🇪🇸', group: 'Group C' },
  GER: { name: 'Germany', code: 'GER', flag: '🇩🇪', group: 'Group D' },
  NED: { name: 'Netherlands', code: 'NED', flag: '🇳🇱', group: 'Group D' }
};

export const INITIAL_PLAYERS: WorldCupPlayer[] = [
  // --- Argentina ---
  {
    id: 'arg_messi',
    name: 'Lionel Messi',
    country: 'Argentina',
    position: 'STR',
    price: 15.0,
    rating: 94,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'arg_martinez_e',
    name: 'Emiliano Martínez',
    country: 'Argentina',
    position: 'GK',
    price: 7.0,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'arg_romero',
    name: 'Cristian Romero',
    country: 'Argentina',
    position: 'DEF',
    price: 6.5,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'arg_macallister',
    name: 'Alexis Mac Allister',
    country: 'Argentina',
    position: 'MID',
    price: 9.0,
    rating: 87,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'arg_depaul',
    name: 'Rodrigo De Paul',
    country: 'Argentina',
    position: 'MID',
    price: 8.0,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'arg_lautaro',
    name: 'Lautaro Martínez',
    country: 'Argentina',
    position: 'STR',
    price: 11.5,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- France ---
  {
    id: 'fra_mbappe',
    name: 'Kylian Mbappé',
    country: 'France',
    position: 'STR',
    price: 14.5,
    rating: 93,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'fra_griezmann',
    name: 'Antoine Griezmann',
    country: 'France',
    position: 'MID',
    price: 10.0,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'fra_saliba',
    name: 'William Saliba',
    country: 'France',
    position: 'DEF',
    price: 7.0,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'fra_maignan',
    name: 'Mike Maignan',
    country: 'France',
    position: 'GK',
    price: 6.5,
    rating: 87,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'fra_tchouameni',
    name: 'Aurélien Tchouaméni',
    country: 'France',
    position: 'MID',
    price: 8.5,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- Brazil ---
  {
    id: 'bra_vinicius',
    name: 'Vinícius Júnior',
    country: 'Brazil',
    position: 'STR',
    price: 14.0,
    rating: 92,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'bra_rodrygo',
    name: 'Rodrygo Silva',
    country: 'Brazil',
    position: 'STR',
    price: 11.0,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'bra_guimaraes',
    name: 'Bruno Guimarães',
    country: 'Brazil',
    position: 'MID',
    price: 9.0,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'bra_marquinhos',
    name: 'Marquinhos',
    country: 'Brazil',
    position: 'DEF',
    price: 6.5,
    rating: 87,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'bra_alisson',
    name: 'Alisson Becker',
    country: 'Brazil',
    position: 'GK',
    price: 7.0,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- England ---
  {
    id: 'eng_kane',
    name: 'Harry Kane',
    country: 'England',
    position: 'STR',
    price: 13.0,
    rating: 91,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'eng_bellingham',
    name: 'Jude Bellingham',
    country: 'England',
    position: 'MID',
    price: 13.5,
    rating: 91,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'eng_saka',
    name: 'Bukayo Saka',
    country: 'England',
    position: 'STR',
    price: 12.0,
    rating: 90,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'eng_rice',
    name: 'Declan Rice',
    country: 'England',
    position: 'MID',
    price: 9.5,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'eng_stones',
    name: 'John Stones',
    country: 'England',
    position: 'DEF',
    price: 6.0,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'eng_pickford',
    name: 'Jordan Pickford',
    country: 'England',
    position: 'GK',
    price: 5.5,
    rating: 84,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- Portugal ---
  {
    id: 'por_ronaldo',
    name: 'Cristiano Ronaldo',
    country: 'Portugal',
    position: 'STR',
    price: 12.0,
    rating: 90,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'por_fernandes',
    name: 'Bruno Fernandes',
    country: 'Portugal',
    position: 'MID',
    price: 10.5,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'por_leao',
    name: 'Rafael Leão',
    country: 'Portugal',
    position: 'STR',
    price: 10.0,
    rating: 87,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'por_dias',
    name: 'Rúben Dias',
    country: 'Portugal',
    position: 'DEF',
    price: 7.0,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'por_costa',
    name: 'Diogo Costa',
    country: 'Portugal',
    position: 'GK',
    price: 6.0,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- Spain ---
  {
    id: 'esp_yamal',
    name: 'Lamine Yamal',
    country: 'Spain',
    position: 'STR',
    price: 12.5,
    rating: 91,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'esp_rodri',
    name: 'Rodri Cascante',
    country: 'Spain',
    position: 'MID',
    price: 13.0,
    rating: 92,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'esp_pedri',
    name: 'Pedri González',
    country: 'Spain',
    position: 'MID',
    price: 9.5,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'esp_carvajal',
    name: 'Dani Carvajal',
    country: 'Spain',
    position: 'DEF',
    price: 6.5,
    rating: 87,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'esp_simon',
    name: 'Unai Simón',
    country: 'Spain',
    position: 'GK',
    price: 6.0,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- Germany ---
  {
    id: 'ger_musiala',
    name: 'Jamal Musiala',
    country: 'Germany',
    position: 'MID',
    price: 12.0,
    rating: 90,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ger_wirtz',
    name: 'Florian Wirtz',
    country: 'Germany',
    position: 'MID',
    price: 11.5,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ger_havertz',
    name: 'Kai Havertz',
    country: 'Germany',
    position: 'STR',
    price: 9.5,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ger_rudiger',
    name: 'Antonio Rüdiger',
    country: 'Germany',
    position: 'DEF',
    price: 7.0,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ger_terstegen',
    name: 'Marc ter Stegen',
    country: 'Germany',
    position: 'GK',
    price: 6.5,
    rating: 88,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },

  // --- Netherlands ---
  {
    id: 'ned_depay',
    name: 'Memphis Depay',
    country: 'Netherlands',
    position: 'STR',
    price: 8.5,
    rating: 84,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ned_simons',
    name: 'Xavi Simons',
    country: 'Netherlands',
    position: 'MID',
    price: 10.0,
    rating: 87,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ned_vandijk',
    name: 'Virgil van Dijk',
    country: 'Netherlands',
    position: 'DEF',
    price: 7.5,
    rating: 89,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ned_verbruggen',
    name: 'Bart Verbruggen',
    country: 'Netherlands',
    position: 'GK',
    price: 5.5,
    rating: 82,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  },
  {
    id: 'ned_frimpong',
    name: 'Jeremie Frimpong',
    country: 'Netherlands',
    position: 'DEF',
    price: 7.5,
    rating: 86,
    stats: { points: 0, goals: 0, assists: 0, cleanSheet: false, teamWon: false, teamDrawn: false, teamLost: false }
  }
];

export function calculatePlayerPoints(player: WorldCupPlayer): number {
  let pts = 0;

  // 1. Team level standard (Wins +3, Draw +1, Loss 0)
  if (player.stats.teamWon) {
    pts += 3;
  } else if (player.stats.teamDrawn) {
    pts += 1;
  }

  // 2. Goal scoring rules
  // "Strikers, defenders, and midfielders all get 3 points for scoring."
  // "If your team wins and you score, you get 3 + 3 points (handled above and here)."
  if (player.stats.goals > 0) {
    pts += player.stats.goals * 3;

    // "If he's a striker and scores, +1 extra point"
    if (player.position === 'STR') {
      pts += player.stats.goals * 1;
    }
    // "If he's a midfielder and scores or assists, +3 extra points."
    // Wait, let's keep track of extra midfielder scoring/assisting bonus:
    if (player.position === 'MID') {
      pts += 3; // flat bonus for scoring/assisting
    }
  }

  // 3. Assist rules
  // "If you get an assist, +2 points"
  if (player.stats.assists > 0) {
    pts += player.stats.assists * 2;

    // Midfielder assist check also grants the +3 extra point bonus if we haven't already added it for a goal (or if it accumulates per event)
    if (player.position === 'MID' && player.stats.goals === 0) {
      pts += 3;
    }
  }

  // 4. Defender/Goalkeeper Clean Sheet rules
  // "If you're a defender and keep a clean sheet, +2 points"
  // Let's count GK as DEF/GK clean sheet eligible
  if (player.stats.cleanSheet && (player.position === 'DEF' || player.position === 'GK')) {
    pts += 2;
  }

  return pts;
}
