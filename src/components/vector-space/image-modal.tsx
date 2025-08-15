'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { buildImageUrl } from '@/lib/gallery/config'

interface ImageModalProps {
  selectedImage: string | null
  onClose: () => void
}

export function ImageModal({ selectedImage, onClose }: ImageModalProps) {
  const t = useTranslations()
  
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              ×
            </button>
            
            {/* 图片内容 */}
            <div className="relative">
              <img
                src={buildImageUrl(selectedImage)}
                alt={selectedImage}
                className="w-full h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.png' // 可以设置一个占位图
                }}
              />
              
              {/* 图片信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-lg font-semibold mb-2">
                  {selectedImage}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t('demos.ai_gallery.vector_space.modal.close_hint')}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
