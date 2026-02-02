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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        try {
          const base64 = await fileToBase64(file);
          setFileData({ base64, mimeType: file.type, name: file.name });
          setInputText(''); // Clear text if file is uploaded
        } catch (error) {
          alert("文件读取失败");
        }
      } else if (file.type === "text/plain") {
         const reader = new FileReader();
         reader.onload = (event) => {
           if (event.target?.result) setInputText(event.target.result as string);
           setFileData(null);
         };
         reader.readAsText(file);
      } else {
        alert("目前仅支持 PDF 和 TXT 文件。PPT 请尝试导出为 PDF 后上传。");
      }
    }
  };

  const handleGenerate = async () => {
    if (!inputText && !fileData) return;
    setLoading(true);
    setQuizData([]);
    try {
      const input = fileData 
        ? { base64: fileData.base64, mimeType: fileData.mimeType } 
        : { text: inputText };
        
      const data = await generateQuiz(input, count, difficulty);
      setQuizData(data);
    } catch (e) {
      alert("生成试题失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFileData(null);
    // Reset file input value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const downloadCSV = () => {
    if (quizData.length === 0) return;
    const headers = ['题目', '类型', '选项A', '选项B', '选项C', '选项D', '正确答案', '解析'];
    const rows = quizData.map(q => [
      `"${q.question.replace(/"/g, '""')}"`,
      q.type,
      `"${(q.optionA || '').replace(/"/g, '""')}"`,
      `"${(q.optionB || '').replace(/"/g, '""')}"`,
      `"${(q.optionC || '').replace(/"/g, '""')}"`,
      `"${(q.optionD || '').replace(/"/g, '""')}"`,
      `"${q.answer.replace(/"/g, '""')}"`,
      `"${q.explanation.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "training_quiz.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Input Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5 transition-shadow hover:shadow-md">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide text-xs text-slate-500">
           <i className="fas fa-file-alt mr-2"></i>课件资料来源
        </h2>

        <div>
          {fileData ? (
             <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-500 shadow-sm">
                    <i className="fas fa-file-pdf text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{fileData.name}</p>
                    <p className="text-xs text-slate-500">已就绪</p>
                  </div>
                </div>
                <button onClick={clearFile} className="text-slate-400 hover:text-red-500 transition-colors">
                  <i className="fas fa-times-circle text-lg"></i>
                </button>
             </div>
          ) : (
            <div className="relative group">
               <textarea
                className="w-full p-4 text-sm border border-slate-200 rounded-xl bg-slate-50 h-32 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all placeholder:text-slate-400"
                placeholder="在此粘贴文本，或点击右下角上传 PDF..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
               <div className="absolute bottom-3 right-3">
                   <label htmlFor="file-upload" className="cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 shadow-sm text-slate-600 transition-all active:scale-95">
                      <i className="fas fa-cloud-upload-alt text-brand-500"></i> 上传 PDF
                   </label>
                   <input id="file-upload" type="file" className="hidden" accept=".pdf, .txt" onChange={handleFileUpload} />
               </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
            <i className="fas fa-info-circle text-brand-500"></i>
            <span>支持 PDF/TXT。PPT 请另存为 PDF 后上传。内容仅用于即时生成。</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">题目数量</label>
            <div className="relative">
              <select className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 appearance-none outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={count} onChange={e => setCount(Number(e.target.value))}>
                <option value="5">5 题</option>
                <option value="10">10 题</option>
                <option value="20">20 题</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  <i className="fas fa-chevron-down"></i>
              </div>
            </div>
           </div>
           <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">难度等级</label>
            <div className="relative">
              <select className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 appearance-none outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option>简单</option>
                <option>中等</option>
                <option>困难</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  <i className="fas fa-chevron-down"></i>
              </div>
            </div>
           </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!inputText && !fileData)}
          className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98] ${
            loading || (!inputText && !fileData)
             ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
             : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400'
          }`}
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> 正在读取并出题...</span>
          ) : (
             <span className="flex items-center justify-center gap-2">生成试题 <i className="fas fa-arrow-right"></i></span>
          )}
        </button>
      </div>

      {/* Results Section */}
      {quizData.length > 0 && (
        <div className="animate-slide-up space-y-4">
           <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-700">生成的试题 ({quizData.length})</h3>
            <button onClick={downloadCSV} className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform active:scale-95">
              <i className="fas fa-file-excel"></i> 导出 CSV
            </button>
          </div>
          
          <div className="space-y-4">
            {quizData.map((q, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{idx+1}</span>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{q.question}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 ml-2 whitespace-nowrap">{q.type}</span>
                     </div>
                  </div>
                </div>
                
                <div className="pl-9 space-y-2 mb-4">
                   {['A','B','C','D'].map((opt) => {
                      const optText = q[`option${opt}` as keyof QuizItem];
                      if (!optText) return null;
                      return (
                        <div key={opt} className="flex gap-2 text-xs text-slate-600">
                          <span className="font-semibold text-slate-400 w-3">{opt}.</span>
                          <span className="flex-1">{optText}</span>
                        </div>
                      )
                   })}
                </div>

                <div className="ml-9 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">正确答案</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{q.answer}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed"><span className="font-semibold text-slate-700">解析：</span> {q.explanation}</p>
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
