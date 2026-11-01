import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
const isGitHubPagesBuild = processEnv?.GITHUB_ACTIONS === 'true'
const githubRepositoryName = processEnv?.GITHUB_REPOSITORY?.split('/')[1]
const githubPagesBase = githubRepositoryName && !githubRepositoryName.toLowerCase().endsWith('.github.io')
  ? `/${githubRepositoryName}/`
  : '/'

export default defineConfig({
  // User/organization Pages uses /; project Pages uses its repository path.
  base: isGitHubPagesBuild ? githubPagesBase : '/',
  plugins: [react()],
  build: {
    target: 'es2020',
  },
})
