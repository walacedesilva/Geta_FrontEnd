/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de Roxo Primário
        'primary': {
          '50': '#f5f0fd',
          '100': '#ebe0fa',
          '200': '#d8c1f5',
          '300': '#c4a2f0',
          '400': '#b183eb',
          '500': '#9d64e6',
          '600': '#8a45e0',
          '700': '#7626da',
          '800': '#6307d5',
          '900': '#4F00BC', // Cor primária fornecida
          '950': '#2e006d',
        },
        // Paleta de Roxo Secundário
        'secondary': {
          '50': '#f8f2fc',
          '100': '#f1e6f9',
          '200': '#e4cdf4',
          '300': '#d6b3ef',
          '400': '#c99aeb',
          '500': '#bb81e6',
          '600': '#ac68e1',
          '700': '#9e4fdc',
          '800': '#9036d7',
          '900': '#7522B6', // Cor secundária fornecida
          '950': '#581a89',
        },
        // Paleta de Laranja para botões e detalhes
        'accent': {
          '50': '#fff8f2',
          '100': '#fff1e6',
          '200': '#ffe2cc',
          '300': '#ffd4b3',
          '400': '#ffc599',
          '500': '#ffb780',
          '600': '#ffa866',
          '700': '#ff9a4d',
          '800': '#ff8b33',
          '900': '#FF6D00', // Cor do botão fornecida
          '950': '#e66200',
        },
        // Cor de fundo clara
        'light': '#F4F5F7',
      }
    },
    fontFamily: {
      sans: ['Poppins', 'Inter', 'sans-serif'],
    },
  },
  plugins: [],
}
