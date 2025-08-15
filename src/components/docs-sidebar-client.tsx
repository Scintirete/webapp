'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText
} from 'lucide-react'
import { DocNode } from '@/lib/docs-scanner'
import { useTranslations } from 'next-intl'

interface DocsSidebarClientProps {
  docsStructure: DocNode[]
  defaultExpandedFolders: Set<string>
  currentPath?: string
  locale: string
}

export function DocsSidebarClient({ 
  docsStructure, 
  defaultExpandedFolders, 
  currentPath = '',
  locale 
}: DocsSidebarClientProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(defaultExpandedFolders)
  const selectedDoc = currentPath || 'index'
  const t = useTranslations('docs')

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  // 渲染文档树
  const renderDocTree = (nodes: DocNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.id)
      const isSelected = selectedDoc === node.id

      if (node.type === 'folder') {
        return (
          <div key={node.id} className="select-none">
            <button
              onClick={() => toggleFolder(node.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 cursor-pointer ${
                isExpanded ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${level > 0 ? `ml-${level * 4}` : ''}`}
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <Folder className="w-4 h-4 text-blue-600" />
              )}
              <span className="flex-1 text-sm font-medium">{node.title}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  isExpanded ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {isExpanded && node.children && (
              <div className="ml-2">
                {renderDocTree(node.children, level + 1)}
              </div>
            )}
          </div>
        )
      } else {
        return (
          <Link
            key={node.id}
            href={`/${locale}/docs?path=${node.id}`}
            className={`block w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 cursor-pointer ${
              isSelected
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-l-4 border-yellow-500'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            } ${level > 0 ? `ml-${level * 4}` : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span className="flex-1 text-sm">{node.title}</span>
            {isSelected && (
              <ChevronRight className="w-3 h-3 text-yellow-600" />
            )}
          </Link>
        )
      }
    })
  }

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen sticky top-16">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {t('sidebar_title')}
          </h3>
          <Separator />
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1">
            {renderDocTree(docsStructure)}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}