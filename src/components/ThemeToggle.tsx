import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { theme, toggleTheme } = useThemeStore();

    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`relative inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 cursor-pointer select-none ${isDark
                ? 'bg-[var(--surface-elevated)] border-[var(--border-primary)] text-[var(--polar-cyan)] hover:bg-[var(--surface-hover)]'
                : 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200'
                } ${className}`}
        >
            <div className="relative flex items-center justify-center w-4 h-4">
                {isDark ? (
                    <Moon className="w-3.5 h-3.5 transition-transform duration-300 rotate-0 scale-100 text-[var(--polar-cyan)]" />
                ) : (
                    <Sun className="w-3.5 h-3.5 transition-transform duration-300 rotate-0 scale-100 text-amber-500" />
                )}
            </div>
            {showLabel && (
                <span className="ml-2 font-mono text-xs font-semibold">
                    {isDark ? 'DARK MODE' : 'LIGHT MODE'}
                </span>
            )}
        </button>
    );
};
