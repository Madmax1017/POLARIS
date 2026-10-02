import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import polarShipBg from '../assets/polar-ship-bg.jpg';
import logoUrl from '../assets/logo.png';
import { MOCK_USERS } from '../data/mockData';
import { useAuthStore } from '../stores/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    // Find email in MOCK_USERS
    const foundUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (foundUser) {
      // 1. Save complete user object to localStorage using key "polaris_current_user"
      localStorage.setItem('polaris_current_user', JSON.stringify(foundUser));

      // 2. Map to auth store for active session
      const roleMap: Record<string, 'FIELD_STAFF' | 'STATION_LEADER' | 'NCPOR_COMMAND'> = {
        'field@polaris.res.in': 'FIELD_STAFF',
        'station@polaris.res.in': 'STATION_LEADER',
        'logistics@polaris.res.in': 'STATION_LEADER',
        'r.verma@ncpor.res.in': 'NCPOR_COMMAND',
      };

      const mappedRole = roleMap[cleanEmail] || 'FIELD_STAFF';

      useAuthStore.setState({
        user: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: mappedRole,
          roleDisplayName: foundUser.role,
          stationId: foundUser.stationId,
          clearanceLevel: foundUser.clearanceLevel,
          avatarInitials: foundUser.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
        },
        isAuthenticated: true,
      });

      // 3. Navigate to /dashboard
      navigate('/dashboard');
    } else {
      // Show "Invalid demo account" on the login page
      setErrorMessage('Invalid demo account');
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setErrorMessage('');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] select-none">
      {/* Full-screen Background Image */}
      <img
        src={polarShipBg}
        alt="Polar Expedition Vessel Background"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
      />

      {/* Subtle Light/Medium Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/90 via-[var(--bg-primary)]/70 to-[var(--bg-primary)]/80 backdrop-blur-[2px]"></div>

      {/* Subtle Radial Blue Glow Effect */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[var(--polar-cyan)]/15 blur-3xl pointer-events-none"></div>

      {/* Viewport Overlay Container */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 sm:p-10 md:p-12">
        {/* Top Header Row */}
        <header className="flex items-start justify-between">
          {/* Top-Left Title & Tagline */}
          <div className="flex items-center space-x-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-primary)] shadow-md overflow-hidden p-1 bg-white">
              <img src={logoUrl} alt="Polaris Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-bold tracking-wider text-[var(--text-primary)] sm:text-3xl">
                POLARIS
              </h1>
              <p className="font-sans text-xs font-medium text-[var(--polar-cyan)] tracking-wide mt-0.5">
                Explore • Monitor • Protect
              </p>
            </div>
          </div>

          {/* Top-Right Station Badge */}
          <div className="hidden sm:flex items-center space-x-2 rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)]/80 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-xs font-semibold tracking-wider text-[var(--text-primary)]">
              POLAR EXPEDITION COMMAND CENTER
            </span>
          </div>
        </header>

        {/* Center / Right Section */}
        <div className="flex flex-1 items-center justify-end py-6">
          {/* Modern Theme-Aware SaaS Card */}
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)]/95 p-8 shadow-2xl backdrop-blur-md sm:p-9 text-[var(--text-primary)]">
            {/* Card Header */}
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-sans">
                Welcome to Polaris
              </h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)] font-sans">
                Sign in to access your polar operations dashboard
              </p>
            </div>

            {/* Quick Demo Preset Selector */}
            <div className="mb-5 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] font-sans">
              <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider block mb-2">
                Select Demo Account:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('field@polaris.res.in')}
                  className={`p-2 rounded-lg text-left border transition-colors cursor-pointer truncate font-mono text-[11px] ${email === 'field@polaris.res.in'
                    ? 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/40 font-bold'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  field@polaris.res.in
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('station@polaris.res.in')}
                  className={`p-2 rounded-lg text-left border transition-colors cursor-pointer truncate font-mono text-[11px] ${email === 'station@polaris.res.in'
                    ? 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/40 font-bold'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  station@polaris.res.in
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('logistics@polaris.res.in')}
                  className={`p-2 rounded-lg text-left border transition-colors cursor-pointer truncate font-mono text-[11px] ${email === 'logistics@polaris.res.in'
                    ? 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/40 font-bold'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  logistics@polaris.res.in
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('r.verma@ncpor.res.in')}
                  className={`p-2 rounded-lg text-left border transition-colors cursor-pointer truncate font-mono text-[11px] ${email === 'r.verma@ncpor.res.in'
                    ? 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/40 font-bold'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  r.verma@ncpor.res.in
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4 font-sans">
              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <input
                    type="text"
                    placeholder="field@polaris.res.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-input)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono transition-colors focus:border-[var(--polar-cyan)] focus:ring-2 focus:ring-[var(--polar-cyan)]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-input)] pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono transition-colors focus:border-[var(--polar-cyan)] focus:ring-2 focus:ring-[var(--polar-cyan)]/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[var(--text-muted)]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[var(--text-muted)]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-primary)] text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-[var(--polar-cyan)] hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="mt-2 w-full cursor-pointer rounded-xl bg-blue-600 py-3 px-4 text-sm font-bold text-white tracking-wide shadow-sm hover:bg-blue-700 active:scale-[0.99] flex items-center justify-center space-x-2 group transition-all"
              >
                <span>SIGN IN</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-[var(--border-subtle)]"></div>
                <span className="absolute bg-[var(--surface-primary)] px-3 text-[11px] font-semibold uppercase text-[var(--text-muted)]">
                  OR
                </span>
              </div>

              {/* Continue with SSO Button */}
              <button
                type="button"
                onClick={() => {
                  fillDemoAccount('r.verma@ncpor.res.in');
                  const cmdUser = MOCK_USERS.find((u) => u.email === 'r.verma@ncpor.res.in');
                  if (cmdUser) {
                    localStorage.setItem('polaris_current_user', JSON.stringify(cmdUser));
                    useAuthStore.setState({
                      user: {
                        id: cmdUser.id,
                        email: cmdUser.email,
                        name: cmdUser.name,
                        role: 'NCPOR_COMMAND',
                        roleDisplayName: cmdUser.role,
                        stationId: cmdUser.stationId,
                        clearanceLevel: cmdUser.clearanceLevel,
                        avatarInitials: 'RV',
                      },
                      isAuthenticated: true,
                    });
                  }
                  navigate('/dashboard');
                }}
                className="w-full cursor-pointer rounded-xl border border-[var(--border-primary)] bg-[var(--surface-elevated)] py-2.5 px-4 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-input)] flex items-center justify-center space-x-2"
              >
                <Shield className="h-4 w-4 text-[var(--polar-cyan)]" />
                <span>CONTINUE WITH NCPOR SSO</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom-Left Footer Tagline */}
        <footer className="flex items-end justify-between">
          <div className="space-y-0.5 font-sans text-xs text-white/90 font-medium">
            <p>Real-time intelligence.</p>
            <p>Safer expeditions.</p>
            <p className="text-[var(--polar-cyan)] font-semibold">A sustainable future.</p>
          </div>

          <div className="hidden md:block font-mono text-[10px] text-white/70 text-right">
            <p>NCPOR POLAR LOGISTICS & RESOURCE INTELLIGENCE</p>
            <p>GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
