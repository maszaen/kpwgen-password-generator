'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  Eye, EyeOff, Copy, Sparkles, History, PlusCircle, FileText, Files, Shield, 
  Zap, CheckCircle, Dna, AlertCircle, Lock, Globe, Trash, Info
} from 'lucide-react';
import { genPassword, normalizePlatform, type ExportHistoryItem as KpwgenExportHistoryItem } from '@zaeniahmad/kpwgen';

import { 
  GoogleIcon,
  FacebookIcon,
  InstagramIcon,
  DribbbleIcon,
  AdobeIcon,
  AdobeCCIcon,
  GithubIcon,
  GitlabIcon,
  LinkedinIcon,
  MetaIcon,
  QuoraIcon,
  RedisIcon,
  TwitterIcon,
  WhatsappIcon,
  XIcon,
  YoutubeIcon,
  NpmIcon,
} from '../public/assets/svg';

export interface ExportHistoryItem extends KpwgenExportHistoryItem {}

const DEFAULT_VERSION = 1;
const DEFAULT_LEN = 18;
const DEFAULT_PREFIX = 'Qx9';
const DEFAULT_SUFFIX = 'K7';

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function toCsv(data: ExportHistoryItem[]): string {
  if (!data || data.length === 0) return "";
  
  const headers = ['Platform', 'Account', 'Password', 'Generated At'];
  const rows = data.map(item => [
    escapeCsvField(item.platform),
    escapeCsvField(item.account || ''),
    escapeCsvField(item.pwd),
    escapeCsvField(item.timestamp.toISOString())
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

export function toTxt(data: ExportHistoryItem[]): string {
  if (!data || data.length === 0) return "";

  return data.map(item => {
    let content = `Platform   : ${item.platform}\n`;
    if (item.account) {
      content += `Account    : ${item.account}\n`;
    }
    content += `Password   : ${item.pwd}\n` +
              `Generated  : ${item.timestamp.toLocaleString('id-ID')}\n` +
              `----------------------------------------`;
    return content;
  }).join('\n\n');
}

export function generateExportFilename(data: ExportHistoryItem[]): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}-${month}-${year}`;

  let platformStr = data.slice(0, 3).map(p => p.platform.replace(/[^a-z0-9]/gi, '')).join('-');
  
  if (data.length > 3) {
    const remaining = data.length - 3;
    platformStr += `_${remaining}+`;
  }

  return `Kpwgen_${dateStr}_${platformStr}`;
}


const PasswordStrength = ({ pwd }: { pwd: string }) => {
  type Strength = 'weak' | 'medium' | 'strong' | 'excellent';
  const analysis = useMemo(() => {
    const checks = {
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSymbol: /[^A-Za-z0-9]/.test(pwd),
      minLength: pwd.length >= 12
    };
    const score = Object.values(checks).filter(Boolean).length;
    const strength: Strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : score <= 4 ? 'strong' : 'excellent';
    return { checks, score, strength };
  }, [pwd]);

  const CheckItem = ({ label, valid }: { label: string; valid: boolean }) => (
    <div className={`flex items-center text-xs transition-all duration-300 ${valid ? 'text-blue-300' : 'text-slate-400'}`}>
      <div className={`mr-2 w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${valid ? 'bg-blue-500/20' : 'bg-slate-600/20'}`}>
        {valid ? <CheckCircle className="w-2 h-2" /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />}
      </div>
      {label}
    </div>
  );

  const strengthColors = {
    weak: 'bg-gradient-to-r from-slate-700/40 to-slate-600/40 border-slate-500/30',
    medium: 'bg-gradient-to-r from-slate-600/40 to-blue-900/40 border-slate-400/30', 
    strong: 'bg-gradient-to-r from-blue-900/40 to-blue-700/40 border-blue-400/30',
    excellent: 'bg-gradient-to-r from-blue-700/40 to-blue-500/40 border-blue-300/30'
  };

  return (
    <div className={`mt-4 p-4 rounded-xl border transition-all duration-500 ${strengthColors[analysis.strength]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-200">Password Strength</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
          analysis.strength === 'excellent' ? 'bg-blue-500/20 text-blue-200' :
          analysis.strength === 'strong' ? 'bg-blue-600/20 text-blue-300' :
          analysis.strength === 'medium' ? 'bg-slate-500/20 text-slate-300' :
          'bg-slate-600/20 text-slate-400'
        }`}>
          {analysis.strength}
        </span>
      </div>

      <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            analysis.strength === 'excellent' ? 'bg-gradient-to-r from-blue-400 to-blue-300' :
            analysis.strength === 'strong' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
            analysis.strength === 'medium' ? 'bg-gradient-to-r from-slate-400 to-blue-500' :
            'bg-gradient-to-r from-slate-500 to-slate-400'
          }`}
          style={{ width: `${(analysis.score / 5) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CheckItem label="Uppercase" valid={analysis.checks.hasUpper} />
        <CheckItem label="Lowercase" valid={analysis.checks.hasLower} />
        <CheckItem label="Number" valid={analysis.checks.hasNumber} />
        <CheckItem label="Symbol" valid={analysis.checks.hasSymbol} />
        <CheckItem label="Min 12 characters" valid={analysis.checks.minLength} />
      </div>
    </div>
  );
};

const FormSection = ({ show, children, delay = 0 }: { show: boolean; children: React.ReactNode; delay?: number; }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  return (
    <div className={`transition-all duration-700 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0 max-h-screen' : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden'
    }`}>
      <div className={`transition-all duration-500 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        {children}
      </div>
    </div>
  );
};

