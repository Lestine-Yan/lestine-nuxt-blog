/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"ZCOOL KuaiLe"', 'system-ui', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      width: {
        'full-no-scrollbar': 'calc(100dvw - 8px)',
      },
    },
  },
  plugins: [],
}
