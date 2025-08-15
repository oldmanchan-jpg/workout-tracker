
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#73C98A', // Vespa Verde-like accent
          brown: '#7B5E57',
        }
      },
      borderRadius: {
        '2xl': '1rem'
      },
      boxShadow: {
        soft: '0 10px 25px rgba(0,0,0,0.05)'
      }
    },
  },
  plugins: [],
} satisfies Config
