import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        novem: {
          paper: '#FAF8F3',        // warm cream BG
          paperDeep: '#F2EFE7',    // slightly deeper cream
          card: '#FFFFFF',
          glass: 'rgba(255,255,255,.62)',
          ink: '#0F0F12',
          dim: '#5C5C66',
          mute: '#A1A1AA',
          line: '#15151A',
          lineSoft: '#E5E4DE',
          // aura palette (warm & subtle, no hot pink)
          aurora: '#FFD89B',       // warm honey (was hot pink)
          aquaGlow: '#A8F0E5',     // mint
          violetGlow: '#A395FF',   // periwinkle
          peach: '#FFC7AC',        // warm peach
          butter: '#FFF1AD',       // soft butter yellow
          sky: '#BEE3F8',          // soft sky blue
          // accents
          accent: '#4F46E5',
          accentHi: '#4338CA',
          lime: '#D4FF00',
          limeDeep: '#A8CC00',
          // semantic
          ok: '#65A30D',
          warn: '#D97706',
          err: '#DC2626',
          // legacy compat
          black: '#0F0F12',
          navy: '#0F0F12',
          'navy-soft': '#15151A',
          'accent-hover': '#4338CA',
          bg: '#FAF8F3',
          muted: '#5C5C66',
          border: '#15151A',
          step1: '#A395FF',
          step2: '#FF9EE5',
          step3: '#D4FF00',
          success: '#65A30D',
          warning: '#D97706',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,15,18,.06)',
        soft: '0 20px 60px -20px rgba(15,15,18,.18), 0 8px 24px -12px rgba(15,15,18,.08)',
        glowPeach: '0 30px 80px -20px rgba(255,199,172,.55), 0 12px 28px -12px rgba(255,199,172,.4)',
        glowHoney: '0 30px 80px -20px rgba(255,216,155,.55), 0 12px 28px -12px rgba(255,216,155,.4)',
        glowViolet: '0 30px 80px -20px rgba(163,149,255,.55), 0 12px 28px -12px rgba(163,149,255,.4)',
        glowLime: '0 30px 80px -20px rgba(212,255,0,.55), 0 12px 28px -12px rgba(212,255,0,.4)',
        glowMint: '0 30px 80px -20px rgba(168,240,229,.6), 0 12px 28px -12px rgba(168,240,229,.45)',
        innerSoft: 'inset 0 1px 0 rgba(255,255,255,.6), 0 1px 2px rgba(15,15,18,.05)',
      },
      borderRadius: {
        card: '24px',
        chunky: '32px',
        pill: '9999px',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
