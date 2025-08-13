'use client'

import { useEffect, useState } from 'react'

interface ImageItem {
  id: number
  src: string
  x: number
  y: number
  speed: number
  direction: number
  size: number
  opacity: number
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506102383123-c8ef1e872756?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1515041219749-89347f83291a?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1445463595953-0c6c8ad1303e?w=200&h=200&fit=crop'
]

export function AnimatedImageBackground() {
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    // 等待组件挂载后再初始化，避免SSR问题
    const initializeImages = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      const initialImages: ImageItem[] = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        src: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
        x: Math.random() * (windowWidth - 200), // 给边界留出空间
        y: Math.random() * (windowHeight - 200),
        speed: 0.5 + Math.random() * 1.0, // 0.5-1.5px per frame
        direction: Math.random() * 2 * Math.PI,
        size: 100 + Math.random() * 60, // 100-160px
        opacity: 0.1 + Math.random() * 0.2 // 0.1-0.3（降低透明度）
      }))

      setImages(initialImages)
    }

    // 延迟初始化避免水合错误
    const timer = setTimeout(initializeImages, 100)

    let animationId: number

    const updateImages = () => {
      setImages(prevImages => 
        prevImages.map(img => {
          let newX = img.x + Math.cos(img.direction) * img.speed
          let newY = img.y + Math.sin(img.direction) * img.speed

          // 平滑边界反弹 - 使用弹性边界
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight
          
          if (newX <= 0 || newX >= windowWidth - img.size) {
            img.direction = Math.PI - img.direction + (Math.random() - 0.5) * 0.2 // 添加随机性
            newX = Math.max(0, Math.min(windowWidth - img.size, newX))
          }
          if (newY <= 0 || newY >= windowHeight - img.size) {
            img.direction = -img.direction + (Math.random() - 0.5) * 0.2 // 添加随机性
            newY = Math.max(0, Math.min(windowHeight - img.size, newY))
          }

          return {
            ...img,
            x: newX,
            y: newY
          }
        })
      )
      
      animationId = requestAnimationFrame(updateImages)
    }

    // 使用 requestAnimationFrame 而不是 setInterval 获得更平滑的动画
    if (images.length > 0) {
      updateImages()
    }

    return () => {
      clearTimeout(timer)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [images.length === 0]) // 只在初始化时运行

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {images.map((img) => (
        <div
          key={img.id}
          className="absolute will-change-transform"
          style={{
            transform: `translate3d(${img.x}px, ${img.y}px, 0)`,
            width: `${img.size}px`,
            height: `${img.size}px`,
            opacity: img.opacity
          }}
        >
          <img
            src={img.src}
            alt=""
            className="w-full h-full object-cover rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
