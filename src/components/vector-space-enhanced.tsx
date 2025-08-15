'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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