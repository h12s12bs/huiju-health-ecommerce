import React, { useState, useEffect } from 'react';

interface AnnouncementBarProps {
  text: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ text }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const list = [
      text,
      "🌿 慧聚健康 - 專為您與全家健康量身打造的生醫與養生選物 🍃",
      "✨ 全館滿 NT$2000 即享免運！新會員註冊即贈 $100 健康體驗金！ ✨",
      "📦 嚴選國際專利認證原料，全流程溫控冷鏈安心配送 🚚"
    ].filter(Boolean);
    setMessages(list);
  }, [text]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300); // match fade transition timing
    }, 4500);

    return () => clearInterval(interval);
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="announcement-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div 
        style={{ 
          transition: 'opacity 0.3s ease-in-out', 
          opacity: fade ? 1 : 0, 
          fontSize: '0.825rem', 
          fontWeight: 600, 
          letterSpacing: '0.05em', 
          color: 'var(--bg-primary)',
          textAlign: 'center',
          padding: '0 1rem'
        }}
      >
        {messages[currentIndex]}
      </div>
    </div>
  );
};
