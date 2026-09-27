import config from "./packages/config/eslint.mjs";

export default [
  ...config,
  {
    ignores: [
      "**/.next/**",
      "**/next-env.d.ts",
      "**/.qa/**",
      "**/node_modules/**",
    ],
  },
  { settings: { next: { rootDir: "apps/web" } } },
];
