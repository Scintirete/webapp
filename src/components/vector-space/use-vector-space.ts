'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { scaleLinear } from 'd3-scale'
import { zoom as d3Zoom, ZoomBehavior, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { GallaryImageList } from '@/data'
import { VectorPoint, ClusterPoint, ViewTransform } from './types'

export function useVectorSpace() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, k: 1 })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VectorPoint[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

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

  // LOD系统：根据缩放级别和距离筛选显示的点
  const visiblePoints = useMemo(() => {
    let basePoints = points
    
    // 如果有搜索结果，优先显示搜索结果
    if (hasSearched && searchResults.length > 0) {
      basePoints = searchResults
    }
    
    // LOD系统：根据缩放级别决定显示的点数量
    // 增加全局最大限制以确保性能
    const GLOBAL_MAX_POINTS = 800 // 全局最大点数限制
    const zoomLevel = transform.k
    let maxPoints: number
    
    if (zoomLevel < 0.3) {
      maxPoints = 30 // 极远距离只显示极少点
    } else if (zoomLevel < 0.5) {
      maxPoints = 80 // 远距离只显示少量代表性点
    } else if (zoomLevel < 1) {
      maxPoints = 200 // 中距离显示中等数量
    } else if (zoomLevel < 2) {
      maxPoints = 400 // 正常距离显示较多点
    } else if (zoomLevel < 4) {
      maxPoints = 600 // 放大时显示更多点
    } else {
      maxPoints = GLOBAL_MAX_POINTS // 高度放大时也要限制最大数量
    }
    
    // 确保不超过全局限制
    maxPoints = Math.min(maxPoints, GLOBAL_MAX_POINTS)
    
    // 高倍缩放时（>=15倍）不使用聚类，直接显示前N个点
    if (zoomLevel >= 10) {
      return basePoints.slice(0, GLOBAL_MAX_POINTS)
    }
    
    // 如果点数超过最大限制，使用空间分布算法选择代表性点
    if (basePoints.length <= maxPoints) {
      return basePoints
    }
    
    // 聚类算法：将空间分为网格，根据点密度决定是显示单点还是聚类
    const gridSize = Math.ceil(Math.sqrt(maxPoints * 0.8)) // 稍微减少网格数量以增加聚类机会
    const grid: { [key: string]: VectorPoint[] } = {}
    
    basePoints.forEach(point => {
      const gridX = Math.floor(point.x * gridSize)
      const gridY = Math.floor(point.y * gridSize)
      const key = `${gridX},${gridY}`
      
      if (!grid[key]) {
        grid[key] = []
      }
      grid[key].push(point)
    })
    
    // 根据网格中的点数量决定显示方式
    const result: (VectorPoint | ClusterPoint)[] = []
    Object.entries(grid).forEach(([key, gridPoints]) => {
      if (gridPoints.length === 0) return
      
      // 如果网格中只有1-2个点，显示单独的点
      if (gridPoints.length <= 2) {
        result.push(...gridPoints)
        return
      }
      
      // 如果网格中有多个点，创建聚类点
      const gridCenterX = gridPoints.reduce((sum, p) => sum + p.x, 0) / gridPoints.length
      const gridCenterY = gridPoints.reduce((sum, p) => sum + p.y, 0) / gridPoints.length
      
      // 计算聚类半径（包含所有点的最小圆）
      let maxDistance = 0
      gridPoints.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - gridCenterX, 2) + 
          Math.pow(point.y - gridCenterY, 2)
        )
        maxDistance = Math.max(maxDistance, distance)
      })
      
      const clusterPoint: ClusterPoint = {
        id: `cluster-${key}`,
        x: gridCenterX,
        y: gridCenterY,
        radius: Math.max(maxDistance, 0.01), // 最小半径
        count: gridPoints.length,
        points: gridPoints,
        isCluster: true
      }
      
      result.push(clusterPoint)
    })
    
    return result.slice(0, maxPoints)
  }, [points, searchResults, hasSearched, transform.k])
  
  // 用于统计显示的过滤点数
  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) return points
    return points.filter(point => 
      point.img_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [points, searchQuery])

  // 优化：防抖的变换状态，减少频繁更新
  const [debouncedTransform, setDebouncedTransform] = useState(transform)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTransform(transform)
    }, 50) // 50ms防抖
    
    return () => clearTimeout(timer)
  }, [transform])

  // 计算需要显示预览图片的点（当缩放级别足够高时）
  // 优化：使用防抖的transform减少频繁计算
  const pointsWithPreview = useMemo(() => {
    const PREVIEW_ZOOM_THRESHOLD = 10 // 缩放级别超过3时开始显示预览
    const MAX_PREVIEW_COUNT = 100 // 最大同时显示的预览图片数量
    
    if (debouncedTransform.k < PREVIEW_ZOOM_THRESHOLD) {
      return new Set<string>()
    }
    
    // 获取当前视口范围内的点
    const viewportPadding = 100 // 视口边距
    const viewportLeft = -debouncedTransform.x / debouncedTransform.k - viewportPadding
    const viewportRight = (dimensions.width - debouncedTransform.x) / debouncedTransform.k + viewportPadding
    const viewportTop = -debouncedTransform.y / debouncedTransform.k - viewportPadding
    const viewportBottom = (dimensions.height - debouncedTransform.y) / debouncedTransform.k + viewportPadding
    
    const viewportPoints = visiblePoints.filter(point => {
      const screenX = scales.xScale(point.x)
      const screenY = scales.yScale(point.y)
      return screenX >= viewportLeft && screenX <= viewportRight && 
             screenY >= viewportTop && screenY <= viewportBottom
    })
    
    // 如果视口内的点太多，选择距离视口中心最近的点
    if (viewportPoints.length <= MAX_PREVIEW_COUNT) {
      return new Set(viewportPoints.map(p => p.id))
    }
    
    const viewportCenterX = (viewportLeft + viewportRight) / 2
    const viewportCenterY = (viewportTop + viewportBottom) / 2
    
    const sortedByDistance = viewportPoints
      .map(point => ({
        point,
        distance: Math.sqrt(
          Math.pow(scales.xScale(point.x) - viewportCenterX, 2) +
          Math.pow(scales.yScale(point.y) - viewportCenterY, 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_PREVIEW_COUNT)
      .map(item => item.point.id)
    
    return new Set(sortedByDistance)
  }, [visiblePoints, debouncedTransform, dimensions, scales])

  // 计算点的大小（优化：添加防抖以减少频繁计算）
  const getPointRadius = useCallback((isHovered: boolean, isFiltered: boolean) => {
    const baseRadius = 3
    const scaleMultiplier = Math.min(2, Math.max(0.5, transform.k * 0.5))
    let radius = baseRadius * scaleMultiplier
    
    if (isHovered) radius *= 1.5
    if (isFiltered) radius *= 1.2
    
    return Math.max(2, Math.min(12, radius))
  }, [transform.k])

  // 清除搜索结果
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
  }, [])

  // AI搜索处理
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || isSearching) return
    
    setIsSearching(true)
    
    try {
      const formData = new FormData()
      formData.append('query', searchQuery.trim())
      formData.append('limit', '200') // 向量空间默认200个结果
      
      const response = await fetch('/api/ai-gallery/search', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // 转换搜索结果为VectorPoint格式
      const searchResultPoints: VectorPoint[] = result.results.map((item: any, index: number) => {
        // 在原始数据中找到匹配的点
        const originalPoint = points.find(p => p.img_name === item.img_name)
        return originalPoint || {
          img_name: item.img_name,
          x: Math.random(), // 如果找不到原始点，使用随机位置
          y: Math.random(),
          id: `search-${index}`
        }
      })
      
      setSearchResults(searchResultPoints)
      setHasSearched(true)
      
    } catch (error) {
      console.error('搜索出错:', error)
      // 可以添加错误提示
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, isSearching, points])

  // 点击处理
  const handlePointClick = useCallback((point: VectorPoint | ClusterPoint) => {
    if ('isCluster' in point && point.isCluster) {
      // 如果是聚类点，放大到该区域
      if (svgRef.current && zoomRef.current) {
        const svg = select(svgRef.current)
        const targetScale = Math.min(10, transform.k * 2) // 放大2倍，但不超过6倍
        const targetX = dimensions.width / 2 - scales.xScale(point.x) * targetScale
        const targetY = dimensions.height / 2 - scales.yScale(point.y) * targetScale
        
        svg.transition()
          .duration(750)
          .call(zoomRef.current.transform, zoomIdentity.translate(targetX, targetY).scale(targetScale))
      }
    } else {
      // 如果是单个点，显示图片
      if ('img_name' in point) {
        setSelectedImage(point.img_name)
      }
    }
  }, [dimensions, scales, transform.k])

  // 响应式尺寸更新
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const width = Math.max(800, rect.width - 32)
        const height = Math.max(600, window.innerHeight * 0.7)
        setDimensions({ width, height })
      } else {
        // 如果 containerRef 为空，使用默认尺寸
        const width = Math.max(800, window.innerWidth - 64)
        const height = Math.max(600, window.innerHeight * 0.7)
        setDimensions({ width, height })
      }
    }

    // 延迟初始化，确保 DOM 已经渲染
    const timer = setTimeout(updateDimensions, 100)
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // 客户端检测
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 初始化 D3 缩放
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = select(svgRef.current)
    
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 20])
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
        .call(zoomRef.current.transform, zoomIdentity)
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

  return {
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
  }
}
