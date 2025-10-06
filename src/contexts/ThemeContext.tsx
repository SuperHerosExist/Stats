import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeMode = 'default' | 'dark' | 'red' | 'green' | 'willard';

export interface TeamBranding {
  teamName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  teamBranding: TeamBranding | null;
  setTeamBranding: (branding: TeamBranding | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_WILLARD_BRANDING: TeamBranding = {
  teamName: 'Willard Tigers',
  primaryColor: '#000000', // Black
  secondaryColor: '#FFFFFF', // White
  accentColor: '#808080', // Grey
  logoUrl: 'willard-logo', // Special marker for using the WillardLogo component
};

export const themeConfigs = {
  default: {
    background: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    card: 'backdrop-blur-xl bg-white/10 border-white/20',
    cardHover: 'hover:bg-white/20',
    accent: 'from-purple-500/20 to-blue-500/20',
    accentBorder: 'border-purple-400/30',
    accentHover: 'hover:from-purple-500/30 hover:to-blue-500/30',
    text: 'text-white',
    textSecondary: 'text-purple-200',
  },
  dark: {
    background: 'bg-gradient-to-br from-gray-950 via-slate-900 to-black',
    card: 'backdrop-blur-xl bg-black/40 border-white/10',
    cardHover: 'hover:bg-black/60',
    accent: 'from-gray-700/30 to-gray-900/30',
    accentBorder: 'border-gray-600/30',
    accentHover: 'hover:from-gray-700/40 hover:to-gray-900/40',
    text: 'text-white',
    textSecondary: 'text-gray-300',
  },
  red: {
    background: 'bg-gradient-to-br from-red-950 via-rose-900 to-red-800',
    card: 'backdrop-blur-xl bg-white/10 border-white/20',
    cardHover: 'hover:bg-white/20',
    accent: 'from-red-500/20 to-rose-500/20',
    accentBorder: 'border-red-400/30',
    accentHover: 'hover:from-red-500/30 hover:to-rose-500/30',
    text: 'text-white',
    textSecondary: 'text-red-200',
  },
  green: {
    background: 'bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900',
    card: 'backdrop-blur-xl bg-white/10 border-white/20',
    cardHover: 'hover:bg-white/20',
    accent: 'from-emerald-500/20 to-green-500/20',
    accentBorder: 'border-emerald-400/30',
    accentHover: 'hover:from-emerald-500/30 hover:to-green-500/30',
    text: 'text-white',
    textSecondary: 'text-emerald-200',
  },
  willard: {
    background: 'bg-gradient-to-br from-gray-950 via-gray-900 to-black',
    card: 'backdrop-blur-xl bg-black/40 border-white/10',
    cardHover: 'hover:bg-black/60 hover:border-white/20',
    accent: 'from-gray-800/30 to-gray-700/30',
    accentBorder: 'border-gray-500/30',
    accentHover: 'hover:from-gray-800/40 hover:to-gray-700/40',
    text: 'text-white',
    textSecondary: 'text-gray-300',
  },
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as ThemeMode) || 'default';
  });

  const [teamBranding, setTeamBrandingState] = useState<TeamBranding | null>(() => {
    const stored = localStorage.getItem('teamBranding');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    // Default to Willard branding
    return DEFAULT_WILLARD_BRANDING;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setTeamBranding = (branding: TeamBranding | null) => {
    setTeamBrandingState(branding);
    if (branding) {
      localStorage.setItem('teamBranding', JSON.stringify(branding));
    } else {
      localStorage.removeItem('teamBranding');
    }
  };

  const value = {
    theme,
    setTheme,
    teamBranding,
    setTeamBranding,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function getThemeConfig(theme: ThemeMode) {
  return themeConfigs[theme];
}
