import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        border: '#2f2f2f',
        canvas: '#0f1c24',      
        card: '#0A1821',
        ink: '#e6edf3',           
        muted: '#9fb3c8',         
        stroke: '#213745',        
        primary: '#ff3b3b',       
        secondary: '#0eb6b6',     
        accent: '#f4d23c',   
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 10px 25px rgba(0,0,0,0.35)'
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [ 
    require('tailwind-scrollbar-hide'),
  ],
} satisfies Config;