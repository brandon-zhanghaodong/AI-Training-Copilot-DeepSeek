import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamCourseOutline } from '../services/deepseekService';
import { CourseParams } from '../types';

const CourseGen: React.FC = () => {
  const [params, setParams] = useState<CourseParams>({
    topic: '',
    audience: '新入职员工',
    duration: '2 小时',
    style: '实操互动型',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!params.topic) return;
    setLoading(true);
    setResult('');
    try {
      await streamCourseOutline(params.topic, params.audience, params.duration, params.style, (chunk) => {
        setResult((prev) => prev + chunk);
      });
    } catch (e) {
      setResult('生成内容出错，请检查 API Key 是否正确。');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('已复制到剪贴板！');
  };

  return (
    <div className="flex flex-col space-y-6 pb-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5 transition-shadow hover:shadow-md">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide text-xs text-slate-500">
          <i className="fas fa-sliders-h mr-2"></i>课程配置
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">培训主题 <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="例如：销售谈判技巧进阶"
              value={params.topic}
              onChange={(e) => setParams({ ...params, topic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">目标学员</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                value={params.audience}
                onChange={(e) => setParams({ ...params, audience: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">培训时长</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 appearance-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  value={params.duration}
                  onChange={(e) => setParams({ ...params, duration: e.target.value })}
                >
                  <option>1 小时</option>
                  <option>2 小时</option>
                  <option>半天 (3小时)</option>
                  <option>全天 (6小时)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">风格基调</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 appearance-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                value={params.style}
                onChange={(e) => setParams({ ...params, style: e.target.value })}
              >
                <option>实操互动型</option>
                <option>严肃正式型</option>
                <option>趣味启发型</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !params.topic}
          className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98] ${
            loading || !params.topic 
              ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
              : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch fa-spin"></i> 正在生成...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              生成课程大纲 <i className="fas fa-magic"></i>
            </span>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col animate-slide-up">
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              生成结果
            </span>
            <button 
              onClick={copyToClipboard} 
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <i className="fas fa-copy mr-1"></i> 复制
            </button>
          </div>
          <div className="p-6 text-sm text-slate-700 bg-white">
            <ReactMarkdown
              className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-brand-600"
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4 pb-2 border-b border-slate-100" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-6 mb-3 text-slate-800 flex items-center gap-2" {...props}><span className="w-1 h-4 bg-brand-500 rounded-full inline-block"></span>{props.children}</h2>,
                h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-4 mb-2 text-slate-700" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseGen;
