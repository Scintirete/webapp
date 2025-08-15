import { Button } from '@/components/ui/button'
import { Github, BookOpen, FileText, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/language-switcher'
import { EcosystemDropdown } from '@/components/ecosystem-dropdown'
import { Link } from '@/i18n/navigation'

interface SiteNavigationProps {
  showDocsIndicator?: boolean;
}

export async function SiteNavigation({ showDocsIndicator = false }: SiteNavigationProps) {
  const t = await getTranslations();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
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
            
            {showDocsIndicator && (
              <>
                <div className="text-slate-400 dark:text-slate-600">/</div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{t('nav.docs')}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link 
              href="/demos" 
              className="group flex items-center space-x-2 animate-gentle-float hover:scale-105 transition-transform duration-600 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-sparkle-continuous" />
              <span className="font-medium animate-text-gradient">
                {t('nav.demos')}
              </span>
            </Link>
            <Link 
              href="/docs" 
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('nav.docs')}</span>
            </Link>
            <EcosystemDropdown />
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