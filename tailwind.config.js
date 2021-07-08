// eslint-disable-next-line
const colors = require('tailwindcss/colors')

// eslint-disable-next-line no-undef
module.exports = {
  // mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.blueGray,
      indigo: colors.indigo,
      red: colors.rose,
      yellow: colors.amber,
      purple: colors.violet,
      pink: colors.pink,
      blue: colors.blue,
      green: colors.emerald,
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ['odd'],
      borderColor: ['odd', 'even'],
    },
  },
  plugins: [],
}
