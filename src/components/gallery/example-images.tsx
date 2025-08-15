'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { AI_GALLERY_CONFIG, ERROR_KEYS } from '@/lib/ai-gallery-config'

const EXAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop'
]

interface ExampleImagesProps {
  onExampleClick: (src: string) => Promise<void>
  currentImageCount: number
}

export function GalleryExampleImages({ onExampleClick, currentImageCount }: ExampleImagesProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const [currentExamples, setCurrentExamples] = useState(EXAMPLE_IMAGES)
  const [isShuffling, setIsShuffling] = useState(false)

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
      const shuffled = [...EXAMPLE_IMAGES].sort(() => Math.random() - 0.5)
      setCurrentExamples(shuffled)
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
  )
}
