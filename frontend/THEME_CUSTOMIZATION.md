# EchoMint Theme Customization Guide

All colors and theme settings for the EchoMint frontend are centralized in two main files for easy customization.

## Quick Start: Changing the Theme

### 1. Primary Colors (Brand Identity)

Edit `/app/app.css` at line 96+ (`.dark` section):

```css
.dark {
  /* Main brand color - affects buttons, links, highlights */
  --primary: oklch(0.55 0.25 280);  /* Purple - change the hue (280) to any value 0-360 */

  /* Accent color - used for secondary highlights */
  --accent: oklch(0.65 0.25 320);   /* Magenta - complements primary */

  /* Background colors */
  --background: oklch(0.12 0.01 280);  /* Very dark with purple tint */
  --card: oklch(0.18 0.015 280);       /* Slightly lighter for cards */

  /* More colors below... */
}
```

### 2. Color Format Explained

We use `oklch()` format for better color perception:
- **First number (0-1)**: Lightness (0=black, 1=white)
- **Second number (0-0.4)**: Chroma/saturation (0=gray, 0.4=vibrant)
- **Third number (0-360)**: Hue (color wheel angle)

### 3. Common Hue Values

- **Red**: 20-30
- **Orange**: 50-70
- **Yellow**: 90-110
- **Green**: 130-150
- **Cyan**: 180-200
- **Blue**: 240-260
- **Purple**: 270-290
- **Magenta**: 310-330

## Example: Change to Cyan/Blue Theme

In `/app/app.css`, change:

```css
.dark {
  --primary: oklch(0.60 0.25 200);     /* Cyan instead of purple */
  --accent: oklch(0.65 0.25 240);      /* Blue accent */
  --background: oklch(0.12 0.01 200);  /* Cyan-tinted background */
  --card: oklch(0.18 0.015 200);       /* Cyan-tinted cards */
  /* ... update other colors with same hue */
}
```

## Example: Change to Green Theme

```css
.dark {
  --primary: oklch(0.55 0.25 140);     /* Green */
  --accent: oklch(0.65 0.25 85);       /* Yellow-green accent */
  --background: oklch(0.12 0.01 140);  /* Green-tinted background */
  --card: oklch(0.18 0.015 140);       /* Green-tinted cards */
  /* ... update other colors */
}
```

## Additional Customization

### Mood Colors

Edit `/app/config/theme.ts` to customize mood-specific colors:

```typescript
mood: {
  bullish: 'oklch(0.75 0.20 130)',           // Bright green
  bearish: 'oklch(0.55 0.22 25)',            // Red/orange
  neutral: 'oklch(0.70 0.08 250)',           // Calm blue-gray
  volatile: 'oklch(0.75 0.23 60)',           // Yellow/orange
  positiveSentiment: 'oklch(0.70 0.18 85)',  // Warm yellow-green
  negativeSentiment: 'oklch(0.50 0.20 340)', // Pink-red
}
```

### Border Radius

Change the roundness of all components in `/app/app.css`:

```css
:root {
  --radius: 0.625rem;  /* Default: 10px */
  /* Try: 0.25rem (small), 1rem (large), 0 (sharp edges) */
}
```

### Typography

Edit fonts in `/app/config/theme.ts`:

```typescript
typography: {
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
}
```

## Testing Your Changes

1. Save your changes
2. The dev server will hot-reload automatically
3. Check all components: buttons, cards, badges, NFT display

## Pro Tips

- Keep consistent hue values across primary/background/card for cohesion
- Adjust lightness (first number) to control darkness
- Higher chroma (second number) = more vibrant, lower = more muted
- Test accessibility: ensure sufficient contrast for text

## Files to Edit

- **`/app/app.css`** - Main theme colors (lines 94-127)
- **`/app/config/theme.ts`** - Mood colors, spacing, typography
- Both files are heavily commented to guide you

Happy theming! 🎨
