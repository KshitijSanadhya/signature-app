/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0f0e0c',
        surface: '#181715',
        surface2: '#211f1c',
        surface3: '#2a2825',
        border: '#333028',
        border2: '#403d38',
        gold: '#c9a84c',
        gold2: '#e8c96a',
        cream: '#f5f0e8',
        muted: '#8a8070',
      },
    },
  },
  plugins: [],
}
