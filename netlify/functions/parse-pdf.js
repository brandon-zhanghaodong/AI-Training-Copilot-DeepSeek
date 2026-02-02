const pdfParse = require('pdf-parse');

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
    const { base64Data } = body;

    if (!base64Data) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '缺少 PDF 数据' })
      };
    }

    // 将 base64 转换为 Buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // 解析 PDF
    const data = await pdfParse(pdfBuffer);

    // 返回提取的文本
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text: data.text,
        pages: data.numpages,
        info: data.info
      })
    };

  } catch (error) {
    console.error('PDF 解析错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'PDF 解析失败: ' + error.message
      })
    };
  }
};
