import React, { useState } from 'react';
import { Wallet, Copy, RefreshCw, AlertCircle, Sparkles, Check, Flame, Trophy } from 'lucide-react';
import { UserProfile } from '../types';

export const THEME_PRESETS = [
  { id: 'cyan', name: 'Cosmic Cyan 🌌', accent: '#00F0FF', blue: '#0072FF', desc: 'Futuristic electric blue' },
  { id: 'emerald', name: 'Pitch Emerald 🏟️', accent: '#00FF66', blue: '#008833', desc: 'Classic soccer field grass' },
  { id: 'sunset', name: 'Sunset Glow 🌅', accent: '#FF7700', blue: '#FF1100', desc: 'Dazzling twilight orange' },
  { id: 'amethyst', name: 'Royal Violet 🔮', accent: '#DF5CFF', blue: '#7A00FF', desc: 'Premium deep gold & purple' },
  { id: 'silver', name: 'Frozen Silver ❄️', accent: '#E2E8F0', blue: '#475569', desc: 'Sleek silver minimalist' }
];

interface WalletConnectorProps {
  currentAddress: string;
  currentProfile: UserProfile | null;
  onConnectWallet: (address: string) => void;
  onDisconnect: () => void;
  onRegisterUsername: (username: string) => void;
  allProfiles: UserProfile[];
  onSwitchSimulatedAccount: (address: string) => void;
  currentThemeId: string;
  onChangeTheme: (themeId: string) => void;
}

