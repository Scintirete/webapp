'use client'

import { useRef, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { VectorPoint, ClusterPoint, ViewTransform } from './types'
import { ScaleLinear } from 'd3-scale'

interface VectorSpaceVisualizationProps {
  dimensions: { width: number; height: number }
  transform: ViewTransform
  visiblePoints: (VectorPoint | ClusterPoint)[]
  pointsWithPreview: Set<string>
  hoveredPoint: string | null
  searchQuery: string
  scales: { xScale: ScaleLinear<number, number>; yScale: ScaleLinear<number, number> }
  onPointHover: (pointId: string | null) => void
  onPointClick: (point: VectorPoint | ClusterPoint) => void
  getPointRadius: (isHovered: boolean, isFiltered: boolean) => number
}

export const VectorSpaceVisualization = forwardRef<SVGSVGElement, VectorSpaceVisualizationProps>(
  ({
    dimensions,
    transform,
    visiblePoints,
    pointsWithPreview,
    hoveredPoint,
    searchQuery,
    scales,
    onPointHover,
    onPointClick,
    getPointRadius
  }, ref) => {
    const t = useTranslations()
    
    return (
      <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <svg
          ref={ref}
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
            {visiblePoints.map((point) => {
              const cx = scales.xScale(point.x)
              const cy = scales.yScale(point.y)
              const isHovered = hoveredPoint === point.id
              
              // 检查是否是聚类点
              if ('isCluster' in point && point.isCluster) {
                const clusterRadius = Math.max(
                  scales.xScale(point.radius) - scales.xScale(0),
                  20 / transform.k
                )
                
                return (
                  <motion.g
                    key={point.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 聚类圆形边界 */}
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={clusterRadius}
                      fill="rgba(99, 102, 241, 0.1)"
                      stroke={isHovered ? 'rgba(99, 102, 241, 1)' : 'rgba(99, 102, 241, 0.6)'}
                      strokeWidth={isHovered ? 3 / transform.k : 2 / transform.k}
                      strokeDasharray={`${4 / transform.k} ${2 / transform.k}`}
                      className="cursor-pointer"
                      onMouseEnter={() => onPointHover(point.id)}
                      onMouseLeave={() => onPointHover(null)}
                      onClick={() => onPointClick(point)}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* 聚类中心点 */}
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={8 / transform.k}
                      fill={isHovered ? 'rgba(99, 102, 241, 1)' : 'rgba(99, 102, 241, 0.8)'}
                      className="cursor-pointer"
                      onMouseEnter={() => onPointHover(point.id)}
                      onMouseLeave={() => onPointHover(null)}
                      onClick={() => onPointClick(point)}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* 数字标记 */}
                    <text
                      x={cx}
                      y={cy + 1.5 / transform.k}
                      textAnchor="middle"
                      fontSize={Math.max(10 / transform.k, 8)}
                      fill="white"
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                      className="pointer-events-none select-none"
                    >
                      {point.count}
                    </text>
                  </motion.g>
                )
              }
              
              // 普通单点渲染
              const isFiltered = Boolean(searchQuery.trim() && 'img_name' in point && point.img_name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                  onMouseEnter={() => onPointHover(point.id)}
                  onMouseLeave={() => onPointHover(null)}
                  onClick={() => onPointClick(point)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                />
              )
            })}
          </g>

          {/* 图片预览 */}
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {visiblePoints
              .filter(point => !('isCluster' in point) && pointsWithPreview.has(point.id))
              .map((point) => {
                const cx = scales.xScale(point.x)
                const cy = scales.yScale(point.y)
                const imageSize = 60 / transform.k // 图片大小随缩放反向调整以保持视觉大小
                
                return (
                  <motion.g
                    key={`preview-${point.id}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 图片背景 */}
                    <rect
                      x={cx - imageSize / 2}
                      y={cy - imageSize / 2 - 20 / transform.k}
                      width={imageSize}
                      height={imageSize}
                      rx={4 / transform.k}
                      fill="white"
                      stroke="rgba(0, 0, 0, 0.1)"
                      strokeWidth={1 / transform.k}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    />
                    
                    {/* 图片 */}
                    <image
                      x={cx - imageSize / 2 + 2 / transform.k}
                      y={cy - imageSize / 2 - 20 / transform.k + 2 / transform.k}
                      width={imageSize - 4 / transform.k}
                      height={imageSize - 4 / transform.k}
                      href={`/gallary/${'img_name' in point ? point.img_name : ''}`}
                      className="cursor-pointer"
                      onClick={() => onPointClick(point)}
                      onError={(e) => {
                        // 如果图片加载失败，隐藏预览
                        const target = e.target as SVGImageElement
                        target.style.display = 'none'
                      }}
                    />
                    
                    {/* 图片名称 */}
                    <text
                      x={cx}
                      y={cy + imageSize / 2 - 10 / transform.k}
                      textAnchor="middle"
                      fontSize={10 / transform.k}
                      fill="rgba(0, 0, 0, 0.7)"
                      fontFamily="Inter, sans-serif"
                      className="pointer-events-none"
                    >
                      {'img_name' in point ? (
                        point.img_name.length > 12 ? 
                          `${point.img_name.substring(0, 12)}...` : 
                          point.img_name
                      ) : ''}
                    </text>
                  </motion.g>
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
                  const point = visiblePoints.find(p => p.id === hoveredPoint)
                  if (!point) return null
                  
                  // 聚类点的悬停提示
                  if ('isCluster' in point && point.isCluster) {
                    const cx = scales.xScale(point.x) * transform.k + transform.x
                    const cy = scales.yScale(point.y) * transform.k + transform.y
                    
                    return (
                      <g>
                        <rect
                          x={cx + 10}
                          y={cy - 40}
                          width={140}
                          height={34}
                          rx={4}
                          fill="rgba(0, 0, 0, 0.8)"
                        />
                        <text
                          x={cx + 80}
                          y={cy - 22}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontFamily="Inter, sans-serif"
                        >
                          {t('demos.ai_gallery.vector_space.cluster_tooltip', { count: point.count })}
                        </text>
                        <text
                          x={cx + 80}
                          y={cy - 8}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.7)"
                          fontSize="10"
                          fontFamily="Inter, sans-serif"
                        >
                          {t('demos.ai_gallery.vector_space.cluster_action')}
                        </text>
                      </g>
                    )
                  }
                  
                  // 单个点的悬停提示
                  if (!('isCluster' in point)) {
                    const cx = scales.xScale(point.x) * transform.k + transform.x
                    const cy = scales.yScale(point.y) * transform.k + transform.y
                    
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
                  }
                  
                  return null
                })()}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    )
  }
)

VectorSpaceVisualization.displayName = 'VectorSpaceVisualization'
