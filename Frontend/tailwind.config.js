/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs:  '480px',
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2e7d32',
          light:   '#4caf50',
          dark:    '#1b5e20',
        },
        accent:  '#ff5722',
        navy: {
          DEFAULT: '#1a2d5a',
          mid:     '#243a72',
          light:   '#2e4a8a',
        },
        cream:       '#faf9f7',
        'home-slate':'#f2f3f5',
        olive: {
          50:  '#f4f7ec',
          100: '#e8f0d0',
          200: '#d4e8a8',
          300: '#a8c870',
          400: '#7a9a50',
          500: '#5a8a20',
          600: '#4a6a1a',
          700: '#3a5a10',
          800: '#2e4a0e',
          900: '#1a2a08',
        },
        beige: {
          50:  '#fafaf7',
          100: '#f5f2ea',
          200: '#f0ede6',
          300: '#eae6de',
          400: '#e8e4d8',
          500: '#d8d4cc',
          600: '#c8d4b8',
          700: '#b0b8a0',
        },
        charcoal: {
          DEFAULT: '#1c1c1c',
          light:   '#2a2a2a',
        },
        ink: {
          DEFAULT: '#111108',
          light:   '#1a1a0a',
          muted:   '#5a5a48',
          subtle:  '#8a8a6a',
        },
        lime: '#c8f040',
      },
      fontFamily: {
        sans:     ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        inter:    ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        playfair: ["'Playfair Display'", 'Georgia', 'serif'],
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marqueeScroll: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        shimmerBg: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(.95)', boxShadow: '0 0 0 0 rgba(217,119,6,.45)' },
          '70%':  { transform: 'scale(1)',   boxShadow: '0 0 0 12px rgba(217,119,6,0)' },
          '100%': { transform: 'scale(.95)', boxShadow: '0 0 0 0 rgba(217,119,6,0)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '.4', transform: 'scale(.7)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flashSlideIn: {
          from: { transform: 'translateX(110%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        flashSlideOut: {
          from: { transform: 'translateX(0)',    opacity: '1' },
          to:   { transform: 'translateX(110%)', opacity: '0' },
        },
        spinAnim: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up':      'fadeUp 0.55s ease forwards',
        'fade-up-d1':   'fadeUp 0.55s ease 0.07s both',
        'fade-up-d2':   'fadeUp 0.55s ease 0.14s both',
        'fade-up-d3':   'fadeUp 0.55s ease 0.21s both',
        'fade-in-late': 'fadeIn 1s ease 1s both',
        'marquee':      'marqueeScroll 32s linear infinite',
        'shimmer-bg':   'shimmerBg 3s linear infinite',
        'pulse-ring':   'pulseRing 3s ease infinite',
        'live-pulse':   'livePulse 1.4s ease infinite',
        'slide-down':   'slideDown 0.2s ease',
        'flash-slide':  'flashSlideIn 0.3s ease',
        'spin-slow':    'spinAnim 0.8s linear infinite',
        'fade-in':      'fadeIn 0.5s ease',
      },
    },
  },
  plugins: [],
}
