import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink, BookOpen, LayoutDashboard, Sparkles, Download } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { SmoothScrollLink } from '@/components/smooth-scroll-link'
import { SparkleBackground } from '@/components/sparkle-background'
import { SiteNavigation } from '@/components/site-navigation'
import { Link } from '@/i18n/navigation'

export default async function Home() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* 火花闪光背景效果 */}
      <SparkleBackground />

      {/* 导航栏 */}
      <SiteNavigation />

      {/* 主要内容区域 */}
      <main className="pt-20">
        {/* Hero 区域 */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 text-sm">
                {t('hero.badge')}
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('hero.title')}
              </h1>
              <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 mb-4 font-light">
                {t('hero.subtitle')}
              </p>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <SmoothScrollLink targetId="quickstart" variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                <span>{t('hero.start_btn')}</span>
              </SmoothScrollLink>
              <SmoothScrollLink targetId="features" />
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 blur-3xl"></div>
              <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{t('hero.features.search_speed')}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('hero.features.search_speed_desc')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{t('hero.features.algorithm')}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('hero.features.algorithm_desc')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{t('hero.features.interface')}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('hero.features.interface_desc')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{t('hero.features.platform')}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('hero.features.platform_desc')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 特性区域 */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {t('features.title')}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span>{t('features.simple.title')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('features.simple.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <span>{t('features.performance.title')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('features.performance.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-red-500" />
                    <span>{t('features.security.title')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('features.security.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>{t('features.interface.title')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('features.interface.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>{t('features.operations.title')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('features.operations.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <span>{t('features.cross_platform.title')}</span>
                  </CardTitle>
                  <CardDescription>
                    {t('features.cross_platform.description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* 快速上手区域 */}
        <section id="quickstart" className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {t('quickstart.title')}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('quickstart.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">{t('quickstart.requirements.title')}</CardTitle>
                  <CardDescription>
                    <ul className="space-y-2 text-sm">
                      <li>• {t('quickstart.requirements.go')}</li>
                      <li>• {t('quickstart.requirements.docker')}</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg">{t('quickstart.installation.title')}</CardTitle>
                  <CardDescription>
                    <ul className="space-y-2 text-sm">
                      <li>• {t('quickstart.installation.binary')}</li>
                      <li>• {t('quickstart.installation.source')}</li>
                      <li>• {t('quickstart.installation.docker')}</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg">{t('quickstart.startup.title')}</CardTitle>
                  <CardDescription>
                    <ul className="space-y-2 text-sm">
                      <li>• {t('quickstart.startup.grpc')}</li>
                      <li>• {t('quickstart.startup.http')}</li>
                      <li>• {t('quickstart.startup.compose')}</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* 部署方式指南 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {t('quickstart.download_guide.title')}
              </h3>
              <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
                {t('quickstart.download_guide.subtitle')}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold mb-4 text-blue-600 dark:text-blue-400">
                    {t('quickstart.download_guide.binary_title')}
                  </h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-green-400 mb-1"># start server</div>
                    <div>./bin/scintirete-server</div>
                  </div>
                  <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 mt-4">
                    <a href="https://github.com/Scintirete/Scintirete/releases" target="_blank" rel="noopener noreferrer">
                      <Download className="w-5 h-5 mr-2" />
                      {t('quickstart.download_guide.download_btn')}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
                
                <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold mb-4 text-green-600 dark:text-green-400">
                    {t('quickstart.download_guide.docker_title')}
                  </h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto text-left">
                    <div className="text-green-400 mb-1"># pull latest image</div>
                    <div className="mb-3">docker pull scintirete/scintirete:latest</div>
                    
                    <div className="text-green-400 mb-1"># download config file</div>
                    <div className="mb-3 whitespace-pre-wrap">wget https://raw.githubusercontent.com/Scintirete/Scintirete/refs/heads/main/configs/scintirete.template.toml
  -O scintirete.toml</div>
                    
                    <div className="text-green-400 mb-1"># start server</div>
                    <div className="whitespace-pre-wrap">docker run -d \<br />
  --name scintirete \<br />
  -p 8080:8080 \<br />
  -p 9090:9090 \<br />
  -v $(pwd)/data:/app/data \<br />
  -v $(pwd)/scintirete.toml:/app/configs/scintirete.toml \<br />
  scintirete/scintirete:latest</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-700/70 rounded-xl p-6">
                <h4 className="font-semibold mb-4 text-center text-purple-600 dark:text-purple-400">
                  {t('quickstart.download_guide.after_startup')}
                </h4>
                
                <div className="text-center mb-6">
                  <Button asChild variant="outline" size="lg" className="mb-3">
                    <a href="http://scintirete-manager-ui.cloud.wj2015.com" target="_blank" rel="noopener noreferrer">
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      {t('quickstart.download_guide.manager_ui_link')}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('quickstart.download_guide.ui_description')}
                  </p>
                </div>
                
                <div className="bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/manager-ui.png" 
                    alt="Scintirete Manager UI 界面预览"
                    className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>


          </div>
        </section>

        {/* CTA 区域 */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Link href="/docs">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t('quickstart.view_docs')}
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="https://github.com/Scintirete/Scintirete/discussions" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {t('cta.discussions')}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Scintirete Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Scintirete
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}