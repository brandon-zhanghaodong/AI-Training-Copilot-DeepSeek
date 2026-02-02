import React, { useState, useEffect } from 'react';
import { ModuleType } from './types';
import CourseGen from './components/CourseGen';
import QuizGen from './components/QuizGen';
import FeedbackInsight from './components/FeedbackInsight';
import OpsWriter from './components/OpsWriter';
import WeChatModal from './components/WeChatModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>(ModuleType.COURSE_GEN);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [showWeChatModal, setShowWeChatModal] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }

    // 延迟 5 秒后显示微信收集弹窗（仅首次访问）
    const hasSubmitted = localStorage.getItem('wechat_submitted');
    if (!hasSubmitted) {
      const timer = setTimeout(() => {
        setShowWeChatModal(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (apiKeyMissing) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-xs">
           <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fas fa-exclamation-triangle text-xl"></i>
           </div>
           <h2 className="text-lg font-bold text-slate-800 mb-2">缺少 API Key</h2>
           <p className="text-sm text-slate-500 leading-relaxed">请提供 <code>API_KEY</code> 环境变量以运行此应用。</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case ModuleType.COURSE_GEN:
        return <CourseGen />;
      case ModuleType.QUIZ_GEN:
        return <QuizGen />;
      case ModuleType.INSIGHT:
        return <FeedbackInsight />;
      case ModuleType.OPS:
        return <OpsWriter />;
      default:
        return <CourseGen />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 mx-auto shadow-2xl overflow-hidden relative">
      <div className="w-full h-full flex flex-col bg-slate-50 max-w-md mx-auto border-x border-slate-200">
        {/* Sidebar Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 py-4 flex items-center gap-3 shrink-0 sticky top-0 z-20">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <i className="fas fa-robot text-lg"></i>
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight">AI 培训助手</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">HR 效能提升专家</p>
            <p className="text-[10px] text-blue-600 font-medium mt-0.5">
              *由知识星球：AI时代的HR创建
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
           <div className="h-full overflow-y-auto p-5 scroll-smooth">
             {renderContent()}
           </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-slate-200 shrink-0 pb-safe">
          <div className="flex justify-around items-center px-2 py-1">
            <TabButton 
              active={activeTab === ModuleType.COURSE_GEN} 
              onClick={() => setActiveTab(ModuleType.COURSE_GEN)}
              icon="fa-book-open"
              label="课纲"
            />
            <TabButton 
              active={activeTab === ModuleType.QUIZ_GEN} 
              onClick={() => setActiveTab(ModuleType.QUIZ_GEN)}
              icon="fa-graduation-cap"
              label="出题"
            />
            <TabButton 
              active={activeTab === ModuleType.INSIGHT} 
              onClick={() => setActiveTab(ModuleType.INSIGHT)}
              icon="fa-chart-pie"
              label="洞察"
            />
            <TabButton 
              active={activeTab === ModuleType.OPS} 
              onClick={() => setActiveTab(ModuleType.OPS)}
              icon="fa-pen-nib"
              label="文案"
            />
          </div>
        </nav>
      </div>

      {/* WeChat Collection Modal */}
      <WeChatModal 
        isOpen={showWeChatModal} 
        onClose={() => setShowWeChatModal(false)} 
      />
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all duration-200 ${
        active
          ? 'text-brand-600 bg-brand-50'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      <i className={`fas ${icon} text-lg mb-1`}></i>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default App;
