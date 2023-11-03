/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 'primary-green': '#50FF6C',
        'dark-bg': '#0E1525',
        'dark-bg-2': '#1C2333',
        'dark-hover': '#2B3245'
      },
      gridTemplateColumns: {
        sidebar: "300px auto", //for sidebar layout
        "sidebar-collapsed": "64px auto", //for sidebar layout
      },

    },
  },
  plugins: [],
}

