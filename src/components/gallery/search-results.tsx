'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, Loader2, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ImageViewer } from './image-viewer'

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

interface SearchResultsProps {
  results: SearchResult[]
  timing: SearchTiming | null
  searchQuery: string
  searchImages: File[]
  onNewSearch: () => void
  itemsPerPage?: number
}

export function GallerySearchResults({ 
  results, 
  timing, 
  searchQuery,
  searchImages,
  onNewSearch,
  itemsPerPage = 12 
}: SearchResultsProps) {
  const t = useTranslations()
  const [currentPage, setCurrentPage] = useState(1)
  const [displayResults, setDisplayResults] = useState<SearchResult[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const totalPages = Math.ceil(results.length / itemsPerPage)

  // 管理搜索图片的URL，避免内存泄漏
  useEffect(() => {
    const urls = searchImages.map(image => URL.createObjectURL(image))
    setImageUrls(urls)
    
    // 清理函数
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [searchImages])

  // 计算当前页显示的结果
  useEffect(() => {
    const startIndex = 0
    const endIndex = currentPage * itemsPerPage
    setDisplayResults(results.slice(startIndex, endIndex))
  }, [results, currentPage, itemsPerPage])

  // 加载更多结果
  const loadMore = async () => {
    if (currentPage >= totalPages) return
    
    setIsLoadingMore(true)
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setCurrentPage(prev => prev + 1)
    setIsLoadingMore(false)
  }

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (
        currentPage < totalPages &&
        !isLoadingMore &&
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage, totalPages, isLoadingMore])

  // 处理图片导航
  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    } else if (direction === 'next' && currentImageIndex < results.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  // 打开图片查看器
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="space-y-8">
      {/* 搜索条件展示 */}
      <div className="mb-8">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('demos.ai_gallery.search_condition')}</h3>
              <div className="space-y-3">
                {/* 文本搜索条件 */}
                {searchQuery && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16">{t('demos.ai_gallery.text_label')}</span>
                    <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                      "{searchQuery}"
                    </div>
                  </div>
                )}
                
                {/* 图片搜索条件 */}
                {searchImages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16 mt-1">{t('demos.ai_gallery.image_label')}</span>
                    <div className="flex flex-wrap gap-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-600 shadow-sm">
                          <img
                            src={url}
                            alt={`${t('demos.ai_gallery.image_label')} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 重新搜索按钮 */}
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={onNewSearch}
                variant="outline"
                className="px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('demos.ai_gallery.new_search')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索结果标题 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          {t('demos.ai_gallery.results_title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{t('demos.ai_gallery.results_count', { count: results.length })}</p>
      </div>

      {/* 搜索耗时信息 - 独立行小字显示 */}
      {timing && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-4 py-2 rounded-full">
            <Clock className="w-3 h-3" />
            <span>
              {t('demos.ai_gallery.total_time', { 
                total: timing.total, 
                processing: timing.imageProcessing, 
                vectorization: timing.vectorization, 
                database: timing.databaseSearch 
              })}
            </span>
          </div>
        </div>
      )}

      {/* 搜索结果网格 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayResults.map((result, displayIndex) => {
          const globalIndex = results.findIndex(r => r.id === result.id)
          return (
            <ImageViewer
              key={result.id}
              image={result}
              images={results}
              currentIndex={currentImageIndex}
              onNavigate={handleImageNavigation}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm py-0 my-6 cursor-pointer group">
                <div 
                  className="aspect-square relative overflow-hidden"
                  onClick={() => handleImageClick(globalIndex)}
                >
                  <img
                    src={result.src}
                    alt={result.img_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* 悬停时显示的放大图标 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Eye className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <Badge 
                      className={`${
                        result.similarity >= 80 
                          ? 'bg-green-500' 
                          : result.similarity >= 60 
                          ? 'bg-yellow-500' 
                          : 'bg-orange-500'
                      } text-white font-semibold shadow-lg`}
                    >
                      {result.similarity}%
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate" title={result.img_name}>
                      {result.img_name}
                    </p>
                  </div>
                </div>
              </Card>
            </ImageViewer>
          )
        })}
      </div>
      
      {/* 加载更多指示器 */}
      {isLoadingMore && (
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>loading...</span>
          </div>
        </div>
      )}
      
      {/* 没有更多结果提示 */}
      {currentPage >= totalPages && results.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('demos.ai_gallery.all_results_shown', { count: results.length })}
          </p>
        </div>
      )}

      {/* 无结果提示 */}
      {results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {t('demos.ai_gallery.no_results_found')}
          </p>
        </div>
      )}
    </div>
  )
}
