'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Database, LayoutDashboard, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function EcosystemDropdown() {
  const t = useTranslations('nav');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer">
          <span>{t('ecosystem')}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" sideOffset={5}>
        <DropdownMenuItem asChild>
          <a 
            href="https://github.com/Scintirete/Scintirete/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 w-full cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>{t('vector_database')}</span>
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href="https://github.com/Scintirete/manager-ui" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 w-full cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('manager_ui')}</span>
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}