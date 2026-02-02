// 集成 Google Sheets 的版本
// 需要配置环境变量：GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEET_ID

const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { wechat, name, company, contact, timestamp } = body;

    // 验证必填字段
    if (!wechat || !name || !company || !contact) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '请填写所有必填字段' })
      };
    }

    // 记录到日志
    console.log('新用户注册信息:', {
      name,
      company,
      wechat,
      contact,
      timestamp: timestamp || new Date().toISOString(),
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip']
    });

    // 保存到 Google Sheets（如果配置了环境变量）
    if (process.env.GOOGLE_SHEET_ID && 
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL && 
        process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      
      try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        
        await doc.useServiceAccountAuth({
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // 使用第一个工作表

        // 添加新行
        await sheet.addRow({
          '姓名': name,
          '公司': company,
          '微信号': wechat,
          '手机号/邮箱': contact,
          '注册时间': timestamp || new Date().toISOString(),
          'IP地址': event.headers['x-forwarded-for'] || event.headers['client-ip'],
          '浏览器': event.headers['user-agent']
        });

        console.log('✅ 数据已保存到 Google Sheets');
      } catch (sheetError) {
        console.error('Google Sheets 保存失败:', sheetError);
        // 即使 Sheets 保存失败，也返回成功（因为日志已记录）
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '信息已收集，感谢您的支持！'
      })
    };

  } catch (error) {
    console.error('处理错误:', error);
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
