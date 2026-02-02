import { useState, useEffect } from 'react';

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeChatModal({ isOpen, onClose }: WeChatModalProps) {
  const [wechat, setWechat] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState(''); // 手机号或邮箱
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // 检查是否已经提交过
    const hasSubmitted = localStorage.getItem('wechat_submitted');
    if (hasSubmitted) {
      setSubmitted(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wechat.trim()) {
      alert('请输入微信号');
      return;
    }

    if (!name.trim()) {
      alert('请输入姓名');
      return;
    }

    if (!company.trim()) {
      alert('请输入公司名称');
      return;
    }

    if (!contact.trim()) {
      alert('请输入手机号或邮箱');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/.netlify/functions/collect-wechat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wechat: wechat.trim(),
          name: name.trim(),
          company: company.trim(),
          contact: contact.trim(),
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('wechat_submitted', 'true');
        setSubmitted(true);
        alert('感谢您的申请，期待多多交流！🎉');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        alert('提交失败，请稍后重试');
      }
    } catch (error) {
      console.error('提交错误:', error);
      alert('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText = 'AI 培训助手 - HR 效能提升专家，快来试试吧！';
    
    // 尝试使用 Web Share API
    if (navigator.share) {
      navigator.share({
        title: 'AI 培训助手',
        text: shareText,
        url: shareUrl
      }).catch((error) => {
        console.log('分享取消或失败:', error);
      });
    } else {
      // 降级方案：复制链接
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('链接已复制到剪贴板，快去分享吧！');
      }).catch(() => {
        alert(`请复制此链接分享：\n${shareUrl}`);
      });
    }
  };

  if (!isOpen || submitted) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 分享按钮 */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors"
          title="分享给朋友"
        >
          <i className="fas fa-share-alt text-lg"></i>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            👋 欢迎使用 AI 培训助手
          </h2>
          <p className="text-gray-600 text-sm">
            请先注册，即可免费使用所有功能
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公司 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="请输入您的公司名称"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              微信号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              placeholder="请输入您的微信号"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号/邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="请输入手机号或邮箱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              稍后再说
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? '提交中...' : '立即注册'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          我们承诺保护您的隐私，仅用于培训合作沟通
        </p>
      </div>
    </div>
  );
}
