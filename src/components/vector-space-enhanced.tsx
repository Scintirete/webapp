'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  VectorSpaceControls,
  VectorSpaceVisualization,
  VectorSpaceIntro,
  VectorSpaceInstructions,
  ImageModal,
  useVectorSpace
} from './vector-space'

export function VectorSpaceEnhanced() {
  const t = useTranslations()
  const [showIntro, setShowIntro] = useState(true)
  
  const {
    // Refs
    svgRef,
    containerRef,
    
    // State
    dimensions,
    isClient,
    transform,
    selectedImage,
    setSelectedImage,
    hoveredPoint,
    setHoveredPoint,
    searchQuery,
    setSearchQuery,
    isSearching,
    hasSearched,
    
    // Computed values
    points,
    scales,
    visiblePoints,
    filteredPoints,
    pointsWithPreview,
    
    // Functions
    getPointRadius,
    handlePointClick,
    handleSearch,
    clearSearch,
    resetView,
    zoomIn,
    zoomOut
  } = useVectorSpace()

  if (!isClient || dimensions.width === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <motion.div 
              className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-slate-600 dark:text-slate-300">
              {t('demos.ai_gallery.vector_space.loading')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">
          {t('demos.ai_gallery.vector_space.badge')}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('demos.ai_gallery.vector_space.title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          {t('demos.ai_gallery.vector_space.description')}
        </p>
      </div>

      {/* 数据集信息 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {t('demos.dataset_info.source')}: {t('demos.dataset_info.pascal_voc_2012')}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {t('demos.dataset_info.pascal_voc_description')}
              </div>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30">
            <a href={t('demos.dataset_info.pascal_voc_url')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
              {t('demos.dataset_info.learn_more')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* 介绍说明 */}
      <VectorSpaceIntro 
        showIntro={showIntro}
        onClose={() => setShowIntro(false)}
      />

      {/* 控制面板 */}
      <VectorSpaceControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        isSearching={isSearching}
        hasSearched={hasSearched}
        visiblePointsCount={visiblePoints.length}
        totalPointsCount={points.length}
        previewCount={pointsWithPreview.size}
        zoomLevel={transform.k}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
      />

      {/* SVG 可视化容器 */}
      <Card>
        <CardContent className="p-4" ref={containerRef}>
          <VectorSpaceVisualization
            ref={svgRef}
            dimensions={dimensions}
            transform={transform}
            visiblePoints={visiblePoints}
            pointsWithPreview={pointsWithPreview}
            hoveredPoint={hoveredPoint}
            searchQuery={searchQuery}
            scales={scales}
            onPointHover={setHoveredPoint}
            onPointClick={handlePointClick}
            getPointRadius={getPointRadius}
          />
          
          {/* 操作说明 */}
          <VectorSpaceInstructions />
        </CardContent>
      </Card>

      {/* 图片查看器 */}
      <ImageModal
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  )
}