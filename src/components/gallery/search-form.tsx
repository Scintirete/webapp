'use client'

import { useState, useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Search, Loader2, Image as ImageIcon, Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { AI_GALLERY_CONFIG, validateFile, validateFileCount, ERROR_KEYS } from '@/lib/ai-gallery-config'

interface UploadedImage {
  id: string
  src: string
  file: File
}

interface SearchFormProps {
  onSearch: (query: string, images: File[]) => Promise<void>
  isSearching: boolean
  onImageCountChange?: (count: number) => void
}

export interface SearchFormRef {
  addExampleImage: (src: string) => Promise<void>
}

export const GallerySearchForm = forwardRef<SearchFormRef, SearchFormProps>(function GallerySearchForm({ onSearch, isSearching, onImageCountChange }, ref) {
  const t = useTranslations()
  const { toast } = useToast()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 使用useEffect来避免在render过程中调用setState
  useEffect(() => {
    onImageCountChange?.(uploadedImages.length)
  }, [uploadedImages.length, onImageCountChange])

  // 初始化随机占位符和候选建议
  useEffect(() => {
    const allSuggestions = t.raw('demos.ai_gallery.search_suggestions') as string[]
    if (allSuggestions && Array.isArray(allSuggestions)) {
      // 随机选择一个作为占位符
      const randomIndex = Math.floor(Math.random() * allSuggestions.length)
      const randomSuggestion = allSuggestions[randomIndex]
      const trySearchText = t('demos.ai_gallery.try_searching')
      const orText = t('demos.ai_gallery.or')
      setPlaceholderText(`${trySearchText} "${randomSuggestion}" ${orText} ${t('demos.ai_gallery.search_placeholder')}`)
      
      // 随机选择6个作为候选建议（排除已选中的占位符）
      const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5)
      const selectedSuggestions = shuffled.slice(0, 6)
      setSuggestions(selectedSuggestions)
    } else {
      setPlaceholderText(t('demos.ai_gallery.search_placeholder'))
      setSuggestions([])
    }
  }, [t])

  // 随机刷新候选建议
  const refreshSuggestions = () => {
    const allSuggestions = t.raw('demos.ai_gallery.search_suggestions') as string[]
    if (allSuggestions && Array.isArray(allSuggestions)) {
      const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5)
      const selectedSuggestions = shuffled.slice(0, 6)
      setSuggestions(selectedSuggestions)
    }
  }

  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
  }

  // 当用户开始输入时隐藏建议
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value.length > 0) {
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
    }
  }

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
          const newList = [...prev, newImage];
          return newList;
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

  // 公共方法：添加示例图片
  const addExampleImage = async (src: string) => {
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
      throw error;
    }
  }

  const handleSubmit = async () => {
    if (!searchQuery && uploadedImages.length === 0) return
    
    const imageFiles = uploadedImages.map(img => img.file)
    await onSearch(searchQuery, imageFiles)
  }

  const clearForm = () => {
    setSearchQuery('')
    setUploadedImages([])
    setShowSuggestions(true)
  }

  // 使用 useImperativeHandle 暴露方法
  useImperativeHandle(ref, () => ({
    addExampleImage
  }), [addExampleImage])

  return (
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
                onChange={handleInputChange}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                placeholder={placeholderText}
                className="pr-12 py-6 text-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
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

            {/* 候选建议 */}
            {showSuggestions && suggestions.length > 0 && searchQuery.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {t('demos.ai_gallery.search_suggestions_title')}
                  </h4>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={refreshSuggestions}
                    className="text-slate-500 hover:text-purple-600 h-auto p-1"
                    title={t('demos.ai_gallery.refresh_suggestions')}
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-300 transition-colors px-3 py-1"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* 搜索按钮和提示 */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
                {t('demos.ai_gallery.upload_hint')}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={clearForm}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3"
                >
                  {t('demos.ai_gallery.clear_button')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSearching || (!searchQuery && uploadedImages.length === 0)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 shadow-lg"
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
        </div>
      </CardContent>
    </Card>
  )
})
