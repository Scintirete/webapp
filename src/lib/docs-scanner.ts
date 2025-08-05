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

// 生成文档标题的工具函数
function generateDocTitle(filename: string, locale: string = 'zh'): string {
  // 移除 .md 后缀
  let title = filename.replace(/\.md$/, '')
  
  // 移除数字前缀（如 "1_", "10_" 等）
  title = title.replace(/^\d+_/, '')
  
  // 将下划线和横杠转为空格
  title = title.replace(/[_|-]/g, ' ')
  
  // 英文情况下，每个单词首字母大写
  if (locale === 'en') {
    title = title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  
  return title
}

// 排序文件和文件夹的工具函数
function sortFileItems(items: string[]): string[] {
  return items.sort((a, b) => {
    // index.md 总是排在最前面
    if (a === 'index.md') return -1
    if (b === 'index.md') return 1
    
    // 其他按字符顺序排序
    return a.localeCompare(b)
  })
}

// 缓存文档结构，避免重复扫描
const getDocsStructure = cache(async (locale: string = 'zh'): Promise<DocNode[]> => {
  const docsPath = join(process.cwd(), 'docs', locale)
  
  try {
    const items = await readdir(docsPath)
    const structure: DocNode[] = []
    
    // 分离文件和文件夹
    const files: string[] = []
    const folders: string[] = []
    
    for (const itemName of items) {
      const itemPath = join(docsPath, itemName)
      const itemStat = await stat(itemPath)
      
      if (itemName.endsWith('.md') && itemStat.isFile()) {
        files.push(itemName)
      } else if (itemStat.isDirectory()) {
        folders.push(itemName)
      }
    }
    
    // 排序文件和文件夹
    const sortedFiles = sortFileItems(files)
    const sortedFolders = sortFileItems(folders)
    
    // 处理文件
    for (const fileName of sortedFiles) {
      const docId = fileName.replace('.md', '')
      const itemPath = join(docsPath, fileName)
      
      // 尝试从文件内容提取标题，否则使用生成的标题
      let title: string
      try {
        const content = await readFile(itemPath, 'utf-8')
        const titleMatch = content.match(/^#\s+(.+)$/m)
        title = titleMatch ? titleMatch[1].trim() : generateDocTitle(fileName, locale)
      } catch {
        title = generateDocTitle(fileName, locale)
      }
      
      structure.push({
        id: docId,
        title,
        type: 'file',
        path: docId
      })
    }
    
    // 处理文件夹
    for (const folderName of sortedFolders) {
      const folderPath = join(docsPath, folderName)
      const subItems = await readdir(folderPath)
      const subStructure: DocNode[] = []
      
      // 获取文件夹中的 .md 文件
      const subFiles = subItems.filter(item => item.endsWith('.md'))
      const sortedSubFiles = sortFileItems(subFiles)
      
      for (const subFileName of sortedSubFiles) {
        const subItemPath = join(folderPath, subFileName)
        const subDocId = `${folderName}/${subFileName.replace('.md', '')}`
        
        // 尝试从文件内容提取标题，否则使用生成的标题
        let title: string
        try {
          const content = await readFile(subItemPath, 'utf-8')
          const titleMatch = content.match(/^#\s+(.+)$/m)
          title = titleMatch ? titleMatch[1].trim() : generateDocTitle(subFileName, locale)
        } catch {
          title = generateDocTitle(subFileName, locale)
        }
        
        subStructure.push({
          id: subDocId,
          title,
          type: 'file',
          path: subDocId
        })
      }
      
      // 如果文件夹有内容，添加到结构中
      if (subStructure.length > 0) {
        const folderTitle = generateDocTitle(folderName, locale)
        
        structure.push({
          id: folderName,
          title: folderTitle,
          type: 'folder',
          path: '',
          children: subStructure
        })
      }
    }
    
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
    
    // 尝试从内容中提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : generateDocTitle(`${docId}.md`)
    
    return {
      title,
      content,
      description: extractDescriptionFromContent(content),
      lastModified: stats.mtime
    }
  } catch (error) {
    console.error(`Error reading document ${docId}:`, error)
    return null
  }
})



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



// 导出函数
export { getDocsStructure, getDocContent }