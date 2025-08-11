'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AnimatedImageBackground } from '@/components/animated-image-background'
import { Upload, X, Search, Shuffle, Loader2, Image as ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UploadedImage {
  id: string
  src: string
  file: File
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof SEARCH_RESULTS>([])
  const [currentExamples, setCurrentExamples] = useState(EXAMPLE_IMAGES)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            src: e.target?.result as string,
            file
          }
          setUploadedImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      Array.from(items).forEach(item => {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleFileUpload(new DataTransfer().files)
            const reader = new FileReader()
            reader.onload = (e) => {
              const newImage: UploadedImage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                src: e.target?.result as string,
                file
              }
              setUploadedImages(prev => [...prev, newImage])
            }
            reader.readAsDataURL(file)
          }
        }
      })
    }
  }, [handleFileUpload])

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const handleExampleClick = (src: string) => {
    setSearchQuery(src)
    setUploadedImages([])
  }

  const randomizeExamples = () => {
    const shuffled = [...EXAMPLE_IMAGES].sort(() => Math.random() - 0.5)
    setCurrentExamples(shuffled)
  }

  const handleSearch = async () => {
    if (!searchQuery && uploadedImages.length === 0) return

    setIsSearching(true)
    setHasSearched(false)

    // 模拟搜索延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    setSearchResults(SEARCH_RESULTS)
    setIsSearching(false)
    setHasSearched(true)
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
              {/* 上传图片区域 */}
              {uploadedImages.length > 0 && (
                <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.src}
                            alt="Uploaded"
                            className="w-20 h-20 object-cover rounded-lg shadow-md"
                          />
                          <button
                            onClick={() => removeImage(img.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title={t('demos.ai_gallery.remove_image')}
                            aria-label={t('demos.ai_gallery.remove_image')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 搜索输入框 */}
              <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
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
                        <Upload className="w-5 h-5 text-slate-400" />
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
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      {t('demos.ai_gallery.upload_hint')}
                    </p>
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
                    <Button variant="outline" size="sm" onClick={randomizeExamples}>
                      <Shuffle className="w-4 h-4 mr-2" />
                      {t('demos.ai_gallery.random_button')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {currentExamples.map((src, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(src)}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all transform hover:scale-105"
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

              {/* 搜索按钮 */}
              <div className="text-center">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || (!searchQuery && uploadedImages.length === 0)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-lg shadow-xl"
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
                  }}
                  variant="outline"
                  className="mb-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {t('demos.ai_gallery.new_search')}
                </Button>
              </div>

              {/* 搜索结果标题 */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {t('demos.ai_gallery.results_title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('demos.ai_gallery.results_count', { count: searchResults.length })}
                </p>
              </div>

              {/* 搜索结果网格 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <Card key={result.id} className="overflow-hidden hover:shadow-xl transition-shadow bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={result.src}
                        alt={`Result ${result.id}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-purple-500 text-white">
                          {Math.round(result.similarity * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {t('demos.ai_gallery.similarity')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ 
                                '--progress-width': `${result.similarity * 100}%`,
                                width: 'var(--progress-width)'
                              } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {Math.round(result.similarity * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
