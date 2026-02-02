# 📊 用户注册数据查看指南

## 🔍 如何查看注册用户信息

### 方法 1：Netlify Dashboard（推荐）

1. **登录 Netlify**
   - 访问：https://app.netlify.com
   - 使用您的账号登录

2. **进入项目**
   - 找到项目：`training-copilot`
   - 点击进入项目详情

3. **查看 Functions 日志**
   - 点击顶部导航栏的 **Functions** 标签
   - 在列表中找到 `collect-wechat`
   - 点击进入该 Function

4. **查看用户提交记录**
   - 在 Function 详情页，找到 **Recent invocations** 部分
   - 每一条记录代表一次用户提交
   - 点击任意记录查看详细信息

5. **查看详细数据**
   - 在日志中查找 `新用户信息收集:` 关键字
   - 会显示以下信息：
     ```json
     {
       "wechat": "用户微信号",
       "name": "用户姓名",
       "company": "公司名称",
       "timestamp": "2026-02-02T12:00:00Z",
       "ip": "用户IP地址",
       "userAgent": "浏览器信息"
     }
     ```

---

### 方法 2：使用 Netlify CLI

如果您安装了 Netlify CLI，可以使用命令行查看日志：

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 查看 Function 日志
netlify functions:log collect-wechat
```

---

### 方法 3：导出到 CSV（手动）

1. 在 Netlify Dashboard 中查看每条日志
2. 手动复制用户信息
3. 整理到 Excel 或 Google Sheets

**建议格式**：

| 微信号 | 姓名 | 公司 | 提交时间 | IP地址 |
|--------|------|------|----------|--------|
| xxx | xxx | xxx | 2026-02-02 12:00 | xxx.xxx.xxx.xxx |

---

## 🚀 自动化方案：集成 Google Sheets

如果您希望自动保存用户数据到 Google Sheets，可以按照以下步骤操作：

### 步骤 1：创建 Google Sheets

1. 访问 https://sheets.google.com
2. 创建新表格，命名为"AI培训助手用户数据"
3. 设置表头：
   - A1: 微信号
   - B1: 姓名
   - C1: 公司
   - D1: 提交时间
   - E1: IP地址

### 步骤 2：获取 Google Sheets API 凭证

1. 访问 https://console.cloud.google.com
2. 创建新项目或选择现有项目
3. 启用 Google Sheets API
4. 创建服务账号
5. 下载 JSON 凭证文件

### 步骤 3：配置 Netlify 环境变量

在 Netlify Dashboard 中添加：

```
GOOGLE_SHEETS_PRIVATE_KEY = "您的私钥"
GOOGLE_SHEETS_CLIENT_EMAIL = "服务账号邮箱"
GOOGLE_SHEET_ID = "表格ID"
```

### 步骤 4：更新 collect-wechat.js

在 `netlify/functions/collect-wechat.js` 中添加 Google Sheets API 调用：

```javascript
const { GoogleSpreadsheet } = require('google-spreadsheet');

// 在 handler 函数中添加
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
});

await doc.loadInfo();
const sheet = doc.sheetsByIndex[0];

await sheet.addRow({
  '微信号': wechat,
  '姓名': name || '未提供',
  '公司': company,
  '提交时间': timestamp,
  'IP地址': event.headers['x-forwarded-for']
});
```

### 步骤 5：安装依赖

```bash
npm install google-spreadsheet
```

---

## 📱 实时通知（可选）

### 方案 1：邮件通知

使用 SendGrid 或其他邮件服务，在用户提交后发送邮件通知：

```javascript
// 在 collect-wechat.js 中添加
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'your-email@example.com',
  from: 'noreply@yourdomain.com',
  subject: '新用户注册 - AI培训助手',
  text: `新用户信息：\n微信：${wechat}\n姓名：${name}\n公司：${company}`
});
```

### 方案 2：微信通知

使用企业微信机器人或个人微信 API（需要第三方服务）。

---

## 🔐 数据安全

### 当前安全措施

1. **HTTPS 加密传输**
   - 所有数据通过 HTTPS 传输
   - Netlify 自动提供 SSL 证书

2. **环境变量保护**
   - API Key 存储在环境变量中
   - 不会暴露在前端代码

3. **日志访问控制**
   - 只有 Netlify 账号所有者可以查看日志
   - 需要登录才能访问

### 建议的额外措施

1. **数据加密**
   - 对敏感信息进行加密存储
   - 使用 AES 或 RSA 加密

2. **访问审计**
   - 记录谁查看了用户数据
   - 定期审查访问日志

3. **数据保留政策**
   - 定期清理过期数据
   - 遵守数据保护法规（如 GDPR）

---

## 📋 数据统计

### 查看统计信息

在 Netlify Dashboard 中：

1. Functions → collect-wechat
2. 查看 **Invocations** 图表
3. 可以看到：
   - 总提交次数
   - 每日提交趋势
   - 成功率

---

## 🛠️ 故障排查

### 问题 1：看不到日志

**原因**：日志可能需要几分钟才能显示

**解决**：
- 等待 5-10 分钟
- 刷新页面
- 检查 Function 是否成功执行

### 问题 2：日志信息不完整

**原因**：日志可能被截断

**解决**：
- 点击 "View full log" 查看完整日志
- 使用 Netlify CLI 查看

### 问题 3：无法导出数据

**原因**：Netlify 不提供批量导出功能

**解决**：
- 手动复制粘贴
- 集成 Google Sheets（推荐）
- 使用自己的数据库

---

## 📞 联系支持

如需帮助，可以：

1. 查看 Netlify 文档：https://docs.netlify.com
2. 联系 Netlify 支持：https://www.netlify.com/support
3. 查看本项目的 GitHub Issues

---

## ✅ 快速检查清单

- [ ] 能够登录 Netlify Dashboard
- [ ] 能够找到 training-copilot 项目
- [ ] 能够访问 Functions 标签
- [ ] 能够查看 collect-wechat 日志
- [ ] 能够看到用户提交的信息
- [ ] （可选）已集成 Google Sheets
- [ ] （可选）已设置邮件通知

---

**最后更新**: 2026-02-02  
**文档版本**: 1.0
