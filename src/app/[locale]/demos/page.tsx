import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SparkleBackground } from '@/components/sparkle-background'
import { SiteNavigation } from '@/components/site-navigation'
import { Search, Image, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function DemosPage() {
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
        <section className="relative py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-16">
              <Badge variant="secondary" className="mb-4 text-sm">
                {t('demos.badge')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('demos.title')}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                {t('demos.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* 演示项目展示区域 */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* AI 相册检索演示卡片 */}
              <Card className="relative overflow-hidden border-l-4 border-l-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                {/* 卡片背景装饰 */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <CardHeader className="pb-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Image className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            {t('demos.ai_gallery.badge')}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                          {t('demos.ai_gallery.title')}
                        </CardTitle>
                        <CardDescription className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                          {t('demos.ai_gallery.description')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {/* 演示图片展示位 */}
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl overflow-hidden shadow-lg">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 mx-auto bg-purple-500 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8 text-white" />
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                  {t('demos.ai_gallery.preview_title')}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  {t('demos.ai_gallery.preview_subtitle')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 装饰性的图片网格预览 */}
                        <div className="absolute -bottom-4 -right-4 grid grid-cols-2 gap-1 opacity-60">
                          <div className="w-8 h-8 bg-purple-200 dark:bg-purple-700 rounded"></div>
                          <div className="w-8 h-8 bg-pink-200 dark:bg-pink-700 rounded"></div>
                          <div className="w-8 h-8 bg-orange-200 dark:bg-orange-700 rounded"></div>
                          <div className="w-8 h-8 bg-yellow-200 dark:bg-yellow-700 rounded"></div>
                        </div>
                      </div>

                      {/* 功能特点介绍 */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {t('demos.ai_gallery.features.upload')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {t('demos.ai_gallery.features.upload_desc')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {t('demos.ai_gallery.features.vector_search')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {t('demos.ai_gallery.features.vector_search_desc')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {t('demos.ai_gallery.features.realtime')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {t('demos.ai_gallery.features.realtime_desc')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 开始试用按钮 */}
                      <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                        <Link href="/demos/ai-gallery">
                          <Sparkles className="w-5 h-5 mr-2" />
                          {t('demos.ai_gallery.try_button')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* 向量空间可视化演示卡片 */}
              <Card className="relative overflow-hidden border-l-4 border-l-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                {/* 卡片背景装饰 */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <CardHeader className="pb-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {t('demos.vector_space.badge')}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                          {t('demos.vector_space.title')}
                        </CardTitle>
                        <CardDescription className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                          {t('demos.vector_space.description')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {/* 演示图片展示位 */}
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl overflow-hidden shadow-lg">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20">
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-1">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {t('demos.vector_space.preview_title')}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  {t('demos.vector_space.preview_subtitle')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 装饰性的向量点图案 */}
                        <div className="absolute -bottom-4 -right-4 grid grid-cols-4 gap-1 opacity-60">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        </div>
                      </div>

                      {/* 功能特点介绍 */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {t('demos.vector_space.features.interactive')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {t('demos.vector_space.features.interactive_desc')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {t('demos.vector_space.features.clustering')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {t('demos.vector_space.features.clustering_desc')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {t('demos.vector_space.features.performance')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {t('demos.vector_space.features.performance_desc')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 开始试用按钮 */}
                      <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                        <Link href="/demos/vector-space">
                          <Sparkles className="w-5 h-5 mr-2" />
                          {t('demos.vector_space.try_button')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* 更多演示项目提示 */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t('demos.more_coming')}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
