/**
 * EchoMint Theme Configuration
 *
 * Centralized color and theme definitions for easy customization.
 * All colors use oklch format for better perceptual uniformity.
 */

export const theme = {
  // Brand colors - customize these to change the entire theme
  colors: {
    // Primary brand color (purple/violet for crypto/NFT feel)
    primary: {
      DEFAULT: 'oklch(0.55 0.25 280)', // vibrant purple
      foreground: 'oklch(0.98 0 0)', // almost white text
      hover: 'oklch(0.48 0.28 280)', // darker purple on hover
    },

    // Secondary/accent colors
    accent: {
      DEFAULT: 'oklch(0.65 0.25 320)', // magenta/pink
      foreground: 'oklch(0.98 0 0)',
      muted: 'oklch(0.35 0.15 320)', // darker magenta
    },

    // Background colors (dark theme)
    background: {
      DEFAULT: 'oklch(0.12 0.01 280)', // very dark purple-tinted
      elevated: 'oklch(0.18 0.015 280)', // slightly lighter for cards
      hover: 'oklch(0.22 0.02 280)', // hover state
    },

    // Text colors
    text: {
      primary: 'oklch(0.95 0.01 280)', // almost white with purple tint
      secondary: 'oklch(0.70 0.02 280)', // muted text
      tertiary: 'oklch(0.50 0.03 280)', // even more muted
    },

    // Border colors
    border: {
      DEFAULT: 'oklch(0.30 0.02 280)', // subtle borders
      focus: 'oklch(0.55 0.25 280)', // primary color for focus
    },

    // Mood-specific colors (for mood indicators)
    mood: {
      bullish: 'oklch(0.75 0.20 130)', // bright green
      bearish: 'oklch(0.55 0.22 25)', // red/orange
      neutral: 'oklch(0.70 0.08 250)', // calm blue-gray
      volatile: 'oklch(0.75 0.23 60)', // yellow/orange (warning)
      positiveSentiment: 'oklch(0.70 0.18 85)', // warm yellow-green
      negativeSentiment: 'oklch(0.50 0.20 340)', // pink-red (corrupted)
    },

    // Status colors
    success: 'oklch(0.70 0.20 140)', // green
    error: 'oklch(0.60 0.25 25)', // red
    warning: 'oklch(0.75 0.20 70)', // orange-yellow
    info: 'oklch(0.65 0.20 250)', // blue
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },

  // Spacing and layout
  spacing: {
    containerMaxWidth: '1400px',
    contentPadding: '1.5rem',
    cardPadding: '1.5rem',
    sectionGap: '2rem',
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  // Shadows (dark theme optimized)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
    glow: '0 0 20px rgb(139 92 246 / 0.3)', // purple glow effect
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

// Helper function to get mood color
export function getMoodColor(mood: string): string {
  const moodLower = mood.toLowerCase();

  if (moodLower.includes('bullish')) return theme.colors.mood.bullish;
  if (moodLower.includes('bearish')) return theme.colors.mood.bearish;
  if (moodLower.includes('neutral')) return theme.colors.mood.neutral;
  if (moodLower.includes('volatile')) return theme.colors.mood.volatile;
  if (moodLower.includes('positive')) return theme.colors.mood.positiveSentiment;
  if (moodLower.includes('negative')) return theme.colors.mood.negativeSentiment;

  return theme.colors.text.secondary;
}

// Helper function to get mood label
export function getMoodLabel(mood: string): string {
  const moodLower = mood.toLowerCase();

  if (moodLower.includes('bullish')) return 'Bullish 🚀';
  if (moodLower.includes('bearish')) return 'Bearish 📉';
  if (moodLower.includes('neutral')) return 'Neutral 😌';
  if (moodLower.includes('volatile')) return 'Volatile ⚡';
  if (moodLower.includes('positive')) return 'Positive 💚';
  if (moodLower.includes('negative')) return 'Negative 💔';

  return mood;
}

export type Theme = typeof theme;
