import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { cache } from 'react'

export interface DocNode {
  id: string
  title: string
  type: 'file' | 'folder'
  path: string
  children?: DocNode[]
  level?: number
  order?: number
}

export interface DocContent {
  title: string
  content: string
  lastModified: Date
  path: string
}

// 缓存文档结构
const getDocsStructure = cache(async (): Promise<DocNode[]> => {
  const docsPath = join(process.cwd(), 'docs')
  
  try {
    const items = await readdir(docsPath)
    const structure: DocNode[] = []
    
    // 定义文档顺序
    const docOrder = [
      'index',
      'getting-started', 
      'concepts',
      'api',
      'manager-ui',
      'deployment'
    ]
    
    for (const itemName of items) {
      const itemPath = join(docsPath, itemName)
      const itemStat = await stat(itemPath)
      
      if (itemName.endsWith('.md') && itemStat.isFile()) {
        const docId = itemName.replace('.md', '')
        const order = docOrder.indexOf(docId)
        
        if (order !== -1) { // 只包含在预定义列表中的文档
          structure.push({
            id: docId,
            title: await getDocTitle(docId),
            type: 'file',
            path: `/docs/${docId}`,
            order: order
          })
        }
      }
    }
    
    // 按照预定义顺序排序
    structure.sort((a, b) => (a.order || 999) - (b.order || 999))
    
    return structure
  } catch (error) {
    console.error('Error reading docs directory:', error)
    return []
  }
})

// 获取文档标题
const getDocTitle = cache(async (docId: string): Promise<string> => {
  const titleMap: Record<string, string> = {
    'index': '文档首页',
    'getting-started': '快速上手',
    'concepts': '基础概念', 
    'api': 'API 参考',
    'manager-ui': '管理 UI',
    'deployment': '部署指南'
  }
  
  return titleMap[docId] || docId
})

// 获取文档内容
export const getDocContent = cache(async (docId: string): Promise<DocContent | null> => {
  try {
    const filePath = join(process.cwd(), 'docs', `${docId}.md`)
    const content = await readFile(filePath, 'utf-8')
    const fileStat = await stat(filePath)
    
    // 从内容中提取标题
    const titleMatch = content.match(/^# (.+)$/m)
    const title = titleMatch ? titleMatch[1] : await getDocTitle(docId)
    
    return {
      title,
      content,
      lastModified: fileStat.mtime,
      path: `/docs/${docId}`
    }
  } catch (error) {
    console.error(`Error loading document ${docId}:`, error)
    return null
  }
})

// 获取所有文档结构
export const getAllDocs = async (): Promise<DocNode[]> => {
  return await getDocsStructure()
}

// 获取文档列表（用于侧边栏）
export const getDocList = cache(async () => {
  const structure = await getDocsStructure()
  
  // 转换为侧边栏需要的格式
  return structure.map(doc => ({
    id: doc.id,
    title: doc.title,
    href: doc.path,
    icon: getDocIcon(doc.id)
  }))
})

// 获取文档图标
const getDocIcon = (docId: string): string => {
  const iconMap: Record<string, string> = {
    'index': 'Home',
    'getting-started': 'BookOpen', 
    'concepts': 'FileText',
    'api': 'Code',
    'manager-ui': 'Monitor',
    'deployment': 'Server'
  }
  
  return iconMap[docId] || 'FileText'
}