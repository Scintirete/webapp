'use client';

import { Sparkles } from 'lucide-react';

export function SparkleBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <Sparkles className="w-2 h-2 text-yellow-400 opacity-70" />
        </div>
      ))}
    </div>
  );
}