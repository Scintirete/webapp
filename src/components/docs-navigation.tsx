import { Button } from '@/components/ui/button'
import { Github, BookOpen, FileText } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/language-switcher'
import { EcosystemDropdown } from '@/components/ecosystem-dropdown'
import Link from 'next/link'

interface DocsNavigationProps {
  locale: string;
}

export async function DocsNavigation({ locale }: DocsNavigationProps) {
  const t = await getTranslations();

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Scintirete Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Scintirete
              </span>
            </Link>
            <div className="hidden sm:block text-slate-600 dark:text-slate-400">
              /
            </div>
            <div className="hidden sm:flex items-center space-x-2 font-medium text-slate-900 dark:text-slate-100">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>{t('nav.docs')}</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSwitcher />
            <Button asChild>
              <a href="https://github.com/Scintirete/Scintirete/" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                {t('nav.github')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}