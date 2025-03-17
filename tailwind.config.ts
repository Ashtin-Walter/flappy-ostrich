import type { Config } from 'tailwindcss'

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
      colors: {
        'game-bg': '#87CEEB',  // Sky blue background
        'obstacle': '#2E8B57',  // Sea green for obstacles
      },
    },
  },
  plugins: [],
} satisfies Config

export default config