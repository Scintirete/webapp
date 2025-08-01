'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // For 'as-needed' localePrefix: default locale (en) has no prefix, others do
    const currentPath = pathname.replace(`/${locale}`, '') || '/';
    let newPath: string;
    
    if (newLocale === 'en') {
      // English is default, no prefix needed
      newPath = currentPath === '/' ? '/' : currentPath;
    } else {
      // Other locales need prefix
      newPath = `/${newLocale}${currentPath === '/' ? '' : currentPath}`;
    }
    
    router.push(newPath);
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="md:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center space-x-2 ${
              locale === language.code ? 'bg-accent' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}