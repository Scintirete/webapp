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
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1506102383123-c8ef1e872756?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1515041219749-89347f83291a?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1445463595953-0c6c8ad1303e?w=100&h=100&fit=crop'
]

export function AnimatedImageBackground() {
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    // 初始化图片
    const initialImages: ImageItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      src: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.5 + Math.random() * 2, // 0.5-2.5px per frame
      direction: Math.random() * 2 * Math.PI,
      size: 60 + Math.random() * 40, // 60-100px
      opacity: 0.1 + Math.random() * 0.3 // 0.1-0.4
    }))

    setImages(initialImages)

    const updateImages = () => {
      setImages(prevImages => 
        prevImages.map(img => {
          let newX = img.x + Math.cos(img.direction) * img.speed
          let newY = img.y + Math.sin(img.direction) * img.speed

          // 边界反弹
          if (newX <= 0 || newX >= window.innerWidth - img.size) {
            img.direction = Math.PI - img.direction
            newX = Math.max(0, Math.min(window.innerWidth - img.size, newX))
          }
          if (newY <= 0 || newY >= window.innerHeight - img.size) {
            img.direction = -img.direction
            newY = Math.max(0, Math.min(window.innerHeight - img.size, newY))
          }

          return {
            ...img,
            x: newX,
            y: newY
          }
        })
      )
    }

    const interval = setInterval(updateImages, 50) // 20 FPS

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {images.map((img) => (
        <div
          key={img.id}
          className="absolute transition-all duration-75 ease-linear"
          style={{
            '--img-x': `${img.x}px`,
            '--img-y': `${img.y}px`,
            '--img-size': `${img.size}px`,
            '--img-opacity': img.opacity,
            left: 'var(--img-x)',
            top: 'var(--img-y)',
            width: 'var(--img-size)',
            height: 'var(--img-size)',
            opacity: 'var(--img-opacity)'
          } as React.CSSProperties}
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
