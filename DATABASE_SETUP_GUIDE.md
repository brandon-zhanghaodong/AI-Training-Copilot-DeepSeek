# 📊 用户注册数据库配置指南

## 🎯 目标

将用户注册信息自动保存到 Google Sheets，方便查看和管理。

---

## 📋 注册信息字段

| 字段 | 说明 | 是否必填 |
|------|------|----------|
| **姓名** | 用户姓名 | ✅ 必填 |
| **公司** | 公司名称 | ✅ 必填 |
| **微信号** | 微信号 | ✅ 必填 |
| **手机号/邮箱** | 联系方式 | ✅ 必填 |
| **注册时间** | 提交时间戳 | 自动记录 |
| **IP地址** | 用户IP | 自动记录 |
| **浏览器** | User-Agent | 自动记录 |

---

## 🚀 方法一：查看 Netlify 日志（无需配置）

### 步骤 1：登录 Netlify

访问 https://app.netlify.com 并登录

### 步骤 2：进入项目

找到并点击 `training-copilot` 项目

### 步骤 3：查看 Functions 日志

1. 点击顶部导航栏的 **Functions** 标签
2. 在列表中找到 `collect-wechat`
3. 点击进入该 Function

### 步骤 4：查看用户注册记录

1. 在 Function 详情页，找到 **Recent invocations** 部分
2. 每一条记录代表一次用户注册
3. 点击任意记录查看详细信息

### 步骤 5：查看详细数据

在日志中查找 `新用户注册信息:` 关键字，会显示：

```json
{
  "name": "张三",
  "company": "某某科技有限公司",
  "wechat": "zhangsan123",
  "contact": "13800138000",
  "timestamp": "2026-02-02T12:00:00Z",
  "ip": "123.456.789.0",
  "userAgent": "Mozilla/5.0..."
}
```

### 优点
- ✅ 无需额外配置
- ✅ 实时查看
- ✅ 包含详细信息

### 缺点
- ❌ 需要逐条查看
- ❌ 不能批量导出
- ❌ 不便于数据分析

---

## 🌟 方法二：集成 Google Sheets（推荐）

### 为什么选择 Google Sheets？

- ✅ 自动保存，无需手动复制
- ✅ 表格形式，一目了然
- ✅ 方便导出 Excel/CSV
- ✅ 可以设置邮件通知
- ✅ 支持数据分析和筛选

---

## 📝 Google Sheets 配置步骤

### 步骤 1：创建 Google Sheets

1. 访问 https://sheets.google.com
2. 点击 **空白** 创建新表格
3. 命名为 "AI培训助手用户注册数据"

### 步骤 2：设置表头

在第一行设置以下表头：

| A列 | B列 | C列 | D列 | E列 | F列 | G列 |
|-----|-----|-----|-----|-----|-----|-----|
| 姓名 | 公司 | 微信号 | 手机号/邮箱 | 注册时间 | IP地址 | 浏览器 |

### 步骤 3：获取 Sheet ID

在浏览器地址栏中，Sheet ID 是 URL 中的这一部分：

```
https://docs.google.com/spreadsheets/d/【这里是Sheet ID】/edit
```

例如：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

**复制并保存这个 ID**

---

### 步骤 4：创建 Google Cloud 项目

1. 访问 https://console.cloud.google.com
2. 点击顶部的项目下拉菜单
3. 点击 **新建项目**
4. 项目名称：`AI Training Copilot`
5. 点击 **创建**

### 步骤 5：启用 Google Sheets API

1. 在左侧菜单中，选择 **API和服务** → **库**
2. 搜索 "Google Sheets API"
3. 点击进入，然后点击 **启用**

### 步骤 6：创建服务账号

1. 在左侧菜单中，选择 **API和服务** → **凭据**
2. 点击顶部的 **创建凭据** → **服务账号**
3. 服务账号名称：`training-copilot-service`
4. 点击 **创建并继续**
5. 角色选择：**编辑者**
6. 点击 **完成**

### 步骤 7：生成密钥

1. 在服务账号列表中，点击刚创建的服务账号
2. 切换到 **密钥** 标签
3. 点击 **添加密钥** → **创建新密钥**
4. 选择 **JSON** 格式
5. 点击 **创建**

**会自动下载一个 JSON 文件，妥善保存！**

### 步骤 8：分享 Google Sheets 给服务账号

1. 打开刚才下载的 JSON 文件
2. 找到 `client_email` 字段，复制邮箱地址
   ```json
   "client_email": "training-copilot-service@xxx.iam.gserviceaccount.com"
   ```
3. 回到 Google Sheets
4. 点击右上角的 **共享** 按钮
5. 粘贴服务账号邮箱
6. 权限设置为 **编辑者**
7. **取消勾选** "通知用户"
8. 点击 **共享**

---

### 步骤 9：配置 Netlify 环境变量

1. 登录 Netlify Dashboard
2. 进入 `training-copilot` 项目
3. 点击 **Site settings** → **Environment variables**
4. 添加以下 3 个环境变量：

#### 变量 1：GOOGLE_SHEET_ID

```
Key: GOOGLE_SHEET_ID
Value: 【步骤3中复制的Sheet ID】
Scopes: All scopes
```

#### 变量 2：GOOGLE_SHEETS_CLIENT_EMAIL

```
Key: GOOGLE_SHEETS_CLIENT_EMAIL
Value: 【JSON文件中的client_email值】
Scopes: All scopes
```

#### 变量 3：GOOGLE_SHEETS_PRIVATE_KEY

```
Key: GOOGLE_SHEETS_PRIVATE_KEY
Value: 【JSON文件中的private_key值，包含 -----BEGIN PRIVATE KEY----- 等】
Scopes: All scopes
```

