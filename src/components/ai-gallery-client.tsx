'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedImageBackground } from '@/components/animated-image-background'
import { ArrowLeft, ExternalLink, Eye, Database } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { AI_GALLERY_CONFIG, validateFile, ERROR_KEYS } from '@/lib/ai-gallery-config'
import { 
  GallerySearchForm, 
  GallerySearchResults, 
  GalleryExampleImages,
  SearchFormRef
} from '@/components/gallery'
import { Link } from '@/i18n/navigation'

interface SearchResult {
  id: string
  img_name: string
  similarity: number
  src: string
}

interface SearchTiming {
  imageProcessing: number
  vectorization: number
  databaseSearch: number
  total: number
}

export function AIGalleryClient() {
  const t = useTranslations()
  const { toast } = useToast()
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchTiming, setSearchTiming] = useState<SearchTiming | null>(null)
  const [currentImageCount, setCurrentImageCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchImages, setSearchImages] = useState<File[]>([])
  const searchFormRef = useRef<SearchFormRef>(null)

  // 处理搜索请求
  const handleSearch = async (query: string, images: File[]) => {
    setIsSearching(true)
    setHasSearched(false)
    
    // 保存搜索参数
    setSearchQuery(query)
    setSearchImages(images)
    
    try {
      // 准备表单数据
      const formData = new FormData()
      
      // 添加搜索查询
      if (query) {
        formData.append('query', query)
      }
      
      // 添加上传的图片文件
      images.forEach((file) => {
        formData.append(`images`, file)
      })
      
      // 调用后端 API
      const response = await fetch('/api/ai-gallery/search', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      setSearchTiming(result.timing || null)
      setSearchResults(result.results || [])
      setIsSearching(false)
      setHasSearched(true)
      
    } catch (error) {
      console.error('搜索出错:', error)
      
      // 显示错误提示
      toast({
        variant: "destructive",
        title: t(ERROR_KEYS.SEARCH_FAILED),
        description: error instanceof Error ? error.message : String(error),
      });
      
      // 重置搜索状态，但保持在当前页面
      setIsSearching(false)
      // 不设置 hasSearched 为 true，保持在搜索界面
    }
  }

  // 处理示例图片点击
  const handleExampleClick = async (src: string) => {
    if (searchFormRef.current) {
      await searchFormRef.current.addExampleImage(src)
    }
  }

  // 重新搜索
  const handleNewSearch = () => {
    setHasSearched(false)
    setSearchResults([])
    setSearchTiming(null)
    setCurrentImageCount(0)
    setSearchQuery('')
    setSearchImages([])
  }

  return (
    <div className="relative">
      {/* 动态背景图片（仅在未搜索时显示） */}
      {!hasSearched && <AnimatedImageBackground />}

      {/* 主要内容区域 */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {t('demos.ai_gallery.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              {t('demos.ai_gallery.title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('demos.ai_gallery.page_description')}
            </p>
          </div>

          {!hasSearched ? (
            <>
              {/* 搜索表单 */}
              <GallerySearchForm 
                ref={searchFormRef}
                onSearch={handleSearch}
                isSearching={isSearching}
                onImageCountChange={setCurrentImageCount}
              />

              {/* 示例图片 */}
              <GalleryExampleImages 
                onExampleClick={handleExampleClick}
                currentImageCount={currentImageCount}
              />

              {/* 数据集信息 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {t('demos.dataset_info.source')}: {t('demos.dataset_info.pascal_voc_2012')}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {t('demos.dataset_info.pascal_voc_description')}
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30">
                    <a href={t('demos.dataset_info.pascal_voc_url')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                      {t('demos.dataset_info.learn_more')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* 向量空间可视化简介 */}
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {t('demos.ai_gallery.vector_space.title')}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {t('demos.ai_gallery.vector_space.brief_description')}
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30">
                    <Link href="/demos/vector-space" className="inline-flex items-center gap-1.5">
                      {t('demos.ai_gallery.vector_space.view_button')}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* 搜索结果 */
            <GallerySearchResults
              results={searchResults}
              timing={searchTiming}
              searchQuery={searchQuery}
              searchImages={searchImages}
              onNewSearch={handleNewSearch}
            />
          )}
        </div>
      </div>
    </div>
  )
}
