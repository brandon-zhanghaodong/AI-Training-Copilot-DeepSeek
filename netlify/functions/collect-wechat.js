exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解析请求体
    const body = JSON.parse(event.body);
    const { wechat, name, company, contact, timestamp } = body;

    if (!wechat) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请提供微信号' })
      };
    }

    if (!name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请提供姓名' })
      };
    }

    if (!company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请提供公司名称' })
      };
    }

    if (!contact) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请提供手机号或邮箱' })
      };
    }

    // 记录到日志（Netlify 会保存这些日志）
    const userData = {
      name,
      company,
      wechat,
      contact,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip']
    };
    
    console.log('='.repeat(60));
    console.log('🎉 新用户注册信息');
    console.log('='.repeat(60));
    console.log('👤 姓名:', name);
    console.log('🏢 公司:', company);
    console.log('📱 微信:', wechat);
    console.log('📧 联系方式:', contact);
    console.log('🕒 注册时间:', userData.timestamp);
    console.log('🌍 IP地址:', userData.ip);
    console.log('='.repeat(60));
    console.log('JSON 数据:', JSON.stringify(userData, null, 2));
    console.log('='.repeat(60));

    // 可选：发送到 Google Sheets 或其他服务
    // 这里可以添加 Google Sheets API 调用
    // 或者使用 Netlify Forms 的 API

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '信息已收集，感谢您的支持！'
      })
    };

  } catch (error) {
    console.error('微信收集错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '信息收集失败: ' + error.message
      })
    };
  }
};
