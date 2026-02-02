import React, { useState } from 'react';
import { generateQuiz } from '../services/deepseekService';
import { QuizItem } from '../types';

const QuizGen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('中等');
  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedText, setParsedText] = useState('');
  const [parseStatus, setParseStatus] = useState(''); // 解析状态提示

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove "data:application/pdf;base64," prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const parsePDF = async (base64Data: string): Promise<string> => {
    try {
      setParseStatus('📄 正在解析 PDF...');
      
      const response = await fetch('/.netlify/functions/parse-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Data })
      });

      const data = await response.json();

      if (data.success) {
        const cacheInfo = data.cached ? ' (缓存)' : '';
        setParseStatus(`✅ 解析完成: ${data.pages} 页, ${data.characters} 字符, ${data.parseTime}ms${cacheInfo}`);
        console.log(`✅ PDF 解析成功: ${data.pages} 页, ${data.parseTime}ms`);
        
        // 2秒后清除状态
        setTimeout(() => setParseStatus(''), 2000);
        
        return data.text;
      } else {
        throw new Error(data.error || 'PDF 解析失败');
      }
    } catch (error) {
      console.error('PDF 解析错误:', error);
      setParseStatus('❌ 解析失败');
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        // 检查文件大小
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
          alert('🚨 文件过大！请使用小于 20MB 的 PDF 文件。');
          return;
        }
        
        try {
          setLoading(true);
          setParseStatus('💾 正在读取文件...');
          
          // 先显示文件信息
          setFileData({ base64: '', mimeType: file.type, name: file.name });
          setInputText('');
          
          // 异步转换和解析
          const base64 = await fileToBase64(file);
          setParseStatus('🚀 正在上传并解析...');
          
          const text = await parsePDF(base64);
          
          // 更新为完整数据
          setFileData({ base64, mimeType: file.type, name: file.name });
          setParsedText(text);
          
          console.log(`✅ PDF 解析成功: ${text.length} 个字符`);
        } catch (error) {
          console.error('PDF 处理失败:', error);
          alert("解析失败，请确保 PDF 是文本版（非扫描版）");
          setFileData(null);
          setParsedText('');
          setParseStatus('');
        } finally {
          setLoading(false);
        }
      } else if (file.type === "text/plain") {
         const reader = new FileReader();
         reader.onload = (event) => {
           if (event.target?.result) {
             const text = event.target.result as string;
             setInputText(text);
             setParsedText(text);
           }
           setFileData(null);
         };
         reader.readAsText(file);
      } else {
        alert("目前仅支持 PDF 和 TXT 文件。PPT 请尝试导出为 PDF 后上传。");
      }
    }
  };

  const handleGenerate = async () => {
    const textToUse = parsedText || inputText;
    
    if (!textToUse && !fileData) {
      alert('请输入文本或上传文件');
      return;
    }
    
    setLoading(true);
    setQuizData([]);
    
    try {
      // 使用解析后的文本而不是 base64
      const input = { text: textToUse };
      const data = await generateQuiz(input, count, difficulty);
      setQuizData(data);
    } catch (e) {
      console.error('生成试题失败:', e);
      alert("生成试题失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    setParsedText('');
    // Reset file input value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const downloadCSV = () => {
    if (quizData.length === 0) return;
    
    // CSV header
    let csv = '\uFEFF题目,类型,选项A,选项B,选项C,选项D,答案,解析\n';
    
    // CSV rows
    quizData.forEach(item => {
      const row = [
        `"${item.question}"`,
        `"${item.type}"`,
        `"${item.optionA || ''}"`,
        `"${item.optionB || ''}"`,
        `"${item.optionC || ''}"`,
        `"${item.optionD || ''}"`,
        `"${item.answer}"`,
        `"${item.explanation}"`
      ].join(',');
      csv += row + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `试题_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
          <i className="fas fa-file-alt text-brand-600"></i>
          课件资料来源
        </h2>

        {/* Text Area */}
        {!fileData && (
          <div className="mb-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在此粘贴文本，或点击右下角上传 PDF..."
              className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
            />
          </div>
        )}

        {/* File Upload Display */}
        {fileData && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {loading ? (
                <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
              ) : (
                <i className="fas fa-file-pdf text-2xl text-red-500"></i>
              )}
              <div>
                <p className="text-sm font-medium text-slate-800">{fileData.name}</p>
                <p className="text-xs text-slate-500">
                  {loading && parseStatus ? (
                    <span className="text-blue-600 font-medium">
                      {parseStatus}
                    </span>
                  ) : loading ? (
                    <span className="text-blue-600">
                      <i className="fas fa-circle-notch fa-spin"></i> 解析中...
                    </span>
                  ) : parsedText ? (
                    <span className="text-green-600">
                      <i className="fas fa-check-circle"></i> 已就绪，共 {parsedText.length} 个字符
                    </span>
                  ) : (
                    '已上传'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-slate-500 hover:text-red-500 transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        )}

        {/* File Upload Button */}
        <div className="flex justify-end">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium">
            <i className="fas fa-upload"></i>
            上传 PDF
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>

        <p className="text-xs text-slate-500 mt-3 flex items-start gap-2">
          <i className="fas fa-info-circle text-brand-600 mt-0.5"></i>
          支持 PDF/TXT。PPT 请另存为 PDF 后上传。内容仅用于即时生成。
        </p>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">题目数量</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
          >
            <option value={5}>5 题</option>
            <option value={10}>10 题</option>
            <option value={15}>15 题</option>
            <option value={20}>20 题</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">难度等级</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm"
          >
            <option value="简单">简单</option>
            <option value="中等">中等</option>
            <option value="困难">困难</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || (!inputText && !fileData)}
        className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            生成中...
          </>
        ) : (
          <>
            生成试题
            <i className="fas fa-arrow-right"></i>
          </>
        )}
      </button>

      {/* Results */}
      {quizData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">生成的试题</h3>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              导出 CSV
            </button>
          </div>

          <div className="space-y-4">
            {quizData.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded">
                    {idx + 1}
                  </span>
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {item.type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-3">{item.question}</p>
                
                <div className="space-y-1 mb-3">
                  {item.optionA && <p className="text-xs text-slate-600">A. {item.optionA}</p>}
                  {item.optionB && <p className="text-xs text-slate-600">B. {item.optionB}</p>}
                  {item.optionC && <p className="text-xs text-slate-600">C. {item.optionC}</p>}
                  {item.optionD && <p className="text-xs text-slate-600">D. {item.optionD}</p>}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs text-green-700 font-semibold mb-1">
                    <i className="fas fa-check-circle"></i> 答案: {item.answer}
                  </p>
                  <p className="text-xs text-slate-600">
                    <i className="fas fa-lightbulb text-yellow-500"></i> {item.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGen;
