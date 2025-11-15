/**
 * EchoMint Theme Configuration
 *
 * Centralized color and theme definitions for easy customization.
 * All colors use oklch format for better perceptual uniformity.
 */

export const theme = {
  // Brand colors - Vintage Sunset Theme
  colors: {
    // Primary brand color (Muted Gold/Ochre #CC9900)
    primary: {
      DEFAULT: 'oklch(0.65 0.15 70)', // muted gold
      foreground: 'oklch(0.15 0.03 30)', // dark brown text on gold
      hover: 'oklch(0.58 0.16 70)', // slightly darker gold
    },

    // Secondary/accent colors (complementary rust tones)
    accent: {
      DEFAULT: 'oklch(0.65 0.15 70)', // gold accent
      foreground: 'oklch(0.15 0.03 30)',
      muted: 'oklch(0.55 0.12 55)', // muted warm tone
    },

    // Background colors (Vintage Sunset theme)
    background: {
      DEFAULT: 'oklch(0.15 0.03 30)', // #36241C warm dark brown
      elevated: 'oklch(0.24 0.04 30)', // #4A362D slightly lighter brown
      hover: 'oklch(0.28 0.05 32)', // hover state
    },

    // Text colors (Vintage Sunset theme)
    text: {
      primary: 'oklch(0.96 0.02 80)', // #F5F5DC creamy beige
      secondary: 'oklch(0.78 0.06 50)', // #D2B48C muted light brown
      tertiary: 'oklch(0.60 0.08 45)', // darker muted brown
    },

    // Border colors (warm browns)
    border: {
      DEFAULT: 'oklch(0.32 0.04 35)', // subtle warm border
      focus: 'oklch(0.65 0.15 70)', // gold for focus
    },

    // Mood-specific colors (warm palette)
    mood: {
      bullish: 'oklch(0.72 0.14 75)', // warm golden-green (positive)
      bearish: 'oklch(0.45 0.15 35)', // #993300 burnt sienna/rust
      neutral: 'oklch(0.65 0.08 50)', // warm neutral beige
      volatile: 'oklch(0.70 0.16 65)', // amber/orange (warning)
      positiveSentiment: 'oklch(0.75 0.12 80)', // warm sunny yellow
      negativeSentiment: 'oklch(0.40 0.15 30)', // deep rust (negative)
    },

    // Status colors (warm palette)
    success: 'oklch(0.72 0.14 75)', // warm golden-green
    error: 'oklch(0.45 0.15 35)', // burnt rust
    warning: 'oklch(0.70 0.16 65)', // amber
    info: 'oklch(0.65 0.15 70)', // gold
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

  // Shadows (warm theme optimized)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.6)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.6)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.6)',
    glow: '0 0 20px rgb(204 153 0 / 0.3)', // warm golden glow effect
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
