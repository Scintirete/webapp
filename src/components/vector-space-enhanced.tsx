'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleLinear } from 'd3-scale'
import { zoom as d3Zoom, ZoomBehavior } from 'd3-zoom'
import { select } from 'd3-selection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, Info, Search, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GallaryImageList } from '@/data'
import { ImageViewer } from '@/components/gallery/image-viewer'

interface VectorPoint {
  img_name: string
  x: number
  y: number
  id: string
}

interface ViewTransform {
  x: number
  y: number
  k: number
}

export function VectorSpaceEnhanced() {
  const t = useTranslations()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, k: 1 })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 转换数据为适合的格式
  const points = useMemo((): VectorPoint[] => {
    return GallaryImageList.map((item, index) => ({
      img_name: item.img_name,
      x: item.pos[0],
      y: item.pos[1],
      id: `point-${index}`
    }))
  }, [])

  // 创建比例尺
  const scales = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return { xScale: scaleLinear(), yScale: scaleLinear() }
    }
    
    const margin = 40
    const xScale = scaleLinear()
      .domain([0, 1])
      .range([margin, dimensions.width - margin])
    
    const yScale = scaleLinear()
      .domain([0, 1])
      .range([margin, dimensions.height - margin])
    
    return { xScale, yScale }
  }, [dimensions])

  // 响应式尺寸更新
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const width = Math.max(800, rect.width - 32)
        const height = Math.max(600, window.innerHeight * 0.7)
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // 初始化 D3 缩放
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = select(svgRef.current)
    
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform
        setTransform({ x, y, k })
      })

    svg.call(zoomBehavior)
    zoomRef.current = zoomBehavior

    return () => {
      svg.on('.zoom', null)
    }
  }, [dimensions])

  // 重置视图
  const resetView = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      const svg = select(svgRef.current)
      svg.transition()
        .duration(750)
        .call(zoomRef.current.transform, { x: 0, y: 0, k: 1 } as any)
    }
  }, [])

  // 缩放控制
  const zoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      const svg = select(svgRef.current)
      svg.transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.5)
    }
  }, [])

  const zoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      const svg = select(svgRef.current)
      svg.transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.75)
    }
  }, [])

  // 过滤搜索结果
  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) return points
    return points.filter(point => 
      point.img_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [points, searchQuery])

  // 点击处理
  const handlePointClick = useCallback((point: VectorPoint) => {
    setSelectedImage(point.img_name)
  }, [])

  // 计算点的大小
  const getPointRadius = useCallback((isHovered: boolean, isFiltered: boolean) => {
    const baseRadius = 3
    const scaleMultiplier = Math.min(2, Math.max(0.5, transform.k * 0.5))
    let radius = baseRadius * scaleMultiplier
    
    if (isHovered) radius *= 1.5
    if (isFiltered) radius *= 1.2
    
    return Math.max(2, Math.min(12, radius))
  }, [transform.k])

  if (dimensions.width === 0) {
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
              {t('demos.vector_space.loading')}
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
          {t('demos.vector_space.badge')}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('demos.vector_space.title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          {t('demos.vector_space.description')}
        </p>
      </div>

      {/* 介绍说明 */}
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
                    {t('demos.vector_space.intro.title')}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowIntro(false)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300">
                  {t('demos.vector_space.intro.description')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {(t.raw('demos.vector_space.intro.details') as string[]).map((detail, index) => (
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

      {/* 控制面板 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 搜索框 */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('demos.vector_space.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Badge variant="secondary" className="text-sm whitespace-nowrap">
                {filteredPoints.length} / {points.length} 图片
              </Badge>
            </div>
            
            {/* 状态信息和控制按钮 */}
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {t('demos.vector_space.stats.zoom_level', { level: transform.k.toFixed(1) })}
              </Badge>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={zoomOut} title={t('demos.vector_space.controls.zoom_out')}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={zoomIn} title={t('demos.vector_space.controls.zoom_in')}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetView} title={t('demos.vector_space.controls.reset_view')}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SVG 可视化容器 */}
      <Card>
        <CardContent className="p-4" ref={containerRef}>
          <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* 背景网格 */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 50 0 L 0 0 0 50" 
                    fill="none" 
                    stroke="rgba(148, 163, 184, 0.1)" 
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              
              {transform.k <= 2 && (
                <rect 
                  width="100%" 
                  height="100%" 
                  fill="url(#grid)"
                  transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
                />
              )}

              {/* 坐标轴 */}
              <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                <line
                  x1={scales.xScale(0)}
                  y1={scales.yScale(0)}
                  x2={scales.xScale(1)}
                  y2={scales.yScale(0)}
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth={1 / transform.k}
                />
                <line
                  x1={scales.xScale(0)}
                  y1={scales.yScale(0)}
                  x2={scales.xScale(0)}
                  y2={scales.yScale(1)}
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth={1 / transform.k}
                />
              </g>

              {/* 数据点 */}
              <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                {filteredPoints.map((point) => {
                  const cx = scales.xScale(point.x)
                  const cy = scales.yScale(point.y)
                  const isHovered = hoveredPoint === point.id
                  const isFiltered = Boolean(searchQuery.trim() && point.img_name.toLowerCase().includes(searchQuery.toLowerCase()))
                  const radius = getPointRadius(isHovered, isFiltered)
                  
                  return (
                    <motion.circle
                      key={point.id}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={isHovered ? 'rgba(168, 85, 247, 0.8)' : isFiltered ? 'rgba(34, 197, 94, 0.7)' : 'rgba(59, 130, 246, 0.6)'}
                      stroke={isHovered ? 'rgba(168, 85, 247, 1)' : isFiltered ? 'rgba(34, 197, 94, 1)' : 'rgba(59, 130, 246, 0.8)'}
                      strokeWidth={isHovered ? 2 / transform.k : 1 / transform.k}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => handlePointClick(point)}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    />
                  )
                })}
              </g>

              {/* 悬停提示 */}
              <AnimatePresence>
                {hoveredPoint && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      const point = points.find(p => p.id === hoveredPoint)
                      if (!point) return null
                      
                      const cx = (scales.xScale(point.x) + transform.x) * transform.k
                      const cy = (scales.yScale(point.y) + transform.y) * transform.k
                      
                      return (
                        <g>
                          <rect
                            x={cx + 10}
                            y={cy - 30}
                            width={120}
                            height={24}
                            rx={4}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                          <text
                            x={cx + 70}
                            y={cy - 12}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontFamily="Inter, sans-serif"
                          >
                            {point.img_name}
                          </text>
                        </g>
                      )
                    })()}
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          </div>
          
          {/* 操作说明 */}
          <motion.div 
            className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              {t('demos.vector_space.instructions.title')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div>• {t('demos.vector_space.instructions.zoom')}</div>
              <div>• {t('demos.vector_space.instructions.pan')}</div>
              <div>• {t('demos.vector_space.instructions.click')}</div>
              <div>• {t('demos.vector_space.instructions.search')}</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* 图片查看器 */}
      <AnimatePresence>
        {selectedImage && (
          <ImageViewer
            image={{
              id: selectedImage,
              img_name: selectedImage,
              similarity: 1,
              src: `/gallary/${selectedImage}`
            }}
          >
            <motion.div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-60 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </motion.div>
          </ImageViewer>
        )}
      </AnimatePresence>
    </div>
  )
}
