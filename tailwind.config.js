/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0F1117',
        surface:  '#1A1D27',
        border:   '#2A2D3A',
        teal:     '#00C2A8',
        text:     '#E8EAF0',
        muted:    '#8A8FA0',
      },
    },
  },
  plugins: [],
};
