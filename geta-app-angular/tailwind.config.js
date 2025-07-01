/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-purple': '#1A103C',
        'primary-purple': '#4C1D95',
        'light-purple-card': '#2D1E5F',
        'accent-green': '#90EE90',
        'accent-orange': '#FF8C00',
      }
    },
  },
  plugins: [],
}
