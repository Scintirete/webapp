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
      'deployment',
      'best-practices',
      'troubleshooting'
    ]
    
    for (const itemName of items) {
      const itemPath = join(docsPath, itemName)
      const itemStat = await stat(itemPath)
      
      if (itemName.endsWith('.md') && itemStat.isFile()) {
        const docId = itemName.replace('.md', '')
        const order = docOrder.indexOf(docId)
        
        // 读取文件内容来提取标题
        const content = await readFile(itemPath, 'utf-8')
        const title = extractTitleFromContent(content, docId)
        const description = extractDescriptionFromContent(content)
        
        structure.push({
          id: docId,
          title,
          type: 'file',
          path: `/docs/${docId}`,
          order: order === -1 ? 999 : order
        })
      }
    }
    
    // 按照定义的顺序排序
    structure.sort((a, b) => (a.order || 999) - (b.order || 999))
    
    // 转换为树形结构
    return buildTreeStructure(structure)
    
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

// 从内容中提取标题
function extractTitleFromContent(content: string, fallback: string): string {
  const lines = content.split('\n')
  
  // 查找第一个 # 标题
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/)
    if (match) {
      return match[1].trim()
    }
  }
  
  // 如果没有找到 # 标题，查找第一个 ## 标题
  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/)
    if (match) {
      return match[1].trim()
    }
  }
  
  // 如果都没有，使用文件名作为标题
  return fallback
    .split('-')
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
  const categories = {
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