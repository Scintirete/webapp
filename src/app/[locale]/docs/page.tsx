import { DocsSidebar } from '@/components/docs-sidebar'
import { MarkdownRenderer } from '@/lib/markdown-renderer'
import { DocsNavigation } from '@/components/docs-navigation'
import { readFile } from 'fs/promises'
import { join, resolve, normalize } from 'path'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getDocsStructure } from '@/lib/docs-scanner'

export default async function DocsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations();
  
  // 获取查询参数中的路径，默认为根路径
  const path = typeof resolvedSearchParams.path === 'string' ? resolvedSearchParams.path : ''
  
  try {
    // 安全检查：防止路径遍历攻击
    const docPath = path || 'index'
    const docsRoot = resolve(process.cwd(), 'docs', locale)
    const requestedPath = normalize(join(docsRoot, `${docPath}.md`))
    
    // 检查最终路径是否在docs目录下
    if (!requestedPath.startsWith(docsRoot)) {
      console.error('Path traversal attempt detected:', requestedPath)
      notFound()
      return
    }
    
    let content: string
    try {
      content = await readFile(requestedPath, 'utf-8')
    } catch (error) {
      console.error(`Error reading file ${requestedPath}:`, error)
      notFound()
      return
    }

    // 获取文档结构，优先从locale目录读取
    let docsStructure
    try {
      docsStructure = await getDocsStructure(locale)
    } catch (error) {
      console.error('Error loading docs structure:', error) 
      // 如果读取失败，使用默认结构
      docsStructure = [
        {
          id: 'index',
          title: locale === 'zh' ? '文档首页' : 'Documentation Home',
          type: 'file' as const,
          path: '',
          children: []
        }
      ]
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* 导航栏 */}
        <DocsNavigation locale={locale} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边栏 */}
            <div className="lg:col-span-1">
              <DocsSidebar 
                docsStructure={docsStructure} 
                defaultExpandedFolders={new Set(['category-基础', 'category-开发', 'category-工具'])} 
                currentPath={docPath}
                locale={locale}
              />
            </div>

            {/* 主要内容区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <MarkdownRenderer content={content} locale={locale} />
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