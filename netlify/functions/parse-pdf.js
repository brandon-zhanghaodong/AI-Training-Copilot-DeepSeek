const pdfParse = require('pdf-parse');

// 简单的内存缓存（Netlify Functions 有 10 秒的执行时间限制）
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

// 生成缓存键
function getCacheKey(base64Data) {
  // 使用前 100 个字符作为简单的哈希
  return base64Data.substring(0, 100);
}

exports.handler = async (event, context) => {
  const startTime = Date.now();
  
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

    // 检查缓存
    const cacheKey = getCacheKey(base64Data);
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log('✅ 使用缓存结果');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...cached.data,
          cached: true,
          parseTime: Date.now() - startTime
        })
      };
    }

    // 将 base64 转换为 Buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // 检查文件大小（限制 20MB）
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (pdfBuffer.length > maxSize) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'PDF 文件过大，请使用小于 20MB 的文件' 
        })
      };
    }

    console.log(`📄 开始解析 PDF (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

    // 解析 PDF（优化选项）
    const data = await pdfParse(pdfBuffer, {
      max: 50, // 限制最多解析 50 页以提高速度
      pagerender: null, // 不渲染页面，只提取文本
      version: 'default'
    });

    const parseTime = Date.now() - startTime;
    console.log(`✅ PDF 解析完成: ${data.numpages} 页, ${data.text.length} 字符, 耗时 ${parseTime}ms`);

    const result = {
      success: true,
      text: data.text,
      pages: data.numpages,
      characters: data.text.length,
      parseTime
    };

    // 存入缓存
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // 清理过期缓存
    for (const [key, value] of cache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ PDF 解析错误:', error);
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
