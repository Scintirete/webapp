'use client'

import { useEffect, useState } from 'react'
import { GallaryImageList } from '@/data'
import { buildImageUrl } from '@/lib/gallery'

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

// 从真实图片数据中随机选择
const getRandomImages = (count: number = 20) => {
  const shuffled = [...GallaryImageList].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(item => buildImageUrl(item.img_name))
}

export function AnimatedImageBackground() {
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    // 等待组件挂载后再初始化，避免SSR问题
    const initializeImages = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      const randomImages = getRandomImages(20)
      const initialImages: ImageItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        src: randomImages[i % randomImages.length],
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
            width: img.size,
            height: img.size,
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
