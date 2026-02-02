# 🚀 部署指南 - AI Training Copilot DeepSeek Version

## 快速部署到 Vercel

### 方式一：一键部署（推荐）

点击下面的按钮，自动部署到 Vercel：

```
https://vercel.com/new/clone?repository-url=https://github.com/brandon-zhanghaodong/AI-Training-Copilot-DeepSeek&env=DEEPSEEK_API_KEY&envDescription=DeepSeek%20API%20Key&project-name=ai-training-copilot-deepseek
```

**环境变量配置**：
```
Name: DEEPSEEK_API_KEY
Value: sk-0c0b90a202cc46fd8932b4f4e451b5c5
```

### 方式二：从 Vercel Dashboard 部署

1. 访问 https://vercel.com/new
2. 导入仓库：`https://github.com/brandon-zhanghaodong/AI-Training-Copilot-DeepSeek`
3. 添加环境变量：
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-0c0b90a202cc46fd8932b4f4e451b5c5`
4. 点击 "Deploy"

### 方式三：使用 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 克隆仓库
git clone https://github.com/brandon-zhanghaodong/AI-Training-Copilot-DeepSeek.git
cd AI-Training-Copilot-DeepSeek

# 4. 部署
vercel

# 5. 添加环境变量
vercel env add DEEPSEEK_API_KEY
# 输入: sk-0c0b90a202cc46fd8932b4f4e451b5c5

# 6. 部署到生产环境
vercel --prod
```

## 预期部署时间

- **构建时间**: 约 1-2 分钟
- **总部署时间**: 约 2-3 分钟

## 部署后

部署成功后，您将获得一个类似以下格式的 URL：
- `https://ai-training-copilot-deepseek.vercel.app`
- 或 `https://ai-training-copilot-deepseek-<random>.vercel.app`

此 URL 可以直接分享给用户使用！

## 功能验证

部署后，请测试以下功能：
1. ✅ 课程生成器
2. ✅ 测验生成器
3. ✅ 反馈分析
4. ✅ 运营文案助手

## 中国访问

- ✅ Vercel 在中国大陆可访问
- ✅ DeepSeek API 在中国可用
- ✅ 无需 VPN 或代理

## 技术支持

如有问题，请访问：
- GitHub: https://github.com/brandon-zhanghaodong/AI-Training-Copilot-DeepSeek/issues
- 原版本: https://github.com/brandon-zhanghaodong/AI-Training-Copilot
