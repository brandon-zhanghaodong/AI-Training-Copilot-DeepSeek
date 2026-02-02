// 这个 Function 用于导出收集的用户数据
// 需要管理员密钥才能访问

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 验证管理员密钥
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const adminKey = process.env.ADMIN_KEY || 'default_admin_key_2026';
    
    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: '未授权访问' })
      };
    }

    // 注意：Netlify Functions 本身不能直接访问其他 Function 的日志
    // 这里提供一个说明文档，告诉用户如何查看数据
    
    const instructions = {
      message: '用户数据存储在 Netlify 日志中',
      howToView: [
        '1. 登录 Netlify Dashboard',
        '2. 进入项目：training-copilot',
        '3. 点击 Functions 标签',
        '4. 选择 collect-wechat',
        '5. 查看 Recent invocations',
        '6. 点击每个调用查看详细信息'
      ],
      alternativeSolution: '建议集成 Google Sheets 或数据库以便更方便地导出数据',
      dataFormat: {
        wechat: '微信号',
        name: '姓名',
        company: '公司',
        timestamp: '提交时间',
        ip: 'IP地址',
        userAgent: '浏览器信息'
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(instructions)
    };

  } catch (error) {
    console.error('导出错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '导出失败: ' + error.message
      })
    };
  }
};
