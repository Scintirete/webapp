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
import { DocsSidebarClient } from './docs-sidebar-client'

interface DocsSidebarProps {
  docsStructure: DocNode[]
  defaultExpandedFolders: Set<string>
  currentPath?: string
  locale: string
}

export function DocsSidebar({ 
  docsStructure, 
  defaultExpandedFolders, 
  currentPath,
  locale 
}: DocsSidebarProps) {
  return (
    <DocsSidebarClient
      docsStructure={docsStructure}
      defaultExpandedFolders={defaultExpandedFolders}
      currentPath={currentPath}
      locale={locale}
    />
  )
}