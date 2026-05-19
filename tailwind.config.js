// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // === AURORA INTELLIGENCE PALETTE ===
        
        // Brand colors
        'aurora-teal': '#06B6D4',      // Primary: active, rain, wind, "Now"
        'aurora-violet': '#7C3AED',    // Secondary: min temps, cold, gradients
        'aurora-red': '#EF4444',       // Hot: max temps, warnings, high UV/AQI
        'aurora-emerald': '#10B981',   // Success: good AQI, low UV, live dot
        'aurora-amber': '#F59E0B',     // Caution: moderate AQI/UV

        // Remove these old dark theme colors:
        // base: {...}, cyan: {...}, aurora: {...}, purple: {...}, text: {...}, status: {...}
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'glow-teal': '0 0 20px rgba(6, 182, 212, 0.15)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.15)',
      },
      backdropBlur: {
        xl: '24px',
      }
    },
  },
  plugins: [],
}