import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 支持多种环境变量命名方式
    const deepseekApiKey = env.VITE_DEEPSEEK_API_KEY || 
                          env.DEEPSEEK_API_KEY || 
                          process.env.DEEPSEEK_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 同时定义多个变量以确保兼容性
        'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(deepseekApiKey),
        'import.meta.env.DEEPSEEK_API_KEY': JSON.stringify(deepseekApiKey),
        'process.env.DEEPSEEK_API_KEY': JSON.stringify(deepseekApiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
