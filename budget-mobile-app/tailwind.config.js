/** @type {import('tailwindcss').Config} */
const tokens = require('./src/theme/tokens');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        accent: tokens.colors.accent,
      },
      backgroundImage: {
        'gradient-primary': `linear-gradient(to right, ${tokens.colors.gradientStart}, ${tokens.colors.gradientEnd})`,
      },
      fontFamily: {
        sans: tokens.fontFamily.sans,
      },
      fontWeight: {
        light: tokens.fontWeights.light,
        regular: tokens.fontWeights.regular,
        bold: tokens.fontWeights.bold,
      },
      fontSize: {
        h1: tokens.fontSizes.h1,
        h2: tokens.fontSizes.h2,
        h3: tokens.fontSizes.h3,
        base: tokens.fontSizes.body,
        caption: tokens.fontSizes.caption,
      },
      spacing: tokens.spacing,
    },
  },
  plugins: [],
} 