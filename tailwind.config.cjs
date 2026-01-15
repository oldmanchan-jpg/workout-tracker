/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hp: {
          bg: '#010101',
          surface: '#292b2c',
          surface2: '#171a19',
          accent: '#29e33c',
          text: 'rgba(255,255,255,0.92)',
          text2: 'rgba(255,255,255,0.70)',
          border: 'rgba(255,255,255,0.06)',
        },
      },
      boxShadow: {
        'glow-soft': '0 0 20px rgba(41, 227, 60, 0.18)',
        'glow-strong': '0 0 30px rgba(41, 227, 60, 0.35)',
      },
      borderRadius: {
        card: '24px',
        pill: '999px',
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
