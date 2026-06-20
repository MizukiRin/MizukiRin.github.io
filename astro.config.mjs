// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://MizukiRin.github.io', // 您的站点域名
  vite: {
    plugins: [tailwindcss()]
  }
});
