# AI Training Copilot - DeepSeek Version 🚀

企业培训 AI 助手 - 使用 DeepSeek API

## ✨ 功能特性

- 📝 **课程生成器**: 智能生成结构化课程大纲
- ❓ **测验生成器**: 从文本/PDF 生成试题，支持导出 CSV
- 📊 **反馈分析**: 情感分析、关键词提取、改进建议
- ✍️ **运营文案助手**: 生成培训通知、预热文案等

## 🛠 技术栈

- **前端**: React 19 + TypeScript + Vite
- **UI**: TailwindCSS
- **图表**: Recharts
- **AI API**: DeepSeek API
- **部署**: Vercel

## 🔑 环境变量

```bash
VITE_DEEPSEEK_API_KEY=sk-0c0b90a202cc46fd8932b4f4e451b5c5
```

## 💻 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000

# 构建生产版本
npm run build
```

## 🚀 部署到 Vercel

### 方式一：一键部署

点击下面的按钮一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brandon-zhanghaodong/AI-Training-Copilot-DeepSeek&env=DEEPSEEK_API_KEY&envDescription=DeepSeek%20API%20Key&project-name=ai-training-copilot-deepseek)

### 方式二：手动部署

1. 访问 https://vercel.com/new
2. 导入此仓库
3. 添加环境变量：
   ```
   Name: DEEPSEEK_API_KEY
   Value: sk-0c0b90a202cc46fd8932b4f4e451b5c5
   ```
4. 点击 Deploy

## 📝 项目说明

这是 **AI Training Copilot** 的 **DeepSeek 版本**，使用 DeepSeek API 替代 Google Gemini API。

### 版本对比

| 特性 | Gemini 版本 | DeepSeek 版本 |
|------|-------------|---------------|
| AI 模型 | Google Gemini | DeepSeek Chat |
| API 提供商 | Google | DeepSeek |
| 功能 | 完全相同 | 完全相同 |
| 仓库 | [AI-Training-Copilot](https://github.com/brandon-zhanghaodong/AI-Training-Copilot) | 当前仓库 |

## 🌍 访问

- **中国大陆**: ✅ 完全可访问
- **全球其他地区**: ✅ 完全可访问

## 📄 License

MIT

---

**配置完成时间**: 2026-02-02  
**原版本仓库**: https://github.com/brandon-zhanghaodong/AI-Training-Copilot
