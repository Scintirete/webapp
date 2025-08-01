'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SmoothScrollLinkProps {
  targetId: string;
  children?: React.ReactNode;
  className?: string;
}

export function SmoothScrollLink({ targetId, children, className }: SmoothScrollLinkProps) {
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
      variant="outline" 
      onClick={handleClick}
      className={className}
    >
      {children || (
        <>
          {t('learn_more')}
          <ChevronDown className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}