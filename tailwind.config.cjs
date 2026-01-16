/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hp: {
          bg: '#0a0a0b',                    // --bg
          'bg-elevated': '#141416',         // --bg-elevated
          'bg-surface': '#1c1c1f',         // --bg-surface
          'bg-hover': '#242428',           // --bg-hover
          surface: '#1c1c1f',              // alias for bg-surface
          accent: '#29e33c',               // --accent
          'accent-hover': '#22c55e',       // --accent-hover
          'accent-success': '#4ade80',     // --accent-success
          'accent-warning': '#fbbf24',     // --accent-warning
          'accent-danger': '#f87171',      // --accent-danger
          text: 'rgba(255, 255, 255, 0.92)',  // --text
          'text-secondary': 'rgba(255, 255, 255, 0.70)',  // --text-secondary
          'text-muted': 'rgba(255, 255, 255, 0.50)',  // --text-muted
          'text-accent': '#29e33c',        // --text-accent
          text2: 'rgba(255, 255, 255, 0.70)',  // alias for text-secondary
          muted: 'rgba(255, 255, 255, 0.70)',  // alias for text-secondary
          border: 'rgba(255, 255, 255, 0.10)',  // --border
          'border-subtle': 'rgba(255, 255, 255, 0.06)',  // --border-subtle
          'border-strong': 'rgba(255, 255, 255, 0.15)',  // --border-strong
          'border-focus': '#29e33c',       // --border-focus
        },
      },
      boxShadow: {
        'glow-soft': '0 0 20px rgba(41, 227, 60, 0.12)',
        'glow-strong': '0 0 30px rgba(41, 227, 60, 0.35)',
        'glow': '0 0 20px rgba(41, 227, 60, 0.35), 0 0 40px rgba(41, 227, 60, 0.14)',
      },
      borderRadius: {
        card: '24px',  // --radius-lg
        pill: '999px',  // --radius-full
      },
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
      },
      width: {
        canvas: '430px',
      },
      height: {
        canvas: '932px',
      },
    },
  },
  plugins: [],
}
