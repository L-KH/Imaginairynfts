const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[style="color-scheme: dark;"]'],
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '2rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2.5rem' }],
      '3xl': ['2rem', { lineHeight: '2.5rem' }],
      '4xl': ['2.5rem', { lineHeight: '3rem' }],
      '5xl': ['3rem', { lineHeight: '3.5rem' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },

  daisyui: {
    themes: [
      {
        dark: {
          primary: '#676de3',
          secondary: '#67e39f',
          accent: '#e3dd67',
          neutral: '#e4e5f6',
          'base-100': '#1e272f',
          'base-200': '#141a1f',
          'base-300': '#28343e',
        },
      },
      {
        light: {
          primary: '#676de3',
          secondary: '#67e39f',
          accent: '#e3dd67',
          neutral: '#e4e5f6',
          'base-100': '#fff',
          'base-200': '#f8fafc',
          'base-300': '#f1f2fc',
          'base-content': '#1d1955',
        },
      },
      // ,
      // 'cupcake',
      // 'lofi',
      // 'cyberpunk',
    ],
  },

  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('daisyui'),
  ],
}
