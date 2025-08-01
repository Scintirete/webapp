import { Sidebar } from '@/components/docs-sidebar'
import { MarkdownRenderer } from '@/lib/markdown-renderer'
import { getDocumentByPath, getDocumentStructure } from '@/lib/docs'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl';

export default async function DocsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = useTranslations();
  const { locale } = await params;
  
  // 获取查询参数中的路径，默认为根路径
  const path = typeof searchParams.path === 'string' ? searchParams.path : ''
  
  try {
    // 根据语言获取文档结构
    const docsPath = locale === 'zh' ? 'docs/zh' : 'docs/en'
    const structure = await getDocumentStructure(docsPath)
    
    // 获取文档内容
    let document
    if (path) {
      document = await getDocumentByPath(`${docsPath}/${path}`)
    } else {
      // 默认显示索引页面
      document = await getDocumentByPath(`${docsPath}/index.md`)
    }

    if (!document) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* 导航栏 */}
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <a href={`/${locale}`} className="flex items-center space-x-2">
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
                </a>
                <div className="hidden sm:block text-slate-600 dark:text-slate-400">
                  /
                </div>
                <div className="hidden sm:block font-medium text-slate-900 dark:text-slate-100">
                  {t('nav.docs')}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边栏 */}
            <div className="lg:col-span-1">
              <Sidebar structure={structure} currentPath={path} />
            </div>

            {/* 主要内容区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <MarkdownRenderer content={document.content} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading docs:', error)
    notFound()
  }
}