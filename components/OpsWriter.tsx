import React, { useState } from 'react';
import { streamOpsCopy } from '../services/deepseekService';

const OpsWriter: React.FC = () => {
  const [type, setType] = useState('开课通知邮件');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('正式专业');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!context) return;
    setLoading(true);
    setResult('');
    try {
      await streamOpsCopy(type, context, tone, (chunk) => {
        setResult((prev) => prev + chunk);
      });
    } catch (e) {
      setResult('生成文案出错。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5 transition-shadow hover:shadow-md">
        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide text-xs text-slate-500">
          <i className="fas fa-feather-alt mr-2"></i>运营文案助手
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">文案类型</label>
            <div className="relative">
              <select 
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 appearance-none outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>开课通知邮件</option>
                <option>社群/钉钉预热文案</option>
                <option>课程总结与回顾</option>
                <option>培训提醒通知</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">关键信息</label>
            <textarea
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 h-28 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all placeholder:text-slate-400"
              placeholder="例如：下周五下午2点全员进行网络安全培训，地点在201会议室，请大家带好笔记本电脑..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">语气风格</label>
            <div className="grid grid-cols-3 gap-2">
              {['正式专业', '亲切活泼', '紧急重要'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                    tone.includes(t)
                      ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !context}
          className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] ${
            loading || !context 
              ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400'
          }`}
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> 撰写中...</span>
           ) : (
             <span className="flex items-center justify-center gap-2">一键生成文案 <i className="fas fa-paper-plane"></i></span>
           )}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col animate-slide-up">
           <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex justify-end backdrop-blur-sm">
             <button 
               onClick={() => {navigator.clipboard.writeText(result); alert('已复制！');}} 
               className="text-xs text-slate-600 hover:text-slate-900 font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
             >
               <i className="fas fa-copy mr-1"></i> 复制全文
             </button>
           </div>
           <div className="p-6 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
             {result}
           </div>
        </div>
      )}
    </div>
  );
};

export default OpsWriter;