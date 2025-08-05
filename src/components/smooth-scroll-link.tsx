'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, MousePointer } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SmoothScrollLinkProps {
  targetId: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function SmoothScrollLink({ targetId, children, className, variant = 'outline' }: SmoothScrollLinkProps) {
  const t = useTranslations('hero');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <Button 
      size="lg" 
      variant={variant} 
      onClick={handleClick}
      className={`cursor-pointer ${className || ''}`}
    >
      {children || (
        <>
          {t('learn_more')}
          <MousePointer className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}