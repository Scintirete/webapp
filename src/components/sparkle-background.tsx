'use client';

import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SparkleData {
  id: number;
  top: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

export function SparkleBackground() {
  const [sparkles, setSparkles] = useState<SparkleData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 仅在客户端生成随机位置，避免水合错误
    const sparkleData: SparkleData[] = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 2,
    }));
    setSparkles(sparkleData);
    setMounted(true);
  }, []);

  // 在服务端或未挂载时不渲染任何内容，避免水合错误
  if (!mounted) {
    return <div className="fixed inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            animationDelay: `${sparkle.animationDelay}s`,
            animationDuration: `${sparkle.animationDuration}s`,
          }}
        >
          <Sparkles className="w-2 h-2 text-yellow-400 opacity-70" />
        </div>
      ))}
    </div>
  );
}