export default function WalletConnector({
  currentAddress,
  currentProfile,
  onConnectWallet,
  onDisconnect,
  onRegisterUsername,
  allProfiles,
  onSwitchSimulatedAccount,
  currentThemeId,
  onChangeTheme,
}: WalletConnectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim()) return;

    setIsRegistering(true);
    // Simulate safe profile database setup
    setTimeout(() => {
      onRegisterUsername(regUsername.trim());
      setIsRegistering(false);
      setRegUsername('');
    }, 1200);
  };

  const formattedAddress = (add: string) => {
    return `${add.slice(0, 6)}...${add.slice(-4)}`;
  };

  // Attempt real browser-injected OKX wallet connection
  const handleConnectRealOKX = async () => {
    const provider = (window as any).okxwallet;
    
    if (provider) {
      try {
        setErrorMsg('');
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          onConnectWallet(accounts[0]);
          setShowConnectModal(false);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'The connection was cancelled in your wallet extension.');
      }
    } else {
      // Check standard ethereum as fallback but warn them about OKX requirement
      const ethProvider = (window as any).ethereum;
      if (ethProvider && ethProvider.isOKXWallet) {
        try {
          setErrorMsg('');
          const accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            onConnectWallet(accounts[0]);
            setShowConnectModal(false);
            return;
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Connection cancelled.');
          return;
        }
      }

      setErrorMsg(
        'We could not find the OKX Wallet extension in your browser. Please install the official OKX Wallet browser extension to connect real accounts, or choose "Launch Simulated Demo Wallet" below for instant testing!'
      );
    }
  };

  const handleConnectSimulation = () => {
    // connect a beautiful simulated address
    const randomAddress = `0x${Array.from({ length: 40 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`;
    onConnectWallet(randomAddress);
    setShowConnectModal(false);
  };

  return (
    <div id="wallet-connector-section" className="glass-card p-5 relative overflow-hidden space-y-4">
      {/* Decorative gradient light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-xaccent/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Simplified User Account Pass */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-xaccent/10 rounded-lg text-xaccent border border-xaccent/20 animate-pulse">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-medium text-white tracking-wide uppercase">My Safe Soccer Account</h2>
            <div className="flex items-center gap-2 mt-1">
              <select
                id="chain-id-selector"
                className="bg-[#05070A]/80 border border-white/10 text-[11px] font-mono rounded px-2 py-0.5 text-slate-300 focus:outline-none focus:border-xaccent cursor-pointer"
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value as 'mainnet' | 'testnet')}
              >
                <option value="testnet">Soccer Arena Hub (Standard Network)</option>
                <option value="mainnet">Soccer Arena Hub (Premium Live Network)</option>
              </select>
              <span className="w-1.5 h-1.5 rounded-full bg-xaccent animate-ping"></span>
              <span className="text-[10px] text-xaccent uppercase font-bold tracking-widest font-mono">Arena Active</span>
            </div>
          </div>
        </div>

        {/* Connection Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {currentAddress ? (
            <div className="text-right">
              {currentProfile?.username ? (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-left">
                  <div className="w-2.5 h-2.5 bg-xaccent rounded-full animate-pulse"></div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono uppercase block">Active Fan Nickname</span>
                    <p className="text-sm font-bold text-xaccent font-display leading-tight">
                      @{currentProfile.username}
                    </p>
                  </div>
                  <div className="border-l border-white/10 h-6 mx-2"></div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono uppercase block">My Safe Wallet Coins</span>
                    <p className="text-xs font-mono font-bold text-white">
                      {currentProfile.balanceUSDC.toFixed(0)} Coins
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-xaccent bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
                  Address linked. Nickname required over to start picking formations!
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-trigger-wallet-connect"
              type="button"
              onClick={() => {
                setErrorMsg('');
                setShowConnectModal(true);
              }}
              className="btn-primary text-black font-extrabold text-xs px-4 py-2.5 rounded hover:bg-opacity-90 transition-all duration-150 shadow-md shadow-xaccent/10 flex items-center gap-2 cursor-pointer border-0 uppercase tracking-wider"
            >
              <Wallet className="w-4 h-4 text-black" /> Click to Connect OKX Wallet
            </button>
          )}

          {currentAddress && (
            <div className="flex gap-2">
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-2 rounded text-slate-300 flex items-center gap-1.5">
                {formattedAddress(currentAddress)}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  title="Copy account address ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </span>
              <button
                id="btn-disconnect-wallet"
                type="button"
                onClick={onDisconnect}
                className="bg-white/5 border border-white/10 font-semibold text-xs text-red-400 px-3 py-2 rounded hover:bg-red-955/20 hover:border-red-900/60 transition-colors cursor-pointer"
              >
                Leave
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Username / Nickname registry */}
      {currentAddress && (!currentProfile || !currentProfile.username) && (
        <div id="username-registration-card" className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-xs uppercase font-mono text-xaccent font-extrabold tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-xaccent animate-bounce" />
            Pick Your Soccer Fan Nickname!
          </h3>
          <p className="text-xs text-slate-300 mb-4 max-w-xl">
            To start selecting your perfect tactical team lineups, contesting other fans, and placing simulation coins in safe match challenges, please pick a recognizable nickname!
          </p>

          <form onSubmit={handleRegisterSubmit} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-sm leading-none">
                @
              </span>
              <input
                id="register-username-input"
                type="text"
                required
                className="w-full bg-[#05070a]/80 border border-white/10 rounded py-2 pl-7 pr-3 text-sm text-white focus:outline-none focus:border-xaccent"
                placeholder="super_striker"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              />
            </div>
            <button
              id="btn-register-username-submit"
              type="submit"
              disabled={isRegistering}
              className="bg-gradient-to-r from-xaccent to-xblue font-extrabold text-xs text-black px-4 py-2 rounded hover:opacity-90 transition-all duration-150 shadow cursor-pointer disabled:opacity-50 uppercase tracking-widest"
            >
              {isRegistering ? 'Saving Nickname...' : 'Confirm Nickname'}
            </button>
          </form>
        </div>
      )}

      {/* CUSTOM PERSONAL THEME DASHBOARD MODULE */}
      {currentAddress && currentProfile && currentProfile.username && (
        <div id="personal-theme-dashboard" className="p-4 bg-white/[0.02] border border-white/5 rounded-xl pt-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-xaccent" />
              <h3 className="text-xs uppercase font-mono text-white font-extrabold tracking-wide">
                🎨 Personal Settings Dashboard & uniforms selection
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Dashboard ID: @{currentProfile.username} (Linked to Wallet Address)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to your personal dashboard! You can set the primary visual color themes for the entire game right here. Switch uniforms anytime to match your team style!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1.5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeTheme(preset.id)}
                className={`p-2 rounded text-left border transition-all cursor-pointer relative ${
                  currentThemeId === preset.id
                    ? 'border-xaccent bg-xaccent/10 shadow-sm'
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white leading-tight block">{preset.name.split(' ').shift()}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/30"
                    style={{ background: `linear-gradient(135deg, ${preset.accent} 0%, ${preset.blue} 100%)` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-1 leading-tight">{preset.name.split(' ').slice(1).join(' ') || preset.desc}</span>
                {currentThemeId === preset.id && (
                  <span className="absolute bottom-1 right-2 bg-xaccent text-black text-[8px] font-mono px-1 rounded font-bold uppercase">
                    ACTIVE
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Simulation Platform Toolbar (made extremely clear as simulated tester toolbar) */}
      <div className="pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.01] px-3 py-2 rounded">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-xaccent animate-spin-slow" />
          <span className="text-[11px] text-slate-300">
            🥅 <strong className="text-white">Quick play demo helper:</strong> Click any nickname below to test matching up between different simulated soccer fans!
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allProfiles.map((prof) => {
            if (!prof.username) return null;
            const isActive = currentAddress.toLowerCase() === prof.address.toLowerCase();
            return (
              <button
                id={`dev-switch-btn-${prof.username}`}
                key={prof.address}
                type="button"
                onClick={() => onSwitchSimulatedAccount(prof.address)}
                className={`px-2.5 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-xaccent to-xblue text-black font-extrabold border-0'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                @{prof.username} ({prof.balanceUSDC} Coins)
              </button>
            );
          })}
        </div>
      </div>

      {/* Real OKX Wallet Connection simulation modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 shadow-2xl relative bg-[#05070a] border border-xaccent/30">
            <h3 className="text-lg font-display font-black text-white mb-1.5 uppercase tracking-wide">Connect OKX Wallet</h3>
            <p className="text-xs text-slate-400 mb-4">
              We highly recommend connecting your **official OKX Wallet** browser extension to experience the real playground app in your browser!
            </p>

            {errorMsg && (
              <div className="mb-4 bg-red-955/20 border border-red-900/40 p-2.5 rounded text-xs text-red-400 font-mono space-y-1">
                <p className="font-bold">Notice:</p>
                <p className="text-[11px] leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {/* Option 1: Genuine Browser Action */}
              <button
                id="wallet-option-okx-real"
                type="button"
                onClick={handleConnectRealOKX}
                className="w-full bg-[#05070a] hover:bg-white/5 border border-white/10 hover:border-xaccent/50 p-3 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                      Connect Real OKX Wallet
                      <span className="text-[8px] bg-xaccent text-black px-1.5 py-0.5 rounded font-mono uppercase font-black animate-pulse">
                        REAL BROWSER
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Launches your browser extension</p>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-xaccent transition-colors text-xs font-mono">&rarr;</span>
              </button>

              {/* Option 2: Simulation Playground */}
              <button
                id="wallet-option-okx-simulate"
                type="button"
                onClick={handleConnectSimulation}
                className="w-full bg-white/[0.02] hover:bg-white/5 border border-dashed border-white/20 hover:border-slate-400/50 p-3 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 leading-tight">
                      Launch Simulated Demo Wallet
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Quickly play with fake sandbox coins</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-white transition-colors text-xs font-mono">&rarr;</span>
              </button>
            </div>

            <button
              id="btn-close-wallet-modal"
              type="button"
              onClick={() => {
                setErrorMsg('');
                setShowConnectModal(false);
              }}
              className="mt-4 w-full bg-white/5 border border-white/10 text-xs font-bold py-2.5 rounded text-slate-300 hover:bg-white/10 transition-colors uppercase tracking-widest font-mono cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
