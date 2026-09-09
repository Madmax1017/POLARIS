import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  preference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'polar-command-theme';

const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getInitialPreference = (): ThemePreference => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return 'dark'; // Default to Polar Night dark theme
};

const resolveTheme = (pref: ThemePreference): ThemeMode => {
  if (pref === 'system') {
    return getSystemTheme();
  }
  return pref;
};

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

const initialPref = getInitialPreference();
const initialTheme = resolveTheme(initialPref);

// Initial DOM setup
if (typeof document !== 'undefined') {
  applyThemeToDOM(initialTheme);
}

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for system theme changes if preference is 'system'
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentPref = get().preference;
      if (currentPref === 'system') {
        const newTheme = getSystemTheme();
        applyThemeToDOM(newTheme);
        set({ theme: newTheme });
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  }

  return {
    theme: initialTheme,
    preference: initialPref,

    setThemePreference: (pref: ThemePreference) => {
      try {
        localStorage.setItem(STORAGE_KEY, pref);
      } catch (e) {
        // Ignore
      }
      const resolved = resolveTheme(pref);
      applyThemeToDOM(resolved);
      set({ preference: pref, theme: resolved });
    },

    toggleTheme: () => {
      const currentTheme = get().theme;
      const nextTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (e) {
        // Ignore
      }
      applyThemeToDOM(nextTheme);
      set({ preference: nextTheme, theme: nextTheme });
    },
  };
});
