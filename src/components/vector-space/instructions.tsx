'use client'

import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function VectorSpaceInstructions() {
  const t = useTranslations()

  return (
    <motion.div 
      className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
        <Eye className="w-4 h-4 text-blue-600" />
        {t('demos.ai_gallery.vector_space.instructions.title')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
        <div>• {t('demos.ai_gallery.vector_space.instructions.zoom')}</div>
        <div>• {t('demos.ai_gallery.vector_space.instructions.pan')}</div>
        <div>• {t('demos.ai_gallery.vector_space.instructions.click')}</div>
        <div>• {t('demos.ai_gallery.vector_space.instructions.search')}</div>
        <div>• {t('demos.ai_gallery.vector_space.instructions.cluster')}</div>
        <div>• {t('demos.ai_gallery.vector_space.instructions.preview')}</div>
      </div>
    </motion.div>
  )
}
