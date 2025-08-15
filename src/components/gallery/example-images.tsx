'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { AI_GALLERY_CONFIG, ERROR_KEYS, buildImageUrl } from '@/lib/gallery/config'
import { GallaryImageList } from '@/data'

// 从真实图片数据中随机选择示例图片
const getRandomExampleImages = (count: number = 6) => {
  const shuffled = [...GallaryImageList].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(item => buildImageUrl(item.img_name))
}

// 获取固定的初始示例图片（避免水合问题）
const getInitialExampleImages = (count: number = 6) => {
  return GallaryImageList.slice(0, count).map(item => buildImageUrl(item.img_name))
}

interface ExampleImagesProps {
  onExampleClick: (src: string) => Promise<void>
  currentImageCount: number
}

export function GalleryExampleImages({ onExampleClick, currentImageCount }: ExampleImagesProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const [currentExamples, setCurrentExamples] = useState(() => getInitialExampleImages(6))
  const [isShuffling, setIsShuffling] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // 水合后随机化示例图片
  useEffect(() => {
    setIsHydrated(true)
    // 在客户端水合后稍微延迟一下再随机化，避免闪烁
    const timer = setTimeout(() => {
      setCurrentExamples(getRandomExampleImages(6))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleExampleClick = async (src: string) => {
    // 检查文件数量限制
    if (currentImageCount >= AI_GALLERY_CONFIG.MAX_FILES) {
      toast({
        variant: "destructive",
        title: t("demos.ai_gallery.error_upload_failed"),
        description: t(ERROR_KEYS.TOO_MANY_FILES, { max: AI_GALLERY_CONFIG.MAX_FILES }),
      });
      return;
    }
    
    try {
      await onExampleClick(src)
    } catch (error) {
      console.error('Failed to add example image:', error)
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
      const newExamples = getRandomExampleImages(6)
      setCurrentExamples(newExamples)
      setIsShuffling(false)
    }, 600)
  }

  return (
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
        <div className={`grid grid-cols-3 md:grid-cols-6 gap-3 transition-all duration-300 ${isShuffling ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} ${!isHydrated ? 'opacity-80' : ''}`}>
          {currentExamples.map((src, index) => (
            <button
              key={`${src}-${index}`}
              onClick={() => handleExampleClick(src)}
              disabled={isShuffling || !isHydrated}
              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all transform hover:scale-105 disabled:cursor-not-allowed cursor-pointer"
              title={t('demos.ai_gallery.example_image_title', { index: index + 1 })}
            >
              <img
                src={src}
                alt={`Example ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
