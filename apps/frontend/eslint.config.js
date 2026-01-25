import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import nextConfig from "@package/eslint-config/next.config.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const tsconfigRootDir = resolve(__dirname)

const projectIgnores = [
  ".now/**",
  "**/*.css",
  ".changeset/**",
  "dist/**",
  "esm/**",
  "public/**",
  "tests/**",
  "scripts/**",
  ".DS_Store",
  "node_modules/**",
  "coverage/**",
  ".next/**",
  "build/**",
]

const projectConfigs = nextConfig.map((config) => {
  if (config?.languageOptions?.parserOptions) {
    return {
      ...config,
      languageOptions: {
        ...config.languageOptions,
        parserOptions: {
          ...config.languageOptions.parserOptions,
          tsconfigRootDir,
          project: resolve(tsconfigRootDir, "tsconfig.json"),
        },
      },
    }
  }

  return config
})

export default [
  {
    ignores: projectIgnores,
  },
  ...projectConfigs,
]
