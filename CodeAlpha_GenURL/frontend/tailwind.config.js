/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand palette
        'dark-brown':  '#622B14',
        'mid-brown':   '#995F2F',
        'warm-beige':  '#978F66',
        'light-cream': '#E4D6A9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'bounce-in':  'bounceIn 0.6s ease-out',
        'glow':       'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(153, 95, 47, 0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(153, 95, 47, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #622B14 0%, #995F2F 50%, #978F66 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(98,43,20,0.8) 0%, rgba(153,95,47,0.6) 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, #995F2F 0%, #622B14 100%)',
      },
      boxShadow: {
        'brand':    '0 8px 32px rgba(98, 43, 20, 0.4)',
        'card':     '0 20px 60px rgba(98, 43, 20, 0.3)',
        'input':    '0 4px 20px rgba(98, 43, 20, 0.2)',
        'glow-btn': '0 0 30px rgba(153, 95, 47, 0.5)',
      },
    },
  },
  plugins: [],
}
