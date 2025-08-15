'use client'

import { Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface VectorSpaceControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  visiblePointsCount: number
  totalPointsCount: number
  previewCount: number
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
}

export function VectorSpaceControls({
  searchQuery,
  onSearchChange,
  visiblePointsCount,
  totalPointsCount,
  previewCount,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetView
}: VectorSpaceControlsProps) {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 搜索框 */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('demos.ai_gallery.vector_space.search_placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm whitespace-nowrap">
                {t('demos.ai_gallery.vector_space.stats.visible_count', { visible: visiblePointsCount, total: totalPointsCount })}
              </Badge>
              {previewCount > 0 && (
                <Badge variant="outline" className="text-sm whitespace-nowrap">
                  {t('demos.ai_gallery.vector_space.stats.preview_count', { count: previewCount })}
                </Badge>
              )}
            </div>
          </div>
          
          {/* 状态信息和控制按钮 */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {t('demos.ai_gallery.vector_space.stats.zoom_level', { level: zoomLevel.toFixed(1) })}
            </Badge>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onZoomOut} title={t('demos.ai_gallery.vector_space.controls.zoom_out')}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onZoomIn} title={t('demos.ai_gallery.vector_space.controls.zoom_in')}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onResetView} title={t('demos.ai_gallery.vector_space.controls.reset_view')}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
