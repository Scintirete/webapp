'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface VectorSpaceIntroProps {
  showIntro: boolean
  onClose: () => void
}

export function VectorSpaceIntro({ showIntro, onClose }: VectorSpaceIntroProps) {
  const t = useTranslations()

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Info className="w-5 h-5 text-blue-600" />
                  {t('demos.ai_gallery.vector_space.intro.title')}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                {t('demos.ai_gallery.vector_space.intro.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {(t.raw('demos.ai_gallery.vector_space.intro.details') as string[]).map((detail, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                    <span className="text-slate-600 dark:text-slate-400">{detail}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
