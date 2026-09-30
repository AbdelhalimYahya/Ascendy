/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#0B1026',
        abyss: '#0E1533',
        card: '#141C3F',
        line: 'rgba(148,163,255,0.14)',
        mint: '#10D9A3',
        mintdim: '#0AB586',
        vio: '#7C6CFF',
        amberglow: '#FFB020',
        mist: '#AAB2D5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        body: ['Inter', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 40px rgba(0,0,0,0.35)',
        glow: '0 0 40px rgba(16,217,163,0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