**注意**：`private_key` 是一个很长的字符串，包含换行符 `\n`，直接复制粘贴即可。

---

### 步骤 10：更新代码使用 Google Sheets 版本

#### 方法 A：修改前端调用（推荐）

编辑 `components/WeChatModal.tsx`，将：

```typescript
const response = await fetch('/.netlify/functions/collect-wechat', {
```

改为：

```typescript
const response = await fetch('/.netlify/functions/collect-wechat-sheets', {
```

#### 方法 B：替换后端文件

将 `netlify/functions/collect-wechat-sheets.js` 重命名为 `collect-wechat.js`

---

### 步骤 11：安装依赖

在项目根目录运行：

```bash
npm install google-spreadsheet
```

---

### 步骤 12：提交并部署

```bash
git add .
git commit -m "Add Google Sheets integration"
git push origin main
```

Netlify 会自动检测并重新部署。

---

### 步骤 13：测试

1. 访问网站
2. 填写注册表单并提交
3. 打开 Google Sheets
4. 应该能看到新增的一行数据

---

## ✅ 验证清单

- [ ] Google Sheets 已创建
- [ ] 表头已设置（7列）
- [ ] Google Cloud 项目已创建
- [ ] Google Sheets API 已启用
- [ ] 服务账号已创建
- [ ] JSON 密钥已下载
- [ ] Google Sheets 已分享给服务账号
- [ ] Netlify 环境变量已配置（3个）
- [ ] 代码已更新
- [ ] 依赖已安装（google-spreadsheet）
- [ ] 代码已提交并部署
- [ ] 测试注册功能
- [ ] Google Sheets 中能看到数据

---

## 📊 查看和管理数据

### 实时查看

直接打开 Google Sheets，所有注册数据会实时显示。

### 导出数据

1. 在 Google Sheets 中，点击 **文件** → **下载**
2. 选择格式：
   - **Microsoft Excel (.xlsx)** - 推荐
   - **CSV (.csv)** - 纯文本
   - **PDF (.pdf)** - 打印版

### 数据筛选

使用 Google Sheets 的筛选功能：

1. 选中表头行
2. 点击 **数据** → **创建筛选器**
3. 点击列标题的筛选图标
4. 设置筛选条件

### 数据分析

- **统计注册人数**：使用 `=COUNTA(A:A)-1` 公式
- **按公司分组**：使用数据透视表
- **按时间排序**：点击"注册时间"列标题

---

## 📧 设置邮件通知（可选）

### 使用 Google Sheets 内置通知

1. 在 Google Sheets 中，点击 **工具** → **通知规则**
2. 选择 **当有任何更改时**
3. 通知频率：**立即**
4. 点击 **保存**

每次有新用户注册，您会收到邮件通知。

### 使用 SendGrid 发送自定义邮件

在 `collect-wechat-sheets.js` 中添加：

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'your-email@example.com',
  from: 'noreply@yourdomain.com',
  subject: '新用户注册 - AI培训助手',
  text: `
    新用户信息：
    姓名：${name}
    公司：${company}
    微信：${wechat}
    联系方式：${contact}
    注册时间：${timestamp}
  `
});
```

---

## 🔐 数据安全

### 当前安全措施

1. **HTTPS 加密传输** - 所有数据通过 HTTPS 传输
2. **环境变量保护** - API 凭证存储在环境变量中
3. **服务账号权限** - 只有特定服务账号可以访问
4. **Google Sheets 权限** - 只有您和服务账号可以访问

### 建议的额外措施

1. **定期备份数据** - 定期导出备份
2. **设置访问权限** - 限制 Google Sheets 的访问权限
3. **数据保留政策** - 定期清理过期数据
4. **遵守法规** - 遵守 GDPR、个人信息保护法等

---

## 🛠️ 故障排查

### 问题 1：Google Sheets 中没有数据

**检查清单**：
- [ ] 环境变量是否正确配置
- [ ] 服务账号邮箱是否已分享 Sheets
- [ ] Netlify 是否重新部署
- [ ] 浏览器控制台是否有错误

**解决方法**：
1. 检查 Netlify Functions 日志
2. 查看是否有错误信息
3. 确认环境变量格式正确

### 问题 2：private_key 格式错误

**症状**：显示 "Invalid private key" 错误

**解决方法**：
1. 确保复制了完整的 private_key（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
2. 保留所有的 `\n` 换行符
3. 不要添加额外的引号或空格

### 问题 3：权限不足

**症状**：显示 "Permission denied" 错误

**解决方法**：
1. 确认 Google Sheets 已分享给服务账号
2. 确认权限设置为"编辑者"
3. 重新分享一次

---

## 📞 技术支持

如需帮助：

1. 查看 Netlify Functions 日志
2. 查看浏览器控制台错误
3. 查看 Google Cloud 日志
4. 参考 Google Sheets API 文档：https://developers.google.com/sheets/api

---

## 📋 快速参考

### 环境变量

```
GOOGLE_SHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
GOOGLE_SHEETS_CLIENT_EMAIL = "xxx@xxx.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n..."
```

### 表头格式

```
姓名 | 公司 | 微信号 | 手机号/邮箱 | 注册时间 | IP地址 | 浏览器
```

### 数据示例

```
张三 | 某某科技 | zhangsan123 | 13800138000 | 2026-02-02T12:00:00Z | 123.456.789.0 | Mozilla/5.0...
```

---

**配置完成后，所有用户注册信息将自动保存到 Google Sheets，方便您随时查看和管理！**

**最后更新**: 2026-02-02  
**文档版本**: 2.0
