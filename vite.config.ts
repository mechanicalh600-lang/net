
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/net/', // تنظیم دقیق برای مخزن https://github.com/mechanicalh600-lang/net
});
