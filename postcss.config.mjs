const config = {
  plugins: {
    "@tailwindcss/postcss": {
      darkMode: [
        "variant",
        [
          "@media (prefers-color-scheme: dark) { &:not(html[data-theme=light] *, [data-theme=light]) }",
          "&:is([data-theme=dark] *, html[data-theme=dark])",
        ],
      ],
    },
  },
};

export default config;
