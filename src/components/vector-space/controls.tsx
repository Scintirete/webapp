'use client'

import { useState, useEffect } from 'react'
import { Search, ZoomIn, ZoomOut, RotateCcw, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface VectorSpaceControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: () => void
  onClearSearch: () => void
  isSearching: boolean
  hasSearched: boolean
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
  onSearch,
  onClearSearch,
  isSearching,
  hasSearched,
  visiblePointsCount,
  totalPointsCount,
  previewCount,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetView
}: VectorSpaceControlsProps) {
  const t = useTranslations()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  // 初始化搜索建议
  useEffect(() => {
    const allSuggestions = t.raw('demos.ai_gallery.vector_space.search_suggestions') as string[]
    if (allSuggestions && Array.isArray(allSuggestions)) {
      // 随机选择6个建议
      const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5)
      setSuggestions(shuffled.slice(0, 6))
    }
  }, [t])

  // 刷新建议
  const refreshSuggestions = () => {
    const allSuggestions = t.raw('demos.ai_gallery.vector_space.search_suggestions') as string[]
    if (allSuggestions && Array.isArray(allSuggestions)) {
      const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5)
      setSuggestions(shuffled.slice(0, 6))
    }
  }

  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    onSearchChange(suggestion)
    setShowSuggestions(false)
  }

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSearching && searchQuery.trim()) {
      e.preventDefault()
      setShowSuggestions(false)
      onSearch()
    }
  }

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    setShowSuggestions(false)
    onSearch()
  }

  // 处理清除搜索
  const handleClearSearch = () => {
    setShowSuggestions(true)
    onClearSearch()
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 搜索框 */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('demos.ai_gallery.vector_space.search_input_placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button 
              onClick={handleSearchClick}
              disabled={isSearching || !searchQuery.trim()}
              className="whitespace-nowrap"
            >
              {isSearching ? t('demos.ai_gallery.vector_space.searching') : t('demos.ai_gallery.vector_space.search_button')}
            </Button>
            {hasSearched && (
              <Button 
                variant="outline"
                onClick={handleClearSearch}
                className="whitespace-nowrap"
              >
                {t('demos.ai_gallery.vector_space.clear_search')}
              </Button>
            )}
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
        
        {/* 搜索建议 */}
        {showSuggestions && suggestions.length > 0 && searchQuery.length === 0 && (
          <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('demos.ai_gallery.vector_space.search_suggestions_title')}
              </h4>
              <Button
                variant="ghost" 
                size="sm"
                onClick={refreshSuggestions}
                className="text-slate-500 hover:text-purple-600 h-auto p-1"
                title={t('demos.ai_gallery.vector_space.refresh_suggestions')}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-300 transition-colors px-3 py-1"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
