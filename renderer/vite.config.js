import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

const require = createRequire(import.meta.url)
const pin = (spec) => require.resolve(spec)

// Plans live outside this app, reached via the renderer/.plans-link symlink
// (see scripts/link-plans.mjs). Vite must be allowed to read the real target.
const repoRoot = path.resolve(import.meta.dirname, '..')
const plansTarget = process.env.VISUAL_PLAN_DIR
  ? path.resolve(process.env.VISUAL_PLAN_DIR)
  : path.join(repoRoot, 'plans')

export default defineConfig(({ command }) => ({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [
          remarkGfm,
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
  resolve: {
    // Plans import @mdx-js/react (injected by the MDX plugin) but live outside
    // this tree, so neither Rollup nor the SSR runner can walk up to find it.
    // Pin that ESM specifier in every mode. React's CJS runtime specifiers only
    // need pinning for the production build — aliasing them to absolute CJS
    // paths would break SSR/dev externalization.
    alias: {
      '@mdx-js/react': pin('@mdx-js/react'),
      ...(command === 'build'
        ? {
            'react/jsx-runtime': pin('react/jsx-runtime'),
            'react/jsx-dev-runtime': pin('react/jsx-dev-runtime'),
            react: pin('react'),
            'react-dom/client': pin('react-dom/client'),
            'react-dom': pin('react-dom'),
          }
        : {}),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5178,
    fs: {
      // this app + repo root + the (possibly external) plans target
      allow: ['.', repoRoot, plansTarget],
    },
  },
}))
