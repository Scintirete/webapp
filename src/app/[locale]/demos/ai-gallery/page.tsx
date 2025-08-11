import { Button } from '@/components/ui/button'
import { SiteNavigation } from '@/components/site-navigation'
import { AIGalleryClient } from '@/components/ai-gallery-client'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function AIGalleryPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative">
      {/* 导航栏 */}
      <SiteNavigation />

      {/* 主要内容区域 */}
      <main className="pt-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* 返回按钮 */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <Link href="/demos">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('demos.ai_gallery.back_to_demos')}
              </Link>
            </Button>
          </div>

          {/* 客户端交互组件 */}
          <AIGalleryClient />
        </div>
      </main>
    </div>
  )
}