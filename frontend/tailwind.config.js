module.exports = {
    theme: {
      extend: {
        animation: {
          'spin-slow': 'spin 4s linear infinite',
          'wiggle': 'wiggle 1s ease-in-out infinite',
        },
        keyframes: {
          wiggle: {
            '0%, 100%': { transform: 'rotate(-3deg)' },
            '50%': { transform: 'rotate(3deg)' },
          },
        },
      },
    },
  };
  