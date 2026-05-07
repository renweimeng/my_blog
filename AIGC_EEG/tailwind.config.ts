import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          'Microsoft YaHei',
          'Noto Sans CJK SC',
          'system-ui',
          'sans-serif'
        ]
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        cyan: '0 0 28px rgba(34, 211, 238, 0.22)',
        danger: '0 0 30px rgba(248, 81, 73, 0.28)'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' }
        },
        pulseBorder: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' }
        },
        softGlow: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(14, 165, 233, 0.12)' },
          '50%': { boxShadow: '0 0 28px rgba(248, 81, 73, 0.3)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.8s linear infinite',
        pulseBorder: 'pulseBorder 1.4s ease-in-out infinite',
        softGlow: 'softGlow 2.2s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
