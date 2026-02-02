import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyzeFeedback, generateSurvey } from '../services/deepseekService';
import { FeedbackAnalysis } from '../types';

enum Mode {
  ANALYSIS = 'analysis',
  SURVEY = 'survey'
}

const FeedbackInsight: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.ANALYSIS);
  
  // Analysis State
  const [feedback, setFeedback] = useState('');
  const [data, setData] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Survey State
  const [surveyTopic, setSurveyTopic] = useState('');
  const [surveyType, setSurveyType] = useState('训后满意度调研');
  const [surveyResult, setSurveyResult] = useState('');
  const [surveyLoading, setSurveyLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!feedback) return;
    setLoading(true);
    setData(null);
    try {
      const result = await analyzeFeedback(feedback);
      setData(result);
    } catch (e) {
      alert("分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSurvey = async () => {
    if (!surveyTopic) return;
    setSurveyLoading(true);
    setSurveyResult('');
    try {
      const res = await generateSurvey(surveyTopic, surveyType);
      setSurveyResult(res);
    } catch (e) {
      alert("生成问卷失败");
    } finally {
      setSurveyLoading(false);
    }
  };

  const chartData = data ? [
    { name: '正面', value: data.sentiment.positive, color: '#10b981' }, // Emerald 500
    { name: '中立', value: data.sentiment.neutral, color: '#94a3b8' },  // Slate 400
    { name: '负面', value: data.sentiment.negative, color: '#ef4444' }, // Red 500
  ] : [];

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Toggle */}
      <div className="bg-slate-200 p-1 rounded-xl flex gap-1">
        <button
          onClick={() => setMode(Mode.ANALYSIS)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === Mode.ANALYSIS ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          反馈分析
        </button>
        <button
          onClick={() => setMode(Mode.SURVEY)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === Mode.SURVEY ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          问卷设计
        </button>
      </div>

      {mode === Mode.ANALYSIS ? (
        <>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5 transition-shadow hover:shadow-md animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide text-xs text-slate-500">
              <i className="fas fa-comment-dots mr-2"></i>反馈输入
            </h2>
            
            <textarea
              className="w-full p-4 text-sm border border-slate-200 rounded-xl bg-slate-50 h-32 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all placeholder:text-slate-400"
              placeholder="请在此粘贴多条学员反馈建议（每行一条）..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            
            <button
              onClick={handleAnalyze}
              disabled={loading || !feedback}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all transform active:scale-[0.98] ${
                loading || !feedback 
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
              }`}
            >
               {loading ? (
                 <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> 分析中...</span>
               ) : (
                 <span className="flex items-center justify-center gap-2">智能分析洞察 <i className="fas fa-microscope"></i></span>
               )}
            </button>
          </div>

          {data && (
            <div className="flex flex-col space-y-4 animate-slide-up">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">情感倾向概览</h3>
                <div className="w-full h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={4}
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 600 }} />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                     <div className="text-2xl font-bold text-slate-800">{data.sentiment.positive}%</div>
                     <div className="text-[10px] font-semibold text-emerald-500">正面反馈</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">核心关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((k, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-sm">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">改进建议</h3>
                <ul className="space-y-3">
                  {data.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-700 group">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs mt-0.5 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed py-0.5">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      ) : (
        /* SURVEY MODE */
        <>
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5 transition-shadow hover:shadow-md animate-fade-in">
             <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide text-xs text-slate-500">
              <i className="fas fa-clipboard-list mr-2"></i>腾讯问卷设计助手
             </h2>
             <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">培训主题</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="例如：新晋管理者领导力培训"
                  value={surveyTopic}
                  onChange={(e) => setSurveyTopic(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">问卷类型</label>
                <select 
                   className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                   value={surveyType}
                   onChange={(e) => setSurveyType(e.target.value)}
                >
                  <option>训后满意度调研</option>
                  <option>年度培训需求调研</option>
                  <option>讲师评价问卷</option>
                  <option>培训效果落地跟进</option>
                </select>
             </div>
             <button
              onClick={handleGenerateSurvey}
              disabled={surveyLoading || !surveyTopic}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] ${
                surveyLoading || !surveyTopic
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
              }`}
            >
               {surveyLoading ? (
                 <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> 设计中...</span>
               ) : (
                 <span className="flex items-center justify-center gap-2">生成问卷模版 <i className="fas fa-magic"></i></span>
               )}
            </button>
           </div>

           {surveyResult && (
             <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col animate-slide-up">
                <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex justify-end backdrop-blur-sm sticky top-0">
                  <button 
                    onClick={() => {navigator.clipboard.writeText(surveyResult); alert('已复制！');}} 
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <i className="fas fa-copy mr-1"></i> 复制文本
                  </button>
                </div>
                <div className="p-6 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {surveyResult}
                </div>
             </div>
           )}
        </>
      )}
    </div>
  );
};

export default FeedbackInsight;