function LeftPanel({ activeInput }: { activeInput: string | null }) {
  const getTitle = () => {
    switch (activeInput) {
      case 'master': return 'About the Master Key';
      case 'platform': return 'About Platform / Service';
      case 'account': return 'About Account Name';
      case 'advanced': return 'About Advanced Settings';
      default: return 'How It Works';
    }
  };

  const getBody = () => {
    switch (activeInput) {
      case 'master':
        return (
          <>
            <p className="text-slate-300 leading-relaxed">
              The <strong>Master Key</strong> is your main secret used to derive passwords via HMAC. Choose something memorable yet strong.
              It is <strong>never sent</strong> anywhere and is kept only in memory while generating.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400 list-disc pl-5">
              <li>Minimum 8 characters recommended (longer is better).</li>
              <li>Do not hardcode your master key in code or store it in LocalStorage.</li>
              <li>Consider a phrase you can always recall but others cannot guess.</li>
            </ul>
          </>
        );
      case 'platform':
        return (
          <>
            <p className="text-slate-300 leading-relaxed">
              <strong>Platform</strong> identifies where the password is used (e.g., <code>google</code> or a URL like
              <code> https://accounts.google.com</code>). When normalization is enabled, URLs are reduced to a canonical name
              so the same site maps to the same password.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400 list-disc pl-5">
              <li>Click a common platform chip to fill quickly.</li>
              <li>You can enter multiple platforms separated by spaces (advanced use).</li>
            </ul>
          </>
        );
      case 'account':
        return (
          <>
            <p className="text-slate-300 leading-relaxed">
              <strong>Account</strong> is optional. Provide it when you manage multiple accounts per platform. If you enter
              multiple platforms, make sure the number of accounts matches the number of platforms.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400 list-disc pl-5">
              <li>Separate multiple accounts with spaces.</li>
              <li>Counts must match to avoid mismatch errors.</li>
            </ul>
          </>
        );
      case 'advanced':
        return (
          <>
            <p className="text-slate-300 leading-relaxed">
              <strong>Advanced Settings</strong> let you rotate passwords and shape the output without breaking determinism.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400 list-disc pl-5">
              <li>
                <strong>Version</strong>: increment to rotate passwords while keeping old ones reproducible for recovery.
              </li>
              <li>
                <strong>Password Length</strong>: target final length of the generated password.
              </li>
              <li>
                <strong>Prefix/Suffix</strong>: enforce site-specific requirements.
              </li>
              <li>
                <strong>RAW mode</strong>: disables input normalization. Use only if you fully understand the implications.
              </li>
            </ul>
          </>
        );
      default:
        return (
          <>
            <p className="text-slate-300 leading-relaxed">
              This tool generates <strong>secure, reproducible passwords</strong>. As long as your inputs remain the same, the result will be
              <strong> identical</strong>. Everything is computed <strong>offline</strong>; no server calls and no storage.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400 list-disc pl-5">
              <li>Start by focusing on the <em>Master Key</em> field.</li>
              <li>The explanation on this panel will update as you move through the form.</li>
              <li>Adjust settings as needed to generate your unique password.</li>
            </ul>
          </>
        );
    }
  };

  return (
    <aside className="lg:sticky lg:top-10">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <Info className="w-4 h-4 text-blue-300" />
          </div>
          <h3 className="text-slate-100 font-semibold text-base">{getTitle()}</h3>
        </div>
        {getBody()}
      </div>
      <div className="mt-6 space-y-3">
      {/* Tautan GitHub */}
      <a
        href="https://github.com/maszaen/kpwgen-password-generator" // Ganti dengan URL repo Anda
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center space-x-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/70 hover:border-slate-600 transition-all duration-300"
      >
        <GithubIcon className="w-8 h-8 fill-slate-400 group-hover:text-white transition-colors" />
        <div className="flex-1">
          <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
            GitHub (this website)
          </p>
          <p className="text-xs text-slate-400">Give this project a star!</p>
        </div>
      </a>

      {/* Tautan NPM */}
      <a
        href="https://www.npmjs.com/package/@zaeniahmad/kpwgen"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center space-x-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/70 hover:border-slate-600 transition-all duration-300"
      >
        <NpmIcon className="fill-slate-400 w-8 h-8 rounded-sm" />
        <div className="flex-1">
          <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
            NPM Package (kpwgen)
          </p>
          <p className="text-xs text-slate-400">Check out the core library.</p>
        </div>
      </a>
    </div>
    </aside>
  );
}

export default function Page() {
  const [platform, setPlatform] = useState('');
  const [master, setMaster] = useState('');
  const [account, setAccount] = useState('');
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [len, setLen] = useState(DEFAULT_LEN);
  const [prefix, setPrefix] = useState(DEFAULT_PREFIX);
  const [suffix, setSuffix] = useState(DEFAULT_SUFFIX);
  const [raw, setRaw] = useState(false);

  const [results, setResults] = useState<{ platform: string, account?: string, pwd: string }[]>([]);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showMaster, setShowMaster] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState('');

  const [activeInput, setActiveInput] = useState<string | null>(null);

  const [showPlatform, setShowPlatform] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [countMismatchError, setCountMismatchError] = useState(false);

  const progressStep = useMemo(() => {
    if (master.length >= 8 && platform.trim().length > 0) return 2;
    if (master.length >= 8) return 1;
    return 0;
  }, [master, platform]);

  const steps = ['Master Key', 'Platform', 'Advanced'] as const;
  const total = steps.length;
  const pct = Math.max(0, Math.min(100, (progressStep / (total - 1)) * 100));

  const commonPlatforms = [
    { name: 'Google', icon: <GoogleIcon className="w-5 h-5 fill-blue-300" />, color: 'bg-blue-500/10 border-blue-500/20 text-blue-200' },
    { name: 'Facebook', icon: <FacebookIcon className="w-5 h-5 fill-blue-300" />, color: 'bg-blue-600/10 border-blue-600/20 text-blue-200' },
    { name: 'Instagram', icon: <InstagramIcon className="w-5 h-5 fill-pink-300" />, color: 'bg-pink-500/10 border-pink-500/20 text-pink-200' },
    { name: 'Dribbble', icon: <DribbbleIcon className="w-5 h-5 fill-pink-300" />, color: 'bg-pink-600/10 border-pink-600/20 text-pink-200' }
  ];

  const platformIcons: { [key: string]: React.ReactNode } = {
    google: <GoogleIcon className="w-5 h-5 fill-blue-300" />,
    dribbble: <DribbbleIcon className="w-5 h-5 fill-blue-300" />,
    adobe: <AdobeIcon className="w-5 h-5 fill-blue-300" />,
    adobecc: <AdobeCCIcon className="w-5 h-5 fill-blue-300" />,
    facebook: <FacebookIcon className="w-5 h-5 fill-blue-300" />,
    github: <GithubIcon className="w-5 h-5 fill-blue-300" />,
    gitlab: <GitlabIcon className="w-5 h-5 fill-blue-300" />,
    instagram: <InstagramIcon className="w-5 h-5 fill-blue-300" />,
    linkedin: <LinkedinIcon className="w-5 h-5 fill-blue-300" />,
    meta: <MetaIcon className="w-5 h-5 fill-blue-300" />,
    quora: <QuoraIcon className="w-5 h-5 fill-blue-300" />,
    redis: <RedisIcon className="w-5 h-5 fill-blue-300" />,
    twitter: <TwitterIcon className="w-5 h-5 fill-blue-300" />,
    whatsapp: <WhatsappIcon className="w-5 h-5 fill-blue-300" />,
    x: <XIcon className="w-5 h-5 fill-blue-300" />,
    youtube: <YoutubeIcon className="w-5 h-5 fill-blue-300" />
  };
  const getPlatformIcon = (platformName: string) => platformIcons[platformName.toLowerCase()] || <Globe className="w-4 h-4 text-blue-300" />;

  useEffect(() => {
    if (master.length >= 8) {
      setShowPlatform(true);
    }
  }, [master]);

  useEffect(() => {
    if (platform.trim().length > 0) {
      setShowAccount(true);
    }
  }, [platform]);

  useEffect(() => {
    const platforms = platform.trim().split(' ').filter(Boolean);
    const accounts = account.trim().split(' ').filter(Boolean);
    setCountMismatchError(accounts.length > 0 && platforms.length !== accounts.length);
  }, [platform, account]);

  useEffect(() => {
    if (account.trim().length > 0 || (platform.trim().length > 0 && master.length >= 8)) {
        setShowAdvanced(true);
    }
  }, [account, platform, master]);

  useEffect(() => { 
    setResults([]); 
    setError(''); 
    setCopiedPassword('');
  }, [platform, master, account, version, len, prefix, suffix, raw]);

  const onGenerate = async () => {
    setBusy(true); setError(''); setResults([]); setCopiedPassword('');
    try {
      if (!master || master.length < 8) throw new Error('Master key must be at least 8 characters.');
      const platforms = platform.trim().split(' ').filter(Boolean);
      const accounts = account.trim().split(' ').filter(Boolean);
      if (platforms.length === 0) throw new Error('Platform must not be empty.');
      if (accounts.length > 0 && platforms.length !== accounts.length) {
        throw new Error('Number of Accounts must match the number of Platforms.');
      }

      const newResults = platforms.map((p, index) => {
        const normalized = raw ? p.trim() : normalizePlatform(p);
        const currentAccount = accounts.length > 0 ? accounts[index] : undefined;
        const pwd = genPassword({ 
          masterSecret: master, 
          platform: normalized, 
          account: currentAccount,
          version, 
          lengthTarget: len, 
          prefix, 
          suffix, 
          normalize: !raw 
        });
        return { platform: normalized, account: currentAccount, pwd };
      });

      setResults(newResults);
      setHistory(prev => [...newResults.map(r => ({...r, timestamp: new Date()})), ...prev]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate password.';
      setError(message || 'Failed to generate password.');
    } finally { setBusy(false); }
  };

  const clearHistory = async () => { setHistory([]); };

  const onCopy = async (pwdToCopy: string) => {
    if (!pwdToCopy) return;
    try { 
      await navigator.clipboard.writeText(pwdToCopy); 
      setCopiedPassword(pwdToCopy);
      setTimeout(() => setCopiedPassword(''), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = pwdToCopy;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedPassword(pwdToCopy);
        setTimeout(() => setCopiedPassword(''), 2000);
      } catch (err) { console.error('Fallback copy failed', err); }
      document.body.removeChild(textArea);
    }
  };

  const handleExport = (format: 'csv' | 'txt') => {
    if (history.length === 0) return;
    const content = format === 'csv' ? toCsv(history) : toTxt(history);
    const filename = `${generateExportFilename(history)}.${format}`;
    const mimeType = format === 'csv' ? 'text/csv' : 'text/plain';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const isFormValid = master.length >= 8 && platform.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 py-8 px-4">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Two-column container */}
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <LeftPanel activeInput={activeInput} />
        </div>

        {/* RIGHT: Existing content */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/10 to-slate-500/10 rounded-2xl mb-6 border border-blue-500/20 backdrop-blur-sm">
              <Shield className="w-10 h-10 text-blue-300" />
            </div>
            <h1 className="font-display text-[3.75rem] leading-[3.5rem] md:text-[6.5rem] md:leading-[5.5rem] font-bold bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent mb-3">
              GENERATE UNBREAKABLE <br/>
              PASSWORD IN SECONDS
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed text-lg">
              Generate secure, reproducible passwords with absolute consistency — as long as your inputs remain the same, the result is identical. 
              <span className="text-black pr-1 bg-gradient-to-r from-white via-blue-100 to-slate-200 font-medium ml-1 rounded-sm"> 100% offline & secure.</span>
            </p>

            {/* Progress Indicator - Updated value */}
            <div className="mx-auto mt-8 w-full max-w-xl" aria-label="Progress" role="progressbar" aria-valuemin={0} aria-valuemax={total-1} aria-valuenow={progressStep}>
              <div className="relative px-0">
                <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-700/70" />
                <div className="absolute left-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-700" style={{ width: `calc(${pct}% - 0.5rem)` }} />
                <div className="relative flex items-center justify-between">
                  {steps.map((label, i) => {
                    const active = i <= progressStep;
                    const completed = i < progressStep;
                    return (
                      <div key={label} className="flex flex-col items-center">
                        <div className={[
                          'grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition-all duration-500',
                          active ? 'bg-blue-500/15 border-blue-400 text-blue-100 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]' : 'bg-slate-800 border-slate-600 text-slate-400',
                        ].join(' ')}>
                          {completed ? (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-label="Completed">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <span className="text-xs font-semibold">{i + 1}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-slate-500/3 rounded-3xl" />
            <div className="relative z-10">
              {/* Master Key (ADD onFocus) */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-300" />
                  <label className="text-sm font-semibold text-slate-200">Master Key</label>
                  {master.length >= 8 && <CheckCircle className="w-4 h-4 text-blue-300" />}
                </div>
                <div className="relative group">
                  <input 
                    type={showMaster ? 'text' : 'password'}
                    placeholder="Enter master key (min. 8 characters)" 
                    value={master} 
                    onChange={e => setMaster(e.target.value)}
                    onFocus={() => setActiveInput('master')}
                    className="w-full px-4 py-4 border border-slate-600/50 bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all duration-300 pr-12 placeholder-slate-400 text-left"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowMaster(!showMaster)} 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showMaster ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {/* Strength indicator line */}
                  <div className={`absolute bottom-0 left-[50%] translate-x-[-50%] rounded-full h-0.5 transition-all duration-500 ${
                    master.length >= 8 ? 'bg-purple-500 w-[95%]' : 
                    master.length >= 4 ? 'bg-green-500 w-2/3' : 
                    master.length > 0 ? 'bg-red-500 w-1/3' : 'w-0'
                  }`} />
                </div>
              </div>

              {/* Platform (ADD onFocus) */}
              <FormSection show={showPlatform} delay={200}>
                <div className="space-y-3 mt-5">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-300" />
                    <label className="text-sm font-semibold text-slate-200">Platform or Service</label>
                  </div>
                  <input 
                    type="text"
                    placeholder="Google, Facebook, or any platform..." 
                    value={platform} 
                    onChange={e => setPlatform(e.target.value)}
                    onFocus={() => setActiveInput('platform')}
                    className="w-full px-4 py-4 border border-slate-600/50 bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all duration-300 placeholder-slate-400"
                  />
                  <div className="flex flex-wrap gap-3">
                    {commonPlatforms.map(p => (
                      <button 
                        key={p.name} 
                        onClick={() => setPlatform(p.name)} 
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 ${p.color}`}
                      >
                        <span>{p.icon}</span>
                        <span className="text-sm font-medium">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </FormSection>

              {/* Account Field (ADD onFocus) */}
              <FormSection show={showAccount} delay={300}>
                <div className="space-y-3 mt-5">
                  <div className='flex items-center space-x-2'>
                    <Dna className="w-5 h-5 text-blue-300" />
                    <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                      <span>Account Name</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter account name..." 
                    value={account} 
                    onChange={e => setAccount(e.target.value)} 
                    onFocus={() => setActiveInput('account')}
                    className={`w-full px-4 py-4 border bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 outline-none transition-all duration-300 placeholder-slate-400 ${
                      countMismatchError 
                        ? 'border-slate-400/70 focus:ring-slate-400/50 focus:border-slate-400/70' 
                        : 'border-slate-600/50 focus:ring-blue-400/50 focus:border-blue-400/50'
                    }`}
                  />
                  <p className={`text-xs transition-opacity duration-300 ${countMismatchError ? 'text-red-500' : 'text-slate-300'}`}>
                    {countMismatchError 
                      ? 'Number of accounts must match the number of platforms.' 
                      : 'Separate with spaces for multiple accounts.'
                    }
                  </p>
                </div>
              </FormSection>

              {/* Advanced Options (ADD onFocusCapture) */}
              <FormSection show={showAdvanced} delay={400}>
                <div 
                  className="space-y-6 mt-5 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/30"
                  onFocusCapture={() => setActiveInput('advanced')}
                >
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-300" />
                    <span>Advanced Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm font-medium text-slate-300">
                        <span>Version</span>
                        <button 
                          onClick={() => setVersion(v => v + 1)} 
                          className="flex items-center space-x-1 text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4"/>
                          <span className="text-xs">Increment</span>
                        </button>
                      </label>
                      <input 
                        type="number" min={1} value={version} 
                        onChange={e => setVersion(Number(e.target.value || 1))} 
                        className="w-full px-4 py-3 border border-slate-600/50 bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Password Length</label>
                      <input 
                        type="number" min={10} max={50} value={len} 
                        onChange={e => setLen(Number(e.target.value || 18))} 
                        className="w-full px-4 py-3 border border-slate-600/50 bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Prefix (optional)</label>
                      <input 
                        type="text" value={prefix} onChange={e => setPrefix(e.target.value)} 
                        className="w-full px-4 py-3 border border-slate-600/50 bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Suffix (optional)</label>
                      <input 
                        type="text" value={suffix} onChange={e => setSuffix(e.target.value)} 
                        className="w-full px-4 py-3 border border-slate-600/50 bg-slate-700/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-400/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-slate-600/30 rounded-xl">
                    <input 
                      type="checkbox" id="raw" checked={raw} onChange={e => setRaw(e.target.checked)} 
                      className="w-5 h-5 appearance-none rounded-full border-2 border-purple-400 bg-slate-700 checked:bg-purple-500 checked:border-black-400 focus:ring-1 focus:ring-purple-300/50 transition-all duration-200 flex-shrink-0 relative"
                      style={{ outline: 'none' }}
                    />
                    <label htmlFor="raw" className="text-sm text-slate-300 cursor-pointer">
                      Disable normalization (RAW mode)
                    </label>
                  </div>
                </div>
              </FormSection>

              {/* Generate Button */}
              <div className="pt-4">
                <button 
                  onClick={onGenerate} disabled={busy || !isFormValid} 
                  className="group relative w-full bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-500 hover:to-slate-600 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {busy ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate Password</span>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-slate-600/20 border border-slate-500/30 text-slate-200 rounded-xl p-4 animate-pulse mt-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="bg-gradient-to-br mt-5 from-blue-500/10 to-slate-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-blue-200 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Generated Password(s)</span>
                    </h3>
                    <button 
                      type="button" onClick={() => setShowPassword(!showPassword)} 
                      className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-blue-500/10"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      <span className="text-sm">{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {results.map((res, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-300">Platform: <span className="text-blue-200 capitalize">{res.platform}</span></p>
                            {res.account && <p className="text-xs text-slate-400">Account: {res.account}</p>}
                          </div>
                          <button 
                            onClick={() => onCopy(res.pwd)} 
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                              copiedPassword === res.pwd 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30'
                            }`}
                          >
                            <Copy className="w-4 h-4" />
                            <span>{copiedPassword === res.pwd ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-lg bg-slate-900/50 border border-slate-600/30 text-slate-100 rounded-xl p-4 break-all select-all relative overflow-hidden">
                          {showPassword ? res.pwd : '•'.repeat(res.pwd.length)}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse" />
                        </div>
                        <PasswordStrength pwd={res.pwd} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-200 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-slate-500/20 rounded-xl border border-blue-500/30">
                    <History className="w-6 h-6 text-blue-300"/>
                  </div>
                  <span>Temporary History</span>
                  <span className="text-sm font-normal bg-slate-700 text-slate-300 px-3 py-1 rounded-full">{history.length}</span>
                </h2>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleExport('csv')}
                    className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50"
                    title="Export to CSV"
                  >
                    <Files className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
                  <button 
                    onClick={() => handleExport('txt')}
                    className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50"
                    title="Export to TXT"
                  >
                    <FileText className="w-4 h-4" />
                    <span>TXT</span>
                  </button>
                  <button 
                    onClick={clearHistory}
                    className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50"
                    title="Clear history"
                  >
                    <Trash className='w-4 h-4'/>
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y divide-slate-700/50">
                    {history.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-700/30 transition-all duration-300 group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-slate-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                              {getPlatformIcon(item.platform)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-slate-200 font-medium truncate capitalize">{item.platform}</p>
                              {item.account && (
                                <p className="text-xs text-slate-400 truncate">Account: {item.account}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-blue-300 rounded-full" />
                              <span>{item.timestamp.toLocaleTimeString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span>{item.pwd.length} chars</span>
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => onCopy(item.pwd)} 
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                            copiedPassword === item.pwd
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/50 group-hover:border-blue-500/30'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copiedPassword === item.pwd ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-700/50 p-4 bg-slate-700/20">
                  <p className="text-xs text-slate-500 text-center">
                    History is stored temporarily in your browser. No data is sent to any server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>100% Offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-200" />
                <span>Zero Server Calls</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-300" />
                <span>Instant Generation</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm">
              Built with security & privacy in mind. Powered by{' '}
              <a
                href="https://www.npmjs.com/package/@zaeniahmad/kpwgen"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <code className="text-blue-300 bg-slate-800 px-2 py-1 rounded text-xs hover:underline">
                  @zaeniahmad/kpwgen
                </code>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}