'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AnimatedImageBackground } from '@/components/animated-image-background'
import { Upload, X, Search, Shuffle, Loader2, Image as ImageIcon, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { AI_GALLERY_CONFIG, validateFile, validateFileCount, ERROR_KEYS } from '@/lib/ai-gallery-config'

interface UploadedImage {
  id: string
  src: string
  file: File
}

interface SearchTiming {
  imageProcessing: number
  vectorization: number
  databaseSearch: number
  total: number
}

const EXAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop'
]

const SEARCH_RESULTS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', similarity: 0.98 },
  { id: 2, src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', similarity: 0.94 },
  { id: 3, src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', similarity: 0.91 },
  { id: 4, src: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=300&h=300&fit=crop', similarity: 0.88 },
  { id: 5, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop', similarity: 0.85 },
  { id: 6, src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop', similarity: 0.82 }
]

export function AIGalleryClient() {
  const t = useTranslations()
  const { toast } = useToast()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof SEARCH_RESULTS>([])
  const [currentExamples, setCurrentExamples] = useState(EXAMPLE_IMAGES)
  const [isShuffling, setIsShuffling] = useState(false)
  const [searchTiming, setSearchTiming] = useState<SearchTiming | null>(null)
  const [page, setPage] = useState(1)
  const [hasMoreResults, setHasMoreResults] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载更多结果
  const loadMoreResults = async () => {
    if (!hasMoreResults || isLoadingMore) return
    
    setIsLoadingMore(true)
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟更多结果（相似度递减）
    const nextPageResults = SEARCH_RESULTS.map((result, index) => ({
      ...result,
      id: result.id + page * 100,
      similarity: Math.max(0.3, result.similarity - (page * 0.1) - (index * 0.02))
    })).filter(result => result.similarity >= 0.3)
    
    if (nextPageResults.length === 0) {
      setHasMoreResults(false)
    } else {
      setSearchResults(prev => [...prev, ...nextPageResults])
      setPage(prev => prev + 1)
    }
    
    setIsLoadingMore(false)
  }

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (
        hasSearched &&
        hasMoreResults &&
        !isLoadingMore &&
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
      ) {
        loadMoreResults()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasSearched, hasMoreResults, isLoadingMore, page])

  const handleFileUpload = useCallback((files: FileList) => {
    // 检查文件数量限制
    const fileCountValidation = validateFileCount(uploadedImages.length, files.length);
    if (!fileCountValidation.valid) {
      toast({
        variant: "destructive",
        title: t("demos.ai_gallery.error_upload_failed"),
        description: t(fileCountValidation.errorKey!, fileCountValidation.errorParams),
      });
      return;
    }
    
    Array.from(files).forEach(file => {
      // 验证文件
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        toast({
          variant: "destructive",
          title: t("demos.ai_gallery.error_upload_failed"),
          description: t(fileValidation.errorKey!, fileValidation.errorParams),
        });
        return;
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          src: e.target?.result as string,
          file
        }
        setUploadedImages(prev => {
          // 再次检查数量限制，防止并发添加
          if (prev.length >= AI_GALLERY_CONFIG.MAX_FILES) {
            return prev;
          }
          return [...prev, newImage];
        })
      }
      reader.readAsDataURL(file)
    })
  }, [uploadedImages.length, t, toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      const files: File[] = []
      Array.from(items).forEach(item => {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            files.push(file)
          }
        }
      })
      
      if (files.length > 0) {
        // 创建一个 FileList 对象来使用 handleFileUpload
        const dataTransfer = new DataTransfer()
        files.forEach(file => dataTransfer.items.add(file))
        handleFileUpload(dataTransfer.files)
      }
    }
  }, [handleFileUpload])

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const handleExampleClick = async (src: string) => {
    // 检查文件数量限制
    if (uploadedImages.length >= AI_GALLERY_CONFIG.MAX_FILES) {
      toast({
        variant: "destructive",
        title: t("demos.ai_gallery.error_upload_failed"),
        description: t(ERROR_KEYS.TOO_MANY_FILES, { max: AI_GALLERY_CONFIG.MAX_FILES }),
      });
      return;
    }
    
    // 检查是否已经存在相同的图片
    const isDuplicate = uploadedImages.some(img => img.src === src)
    if (isDuplicate) return

    try {
      // 获取图片并转换为File对象
      const response = await fetch(src)
      const blob = await response.blob()
      
      // 检查文件大小
      if (blob.size > AI_GALLERY_CONFIG.MAX_FILE_SIZE_BYTES) {
        toast({
          variant: "destructive",
          title: t("demos.ai_gallery.error_upload_failed"),
          description: t(ERROR_KEYS.FILE_TOO_LARGE, { 
            filename: `example-${Date.now()}.jpg`, 
            size: Math.round(blob.size / 1024), 
            max: AI_GALLERY_CONFIG.MAX_FILE_SIZE_KB 
          }),
        });
        return;
      }
      
      const file = new File([blob], `example-${Date.now()}.jpg`, { type: blob.type })
      
      const newImage: UploadedImage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        src,
        file
      }
      
      setUploadedImages(prev => [...prev, newImage])
    } catch (error) {
      console.error('Failed to load example image:', error)
      toast({
        variant: "destructive",
        title: t("demos.ai_gallery.error_upload_failed"),
        description: t(ERROR_KEYS.LOAD_EXAMPLE_FAILED),
      });
    }
  }

  const randomizeExamples = () => {
    setIsShuffling(true)
    
    // 添加动画延迟
    setTimeout(() => {
      const shuffled = [...EXAMPLE_IMAGES].sort(() => Math.random() - 0.5)
      setCurrentExamples(shuffled)
      setIsShuffling(false)
    }, 600)
  }

  const handleSearch = async () => {
    if (!searchQuery && uploadedImages.length === 0) return

    setIsSearching(true)
    setHasSearched(false)
    setPage(1)
    setHasMoreResults(true)

    const startTime = Date.now()
    
    try {
      // 准备表单数据
      const formData = new FormData()
      
      // 添加搜索查询
      if (searchQuery) {
        formData.append('query', searchQuery)
      }
      
      // 添加上传的图片文件
      uploadedImages.forEach((img, index) => {
        formData.append(`images`, img.file)
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
      
      const totalTime = Date.now() - startTime
      
      setSearchTiming({
        imageProcessing: result.timing?.imageProcessing || 0,
        vectorization: result.timing?.vectorization || 0,
        databaseSearch: result.timing?.databaseSearch || 0,
        total: totalTime
      })
      
      setSearchResults(result.results || [])
      setHasMoreResults(result.hasMore || false)
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
              {/* 合并的搜索和上传区域 */}
              <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* 上传图片列表 */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t('demos.ai_gallery.uploaded_images')} ({uploadedImages.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {uploadedImages.map((img) => (
                            <div key={img.id} className="relative group">
                              <img
                                src={img.src}
                                alt="Uploaded"
                                className="w-20 h-20 object-cover rounded-lg shadow-md border-2 border-purple-200 dark:border-purple-800"
                              />
                              <button
                                onClick={() => removeImage(img.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title={t('demos.ai_gallery.remove_image')}
                                aria-label={t('demos.ai_gallery.remove_image')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 搜索输入框 */}
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onPaste={handlePaste}
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                          placeholder={t('demos.ai_gallery.search_placeholder')}
                          className="pr-12 py-6 text-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          {/* <Upload className="w-5 h-5 text-slate-400" /> */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            className="hidden"
                            title={t('demos.ai_gallery.file_input_title')}
                            aria-label={t('demos.ai_gallery.file_input_label')}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-slate-500 hover:text-purple-600"
                            title={t('demos.ai_gallery.upload_button_title')}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* 搜索按钮和提示 */}
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
                          {t('demos.ai_gallery.upload_hint')}
                        </p>
                        <Button
                          onClick={handleSearch}
                          disabled={isSearching || (!searchQuery && uploadedImages.length === 0)}
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 shadow-lg w-full sm:w-auto"
                        >
                          {isSearching ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                              {t('demos.ai_gallery.searching')}
                            </>
                          ) : (
                            <>
                              <Search className="w-5 h-5 mr-3" />
                              {t('demos.ai_gallery.search_button')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 示例查询区域 */}
              <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {t('demos.ai_gallery.examples_title')}
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={randomizeExamples}
                      disabled={isShuffling}
                      className="relative"
                    >
                      <Shuffle className={`w-4 h-4 mr-2 transition-transform ${isShuffling ? 'animate-spin' : ''}`} />
                      {isShuffling ? t('demos.ai_gallery.shuffling') : t('demos.ai_gallery.random_button')}
                    </Button>
                  </div>
                  <div className={`grid grid-cols-3 md:grid-cols-6 gap-3 transition-all duration-600 ${isShuffling ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    {currentExamples.map((src, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(src)}
                        disabled={isShuffling}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all transform hover:scale-105 disabled:cursor-not-allowed"
                        title={t('demos.ai_gallery.example_image_title', { index: index + 1 })}
                      >
                        <img
                          src={src}
                          alt={`Example ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* 搜索结果 */
            <div className="space-y-8">
              {/* 重新搜索按钮 */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setHasSearched(false)
                    setSearchResults([])
                                      setSearchQuery('')
                  setUploadedImages([])
                  setSearchTiming(null)
                  setPage(1)
                  setHasMoreResults(true)
                    setSearchTiming(null)
                    setPage(1)
                    setHasMoreResults(true)
                  }}
                  variant="outline"
                  className="mb-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {t('demos.ai_gallery.new_search')}
                </Button>
              </div>

              {/* 搜索结果标题和耗时信息 */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {t('demos.ai_gallery.results_title')}
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
                  <p>{t('demos.ai_gallery.results_count', { count: searchResults.length })}</p>
                  {searchTiming && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t('demos.ai_gallery.search_timing', {
                          total: searchTiming.total,
                          processing: searchTiming.imageProcessing,
                          vectorization: searchTiming.vectorization,
                          database: searchTiming.databaseSearch
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 搜索结果网格 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <Card key={result.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm py-0 my-6">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={result.src}
                        alt={`Result ${result.id}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge 
                          className={`${
                            result.similarity >= 0.8 
                              ? 'bg-green-500' 
                              : result.similarity >= 0.6 
                              ? 'bg-yellow-500' 
                              : 'bg-orange-500'
                          } text-white font-semibold shadow-lg`}
                        >
                          {Math.round(result.similarity * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* 加载更多指示器 */}
              {isLoadingMore && (
                <div className="text-center mt-8">
                  <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('demos.ai_gallery.loading_more')}</span>
                  </div>
                </div>
              )}
              
              {/* 没有更多结果提示 */}
              {!hasMoreResults && searchResults.length > 0 && (
                <div className="text-center mt-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t('demos.ai_gallery.no_more_results')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
