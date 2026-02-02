import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 支持多种环境变量命名方式，按优先级查找
    const apiKey = env.DEEPSEEK_API_KEY || 
                   env.API_KEY ||  // 兼容原始命名
                   env.VITE_DEEPSEEK_API_KEY || 
                   process.env.DEEPSEEK_API_KEY ||
                   process.env.API_KEY;  // 兼容原始命名
    
    console.log('🔍 Checking environment variables...');
    console.log('DEEPSEEK_API_KEY:', env.DEEPSEEK_API_KEY ? '✅ Found' : '❌ Not found');
    console.log('API_KEY:', env.API_KEY ? '✅ Found' : '❌ Not found');
    console.log('VITE_DEEPSEEK_API_KEY:', env.VITE_DEEPSEEK_API_KEY ? '✅ Found' : '❌ Not found');
    
    if (apiKey) {
      console.log('✅ API Key loaded successfully');
    } else {
      console.warn('⚠️ No API Key found. Please set DEEPSEEK_API_KEY or API_KEY');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 定义多个变量以确保兼容性
        'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.DEEPSEEK_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.API_KEY': JSON.stringify(apiKey),
        'process.env.DEEPSEEK_API_KEY': JSON.stringify(apiKey),
        'process.env.API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
