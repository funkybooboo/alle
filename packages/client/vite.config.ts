import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv, defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [tailwindcss(), sveltekit()],
        server: {
            port: Number(env.VITE_PORT) || 3000,
        },
    };
});
