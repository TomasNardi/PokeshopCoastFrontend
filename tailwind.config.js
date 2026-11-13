/**
 * Tokens de diseño.
 *
 * - `coast.*`: paleta de la marca (sale del logo del cliente; el logo no se usa).
 * - `uns.*`:   neutros del sistema de UI (calcado del tema Broadcast que usa
 *              unsobremas.com): fondo #FCFCFC, escenario de producto #F2F2F2,
 *              texto negro, grises de links y categorías.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  // Las clases hover: solo aplican con mouse (@media (hover: hover) and (pointer: fine)),
  // igual que los :hover de globals.css: en táctil un toque es un clic, no un hover.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        coast: {
          cream: '#F7F1E6',
          'cream-deep': '#F1E8D7',
          sand: '#E8D8BC',
          'sand-dark': '#D4BC94',
          white: '#FFFFFF',
          ink: '#2F2D2C',
          gray: '#6F6963',
          mist: '#ADA59A',
          line: '#E5DAC6',
          red: '#E2574C',
          'red-dark': '#C9443A',
          'red-soft': '#F8DCD6',
        },
        uns: {
          bg: '#FCFCFC',
          stage: '#F2F2F2',
          text: '#000000',
          muted: '#747474',
          link: '#808080',
          hairline: '#EAEAEA',
          border: '#CCCCCC',
        },
      },
      fontFamily: {
        // Mismas familias que unsobremas (Google Fonts, licencia OFL).
        sans: ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif'],
        heading: ['var(--font-roboto-condensed)', '"Roboto Condensed"', 'sans-serif'],
        display: ['var(--font-roboto-condensed)', '"Roboto Condensed"', 'sans-serif'],
        barlow: ['var(--font-barlow-condensed)', '"Barlow Condensed"', 'sans-serif'],
      },
      maxWidth: {
        site: '1400px',
      },
      spacing: {
        outer: 'var(--outer)',
        header: 'var(--header-height)',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 14px 34px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
