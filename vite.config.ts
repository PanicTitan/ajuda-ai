import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        plugins: [
            // basicSsl(),
            react(),
            tailwindcss(),
            VitePWA({
                manifestFilename: "manifest.json",
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                useCredentials: true,
                includeAssets: ['/ajuda-ai-icon.png'],
                workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
        },
                manifest: {
                    name: 'Ajuda Ai',
                    short_name: 'Ajuda Ai',
                    description: 'Your intelligent academic assistant.',
                    theme_color: '#000000',
                    background_color: '#ffffff',
                    display: 'fullscreen',
                    start_url: '/',
                    icons: [
                        {
                            src: '/ajuda-ai-icon.png',
                            sizes: '1024x1024',
                            type: 'image/png'
                        },
                        {
                            src: '/ajuda-ai-icon.png',
                            sizes: '512x512',
                            type: 'image/png'
                        },
                        {
                            src: '/ajuda-ai-icon.png',
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any maskable'
                        }
                    ]
                },
                devOptions: {
                    enabled: true, // This enables PWA in development
                    type: 'module', // Optional: 'module' or 'classic'
                },
            })
        ],
        define: {
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            hmr: process.env.DISABLE_HMR !== 'true',
        },
    };
});
