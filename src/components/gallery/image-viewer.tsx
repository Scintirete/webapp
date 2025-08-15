'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Download, ZoomIn, ZoomOut, RotateCw, RotateCcw, Move, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface SearchResult {
  id: string
  img_name: string
  similarity: number
  src: string
}

interface ImageViewerProps {
  children: React.ReactNode
  image: SearchResult
  images?: SearchResult[]
  currentIndex?: number
  onNavigate?: (direction: 'prev' | 'next') => void
  className?: string
}

export function ImageViewer({ 
  children, 
  image, 
  images = [], 
  currentIndex = 0, 
  onNavigate,
  className 
}: ImageViewerProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [localIndex, setLocalIndex] = useState(currentIndex)

  // 同步外部currentIndex
  useEffect(() => {
    setLocalIndex(currentIndex)
  }, [currentIndex])

  // 当图片变化时重置变换状态
  useEffect(() => {
    resetTransform()
    setLoading(true)
  }, [localIndex])

  // 重置所有状态
  const resetTransform = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // 当对话框打开/关闭时重置状态
  useEffect(() => {
    if (!open) {
      resetTransform()
      setLoading(true)
    }
  }, [open])

  // 缩放功能
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // 旋转功能
  const handleRotate = (direction: 'cw' | 'ccw') => {
    setRotation(prev => prev + (direction === 'cw' ? 90 : -90))
  }

  // 拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // 拖拽中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  // 拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 下载图片
  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = currentImage.img_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载图片失败:', error)
    }
  }

  // 内部导航处理
  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && localIndex > 0) {
      const newIndex = localIndex - 1
      setLocalIndex(newIndex)
      onNavigate?.(direction)
    } else if (direction === 'next' && localIndex < images.length - 1) {
      const newIndex = localIndex + 1
      setLocalIndex(newIndex)
      onNavigate?.(direction)
    }
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'Escape':
          setOpen(false)
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleNavigation('prev')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNavigation('next')
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoom(0.2)
          break
        case '-':
          e.preventDefault()
          handleZoom(-0.2)
          break
        case '0':
          e.preventDefault()
          resetTransform()
          break
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, localIndex, images.length])

  const canNavigatePrev = localIndex > 0
  const canNavigateNext = localIndex < images.length - 1

  // 获取当前图片
  const currentImage = images[localIndex] || image

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="w-[90vw] h-[90vh] md:h-[70vh] p-0 bg-black/95 border-slate-700/50 backdrop-blur-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative w-full h-full">
          {/* 无障碍性标题 - 视觉上隐藏 */}
          <DialogTitle className="sr-only">
            {t('demos.ai_gallery.image_viewer_title')} - {currentImage.img_name} - {t('demos.ai_gallery.similarity_label')} {Math.round(currentImage.similarity)}%
          </DialogTitle>
          
          {/* 顶部信息栏 - 简化版本 */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                className={cn(
                  "text-white font-semibold shadow-lg",
                  currentImage.similarity >= 80 
                    ? 'bg-green-500/90' 
                    : currentImage.similarity >= 60 
                    ? 'bg-yellow-500/90' 
                    : 'bg-orange-500/90'
                )}
              >
                {Math.round(currentImage.similarity)}%
              </Badge>
              {images.length > 1 && (
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                  <p className="text-white text-sm">
                    {localIndex + 1} / {images.length}
                  </p>
                </div>
              )}
            </div>

            {/* 关闭按钮 */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20 bg-black/60 backdrop-blur-sm rounded-lg"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 底部工具栏 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-2 flex items-center gap-1 shadow-xl">
              {/* 缩放控制 */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => handleZoom(-0.2)}
                disabled={scale <= 0.5}
                title={t('demos.ai_gallery.image_controls.zoom_out')}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm px-2 min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => handleZoom(0.2)}
                disabled={scale >= 3}
                title={t('demos.ai_gallery.image_controls.zoom_in')}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-white/20 mx-1" />

              {/* 旋转控制 */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => handleRotate('ccw')}
                title={t('demos.ai_gallery.image_controls.rotate_left')}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => handleRotate('cw')}
                title={t('demos.ai_gallery.image_controls.rotate_right')}
              >
                <RotateCw className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-white/20 mx-1" />

              {/* 功能按钮 */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={resetTransform}
                title={t('demos.ai_gallery.image_controls.reset_view')}
              >
                <Move className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={handleDownload}
                title={t('demos.ai_gallery.image_controls.download')}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 导航按钮 */}
          {canNavigatePrev && (
            <Button
              variant="ghost"
              size="lg"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-full"
              onClick={() => handleNavigation('prev')}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {canNavigateNext && (
            <Button
              variant="ghost"
              size="lg" 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 rounded-full"
              onClick={() => handleNavigation('next')}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}

          {/* 图片容器 */}
          <div 
            className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none pt-[60px] pb-[80px] px-5"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <img
                src={currentImage.src}
                alt={currentImage.img_name}
                className={cn(
                  "max-w-full max-h-full object-contain transition-transform duration-200 ease-out",
                  loading && "blur-sm"
                )}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`
                }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                draggable={false}
              />
            </div>
          </div>

          {/* 键盘快捷键提示 */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-xs text-center opacity-75 min-w-[400px]">
                {t('demos.ai_gallery.keyboard_shortcuts')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
