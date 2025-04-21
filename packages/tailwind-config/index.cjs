/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require('tailwindcss/defaultTheme');
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['variant', '&:is(.dark:not(.dark-mode-disabled) *)'],
  content: ['src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        signature: ['var(--font-signature)'],
      },
      zIndex: {
        9999: '9999',
      },
      aspectRatio: {
        'signature-pad': '16 / 7',
      },
      colors: {
        border: 'hsl(var(--border))',
        'field-border': 'hsl(var(--field-border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#4C33FF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FF9900',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: '#F0F0F0',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#4C33FF',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        'field-card': {
          DEFAULT: '#FFFFFF',
          border: '#E5E7EB',
          foreground: '#000000',
        },
        widget: {
          DEFAULT: '#F9FAFB',
          foreground: '#111827',
        },
        documenso: {
          DEFAULT: '#4C33FF',
          50: '#FFFFFF',
          100: '#F8F7FF',
          200: '#E0DCFF',
          300: '#C7C0FF',
          400: '#AEA4FF',
          500: '#4C33FF',
          600: '#3319FF',
          700: '#1A00E6',
          800: '#1400AD',
          900: '#0E0073',
          950: '#0A0058',
        },
        dawn: {
          DEFAULT: '#000000',
          50: '#f8f8f8',
          100: '#f1f1ef',
          200: '#e6e5e2',
          300: '#d4d3cd',
          400: '#b9b7b0',
          500: '#aaa89f',
          600: '#88857a',
          700: '#706e65',
          800: '#5f5d55',
          900: '#52514a',
          950: '#000000',
        },
        water: {
          DEFAULT: '#4C33FF',
          50: '#F8F7FF',
          100: '#E0DCFF',
          200: '#C7C0FF',
          300: '#AEA4FF',
          400: '#9589FF',
          500: '#4C33FF',
          600: '#3319FF',
          700: '#1A00E6',
          800: '#1400AD',
          900: '#0E0073',
          950: '#0A0058',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        DEFAULT: 'calc(var(--radius) - 3px)',
        '2xl': 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 2px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
        print: { raw: 'print' },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    addVariablesForColors,
    function ({ addBase }) {
      addBase({
        ':root': {
          '--background': '0 0% 100%',
          '--foreground': '222.2 84% 4.9%',
          '--card': '0 0% 100%',
          '--card-foreground': '222.2 84% 4.9%',
          '--popover': '0 0% 100%',
          '--popover-foreground': '222.2 84% 4.9%',
          '--primary': '252 100% 60%',
          '--primary-foreground': '210 40% 98%',
          '--secondary': '0 0% 0%',
          '--secondary-foreground': '0 0% 100%',
          '--muted': '240 5% 94%',
          '--muted-foreground': '220 8.9% 46.1%',
          '--accent': '252 100% 60%',
          '--accent-foreground': '210 40% 98%',
          '--destructive': '0 84.2% 60.2%',
          '--destructive-foreground': '210 40% 98%',
          '--border': '214.3 31.8% 91.4%',
          '--input': '214.3 31.8% 91.4%',
          '--ring': '252 100% 60%',
          '--radius': '0.5rem',
          '--field-border': '220 13% 91%',
          '--field-card': '0 0% 100%',
          '--field-card-border': '220 13% 91%',
          '--field-card-foreground': '240 10% 3.9%',
          '--widget': '210 40% 98%',
          '--widget-foreground': '222.2 84% 4.9%',
          '--warning': '38 92% 50%',
        },
        '.dark': {
          '--background': '240 10% 3.9%',
          '--foreground': '0 0% 98%',
          '--card': '240 10% 3.9%',
          '--card-foreground': '0 0% 98%',
          '--popover': '240 10% 3.9%',
          '--popover-foreground': '0 0% 98%',
          '--primary': '252 100% 60%',
          '--primary-foreground': '210 40% 98%',
          '--secondary': '0 0% 0%',
          '--secondary-foreground': '0 0% 100%',
          '--muted': '240 3.7% 15.9%',
          '--muted-foreground': '240 5% 64.9%',
          '--accent': '252 100% 60%',
          '--accent-foreground': '0 0% 98%',
          '--destructive': '0 62.8% 30.6%',
          '--destructive-foreground': '0 0% 98%',
          '--border': '240 3.7% 15.9%',
          '--input': '240 3.7% 15.9%',
          '--ring': '252 100% 60%',
          '--field-border': '240 5.9% 90%',
          '--field-card': '240 10% 3.9%',
          '--field-card-border': '240 3.7% 15.9%',
          '--field-card-foreground': '0 0% 98%',
          '--widget': '240 3.7% 15.9%',
          '--widget-foreground': '0 0% 98%',
          '--warning': '38 92% 50%',
        },
      });
    },
  ],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ':root': newVars,
  });
}
