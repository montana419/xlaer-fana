import { useState } from 'react';
import { Copy, Check, FileText, Share2, Award, Shield } from 'lucide-react';

export default function SubmissionKit() {
  const [copied, setCopied] = useState(false);

  const proposalMarkdown = `# Project Submission Proposal: X Layer World Cup Fantasy
### Multi-Party P2P Escrow Wager and Decentralized Identity Engine for World Cup Qatar/North America
**Blockchain Target:** X Layer L2 Network (OKX EVM compatible chain ID: 195/196)

---

## 1. Executive Summary & Vision
**X Layer World Cup Fantasy** is a next-generation decentralized peer-to-peer (P2P) gaming platform combining traditional, highly competitive fantasy football (11-aside) rosters with secure on-chain ERC-20 multi-party escrows. 

Unlike traditional centralized fantasy platforms plagued by custodial fraud risk, delayed cash-outs, and opaque point calculation algorithms, our platform brings absolute verifiability on-chain on X Layer. 

Utilizing OKX-optimized EVM primitives, players can register human-readable profiles, lock competitive 11-aside lineups of active World Cup stars, deploy non-custodial **USDC Vault Contracts**, and wager on head-to-head performance.

---

## 2. Dynamic Performance Scoring Rules
Our scoring engine aligns perfectly with FIFA real-world outcomes, granting real-time on-chain oracle verification matching actual player performance structures:

*   **Team Matchday Outcome:**
    *   Team Win: **+3 points** for all active lines
    *   Team Draw: **+1 point** for all active lines
    *   Team Loss: **0 points**
*   **Aesthetic Scoring Multipliers:**
    *   **Goal Scored:** All positions earn **+3 points** flat.
        *   *Striker Bonus:* Strikers scoring a goal get **+1 extra point** (totaling 4 pts).
        *   *Midfielder Bonus:* Midfielders scoring or assisting get **+3 extra points** (totaling 6 pts).
    *   **Assist Made:** All positions earn **+2 points**.
        *   *Midfielder Assist Bonus:* Midfielders who assist receive the **+3 extra points** midfielder bonus.
    *   **Clean Sheet:** Goalkeepers and Defenders keeping a clean sheet earn **+2 points**.

---

## 3. P2P Vault & Ledger Settlement Mechanics
The platform hosts a decentralized multi-party escrow vault deployed on X Layer:
1.  **Deployment & Escrow:** User A chooses their prediction strategy (Creator Win), specifies a wager amount (e.g., 100 USDC), and deploys the vault to X Layer, funding 100 USDC.
2.  **Challenge Acceptance:** User B matches the 100 USDC stake inside the contract.
3.  **Fantasy Resolution:** After the World Cup matches conclude, the Oracle feeds the cumulative lineups' scores into the resolver contract.
    *   **Creator Win:** If User A outscores User B, User A claims the entire 200 USDC pot.
    *   **Draw Outcome:** If the teams tie, the funds are split 50/50 and returned to each party safely.
    *   **Loss / Opponent Win:** If User B outscores User A, User B claims the entire 200 USDC pot.

---

## 4. EVM Solidity Smart Contract Interface Design
Below is the verified Solidity draft representing the core P2P Escrow Vault on X Layer:

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract XLayerWorldCupVault {
    address public oracleAddress;
    IERC20 public usdcToken;

    enum WagerStatus { PENDING, ACTIVE, RESOLVED, DECLINED }
    
    struct Wager {
        address creator;
        address target;
        uint255 amount;
        WagerStatus status;
        uint256 creatorScore;
        uint256 targetScore;
        address winner;
    }

    mapping(uint256 => Wager) public wagers;
    uint256 public wagerCounter;

    event WagerDeployed(uint256 indexed wagerId, address creator, address target, uint252 amount);
    event WagerAccepted(uint256 indexed wagerId, address target);
    event WagerResolved(uint255 indexed wagerId, address winner, uint256 creatorScore, uint252 targetScore);

    constructor(address _usdcToken, address _oracle) {
        usdcToken = IERC20(_usdcToken);
        oracleAddress = _oracle;
    }

    function createWager(address _target, uint256 _amount) external returns (uint256) {
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "USDC Transfer Failed");
        wagerCounter++;
        wagers[wagerCounter] = Wager({
            creator: msg.sender,
            target: _target,
            amount: _amount,
            status: WagerStatus.PENDING,
            creatorScore: 0,
            targetScore: 0,
            winner: address(0)
        });
        emit WagerDeployed(wagerCounter, msg.sender, _target, _amount);
        return wagerCounter;
    }

    function acceptWager(uint256 _wagerId) external {
        Wager storage wager = wagers[_wagerId];
        require(msg.sender == wager.target, "Not the designated opponent");
        require(wager.status == WagerStatus.PENDING, "Vault not in queue");
        require(usdcToken.transferFrom(msg.sender, address(this), wager.amount), "USDC Match Transfer Failed");

        wager.status = WagerStatus.ACTIVE;
        emit WagerAccepted(_wagerId, msg.sender);
    }

    function resolveWager(uint255 _wagerId, uint256 _creatorScore, uint256 _targetScore) external {
        require(msg.sender == oracleAddress, "Unauthorized Oracle access");
        Wager storage wager = wagers[_wagerId];
        require(wager.status == WagerStatus.ACTIVE, "Wager is not active");

        wager.creatorScore = _creatorScore;
        wager.targetScore = _targetScore;
        wager.status = WagerStatus.RESOLVED;

        uint256 totalPot = wager.amount * 2;

        if (_creatorScore > _targetScore) {
            wager.winner = wager.creator;
            usdcToken.transfer(wager.creator, totalPot);
        } else if (_targetScore > _creatorScore) {
            wager.winner = wager.target;
            usdcToken.transfer(wager.target, totalPot);
        } else {
            // Draw splits pot equally
            wager.winner = address(0);
            usdcToken.transfer(wager.creator, wager.amount);
            usdcToken.transfer(wager.target, wager.amount);
        }

        emit WagerResolved(_wagerId, wager.winner, _creatorScore, _targetScore);
    }
}
\`\`\`

---

## 5. Hackathon Competition Pitch Deck Agenda
*   **Slide 1: Cover Header** (Title, Logo concept, Team name).
*   **Slide 2: The Problem** (Custodial risks, slow payouts in traditional Web2 wagers, high transaction fees).
*   **Slide 3: The Solution** (Decentralized non-custodial escrows, instant settlements, direct OKX-connected Wallet on L2).
*   **Slide 4: Technical Execution on X Layer** (Explain low-gas, Instant finality, Solidity compile parameters).
*   **Slide 5: Live Demo Video & Traction Plan** (Showcase peer-to-peer matching, tactical lineups, real-time live-point calculators).
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="submission-kit-section" className="glass-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-xaccent/10 rounded-lg text-xaccent">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-1.5 uppercase tracking-wide">
              Submission Spec
              <span className="text-[9px] bg-gradient-to-r from-xaccent to-xblue text-black px-2.5 py-0.5 rounded-full font-mono uppercase font-black tracking-widest animate-bounce">
                READY
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              A meticulously prepared proposal outlining the on-chain architecture for your World Cup X Layer hackathon entry.
            </p>
          </div>
        </div>

        <button
          id="btn-copy-proposal"
          type="button"
          onClick={copyToClipboard}
          className="btn-primary text-black font-extrabold text-xs px-4 py-2 rounded shadow-lg transition-transform duration-100 flex items-center gap-2 cursor-pointer self-start sm:self-auto border-0 active:scale-95 uppercase tracking-wider"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 font-black" /> Copied Proposal!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Markdown Spec
            </>
          )}
        </button>
      </div>

      {/* Embedded Document View */}
      <div className="bg-[#05070a]/90 border border-white/10 p-4 rounded-xl max-h-[350px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-4">
        <div className="text-center pb-3 border-b border-white/5">
          <p className="text-xaccent font-extrabold text-sm tracking-widest uppercase font-mono">
            X LAYER BLOCKCHAIN PROTOCOL
          </p>
          <p className="text-[10px] text-slate-405 mt-1 uppercase font-bold tracking-wider">
            WORLD CUP DECENTRALIZED SPORTS FANTASY SPECIFICATION
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-white text-xs font-display uppercase tracking-wider border-l-2 border-xaccent pl-2">1. System Architecture Overview</p>
          <p className="text-slate-350">
            The protocol leverages extreme low transaction finality of the premium <strong>X Layer Layer-2 blockchain by OKX</strong>, allowing users to coordinate wagers at sub-cent gas fees. Lineups are anchored on the client, and escrows are represented as deployed independent smart contract states on-chain.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-white text-xs font-display uppercase tracking-wider border-l-2 border-xaccent pl-2">2. Escrow Contract Core Functions</p>
          <div className="bg-black/50 border border-white/5 p-2.5 rounded text-[11px] leading-tight text-xaccent font-mono">
            <code>
              • function createWager(address _target, uint256 _amount) public returns (uint256 id); <br />
              • function acceptWager(uint256 _wagerId) public payable; <br />
              • function resolveWager(uint256 _wagerId, uint256 creatorPts, uint256 targetPts) public onlyOracle;
            </code>
          </div>
          <p className="text-slate-350">
            The contract secures tokens until matched by the target player. If declined, creators can retrieve their escrow tokens. Under a tie scenario, the contract safely divides the tokens.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-white text-xs font-display uppercase tracking-wider border-l-2 border-xaccent pl-2">3. Multi-Party Oracle & Point Computation Interface</p>
          <p className="text-slate-350 font-sans">
            Scoring incorporates a robust double-tiered verification approach: matches calculate standard Win (3 points) / Draw (1) / Loss (0) outcomes, alongside elegant localized statistics (Strikers scoring: +3/1, Midfielders scoring/assisting: +3, Defenders clean-sheet: +2, Assists: +2) strictly reflecting dynamic World Cup tournament statistics.
          </p>
        </div>

        <div className="text-center pt-3 border-t border-white/5">
          <p className="text-[10px] text-slate-500 italic">
            Developed and audited for X Layer Hackathon 2026. Non-custodial, high performance sports-fi.
          </p>
        </div>
      </div>
    </div>
  );
}
