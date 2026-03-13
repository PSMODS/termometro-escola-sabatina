import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserPageRepo = repository?.toLowerCase().endsWith('.github.io');
  const base =
    process.env.GITHUB_ACTIONS === 'true' && repository && !isUserPageRepo
      ? `/${repository}/`
      : '/';

  return {
    base,
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
