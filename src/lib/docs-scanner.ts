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
  description?: string
  order?: number
  lastModified: Date
}

// 缓存文档结构，避免重复扫描
const getDocsStructure = cache(async (locale: string = 'zh'): Promise<DocNode[]> => {
  const docsPath = join(process.cwd(), 'docs', locale)
  
  try {
    const items = await readdir(docsPath)
    const structure: DocNode[] = []
    
    // 根据语言定义文档顺序和标题映射
    const docOrder = locale === 'zh' ? [
      'index',
      '1_快速上手', 
      '2_系统要求',
      '3_项目架构设计',
      '使用指南'
    ] : [
      'index',
      '1_quick-start',
      '2_system-requirements', 
      '3_architecture-design',
      'user-guides'
    ]
    
    // 扫描主目录文件
    for (const itemName of items) {
      const itemPath = join(docsPath, itemName)
      const itemStat = await stat(itemPath)
      
      if (itemName.endsWith('.md') && itemStat.isFile()) {
        const docId = itemName.replace('.md', '')
        const order = docOrder.indexOf(docId)
        
        // 读取文件内容来提取标题
        const content = await readFile(itemPath, 'utf-8')
        const title = extractTitleFromContent(content, docId, locale)
        
        structure.push({
          id: docId,
          title,
          type: 'file',
          path: docId,
          order: order === -1 ? 999 : order
        })
      } else if (itemStat.isDirectory()) {
        // 处理子目录（如"使用指南"或"user-guides"）
        const subItems = await readdir(itemPath)
        const subStructure: DocNode[] = []
        
        for (const subItemName of subItems) {
          if (subItemName.endsWith('.md')) {
            const subItemPath = join(itemPath, subItemName)
            const subDocId = `${itemName}/${subItemName.replace('.md', '')}`
            const content = await readFile(subItemPath, 'utf-8')
            const title = extractTitleFromContent(content, subItemName.replace('.md', ''), locale)
            
            subStructure.push({
              id: subDocId,
              title,
              type: 'file',
              path: subDocId,
              order: parseInt(subItemName.match(/^\d+/)?.[0] || '999')
            })
          }
        }
        
        // 排序子文档
        subStructure.sort((a, b) => (a.order || 999) - (b.order || 999))
        
        // 创建目录节点
        const folderTitle = locale === 'zh' ? 
          (itemName === '使用指南' ? '使用指南' : itemName) :
          (itemName === 'user-guides' ? 'User Guides' : itemName)
          
        structure.push({
          id: itemName,
          title: folderTitle,
          type: 'folder',
          path: '',
          children: subStructure,
          order: docOrder.indexOf(itemName) === -1 ? 999 : docOrder.indexOf(itemName)
        })
      }
    }
    
    // 按照定义的顺序排序
    structure.sort((a, b) => (a.order || 999) - (b.order || 999))
    
    return structure
    
  } catch (error) {
    console.error('Error scanning docs directory:', error)
    return []
  }
})

// 获取文档内容，带缓存
const getDocContent = cache(async (docId: string): Promise<DocContent | null> => {
  const docPath = join(process.cwd(), 'docs', `${docId}.md`)
  
  try {
    const content = await readFile(docPath, 'utf-8')
    const stats = await stat(docPath)
    
    return {
      title: extractTitleFromContent(content, docId),
      content,
      description: extractDescriptionFromContent(content),
      lastModified: stats.mtime
    }
  } catch (error) {
    console.error(`Error reading document ${docId}:`, error)
    return null
  }
})

// 从文件内容或文件名生成标题
function extractTitleFromContent(content: string, fallback: string, locale: string = 'zh'): string {
  // 首先尝试从内容中提取标题（查找第一个 # 标题）
  const titleMatch = content.match(/^#\s+(.+)$/m)
  if (titleMatch) {
    return titleMatch[1].trim()
  }
  
  // 如果没有找到标题，使用预定义的标题映射
  const titleMap = locale === 'zh' ? {
    'index': '文档首页',
    '1_快速上手': '快速上手',
    '2_系统要求': '系统要求', 
    '3_项目架构设计': '项目架构设计',
    '1_HTTP_API_接口文档': 'HTTP API 接口文档',
    '2_命令行工具参数': '命令行工具参数',
    '3_HNSW_超参数调整': 'HNSW 超参数调整',
    '4_gRPC_接口调用': 'gRPC 接口调用',
    '5_ManagerUI_使用指南': 'Manager UI 使用指南'
  } : {
    'index': 'Documentation Home',
    '1_quick-start': 'Quick Start',
    '2_system-requirements': 'System Requirements',
    '3_architecture-design': 'Architecture Design',
    '1_http-api-reference': 'HTTP API Reference',
    '2_cli-tool-parameters': 'CLI Tool Parameters', 
    '3_hnsw-parameter-tuning': 'HNSW Parameter Tuning',
    '4_grpc-interface-usage': 'gRPC Interface Usage',
    '5_manager-ui-guide': 'Manager UI Guide'
  }
  
  return titleMap[fallback as keyof typeof titleMap] || fallback
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// 从内容中提取描述
function extractDescriptionFromContent(content: string): string {
  const lines = content.split('\n')
  
  // 跳过标题行，找到第一个非空的段落
  let foundTitle = false
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 跳过标题行
    if (trimmed.startsWith('#')) {
      foundTitle = true
      continue
    }
    
    // 跳过空行和代码块
    if (!trimmed || trimmed.startsWith('```') || trimmed.startsWith('---')) {
      continue
    }
    
    // 找到第一个有意义的段落
    if (foundTitle && trimmed.length > 10) {
      // 限制描述长度
      return trimmed.length > 150 ? trimmed.substring(0, 150) + '...' : trimmed
    }
  }
  
  return ''
}

// 构建树形结构
function buildTreeStructure(flatList: DocNode[]): DocNode[] {
  const root: DocNode[] = []
  
  // 按照类别分组
  const categories: Record<string, string[]> = {
    '基础': ['index', 'getting-started', 'concepts'],
    '开发': ['api', 'deployment'],
    '工具': ['manager-ui'],
    '其他': []
  }
  
  const categoryNodes: Record<string, DocNode> = {}
  
  // 创建分类节点
  Object.entries(categories).forEach(([categoryName, docIds]) => {
    if (categoryName !== '其他') {
      categoryNodes[categoryName] = {
        id: `category-${categoryName}`,
        title: categoryName,
        type: 'folder',
        path: '',
        children: []
      }
    }
  })
  
  // 将文档分配到分类
  flatList.forEach(doc => {
    let assigned = false
    
    for (const [categoryName, docIds] of Object.entries(categories)) {
      if (categoryName !== '其他' && docIds.includes(doc.id)) {
        categoryNodes[categoryName].children!.push(doc)
        assigned = true
        break
      }
    }
    
    if (!assigned) {
      categories['其他'].push(doc.id)
    }
  })
  
  // 添加有子节点的分类到根节点
  Object.values(categoryNodes).forEach(category => {
    if (category.children && category.children.length > 0) {
      root.push(category)
    }
  })
  
  // 添加"其他"分类（如果有）
  if (categories['其他'].length > 0) {
    const otherCategory: DocNode = {
      id: 'category-other',
      title: '其他',
      type: 'folder',
      path: '',
      children: categories['其他'].map(id => 
        flatList.find(doc => doc.id === id)!
      ).filter(Boolean)
    }
    root.push(otherCategory)
  }
  
  return root
}

// 导出函数
export { getDocsStructure, getDocContent }