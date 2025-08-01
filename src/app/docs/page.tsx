'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Home, 
  Code, 
  Database, 
  Server, 
  Monitor,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Github,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { getDocsStructure, getDocContent, DocNode, DocContent } from '@/lib/docs-scanner'

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string>('index')
  const [docContent, setDocContent] = useState<DocContent | null>(null)
  const [docsStructure, setDocsStructure] = useState<DocNode[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['category-基础']))
  const [loading, setLoading] = useState(false)
  const [structureLoading, setStructureLoading] = useState(true)

  // 加载文档结构
  useEffect(() => {
    const loadStructure = async () => {
      try {
        const structure = await getDocsStructure()
        setDocsStructure(structure)
        
        // 默认展开第一个分类
        if (structure.length > 0) {
          setExpandedFolders(new Set([structure[0].id]))
        }
      } catch (error) {
        console.error('Failed to load docs structure:', error)
      } finally {
        setStructureLoading(false)
      }
    }
    
    loadStructure()
  }, [])

  // 加载文档内容
  const loadDocContent = async (docId: string) => {
    setLoading(true)
    try {
      const content = await getDocContent(docId)
      setDocContent(content)
    } catch (error) {
      console.error('Failed to load document:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocContent(selectedDoc)
  }, [selectedDoc])

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
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                isExpanded ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
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
          <button
            key={node.id}
            onClick={() => setSelectedDoc(node.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
              isSelected
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-l-4 border-yellow-500'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <FileText className="w-4 h-4" />
            <span className="flex-1 text-sm">{node.title}</span>
            {isSelected && (
              <ChevronRight className="w-3 h-3 text-yellow-600" />
            )}
          </button>
        )
      }
    })
  }

  // 自定义代码组件
  const CodeBlock = ({ 
    className, 
    children, 
    ...props 
  }: { 
    className?: string; 
    children?: React.ReactNode;
    [key: string]: any 
  }) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    return match ? (
      <SyntaxHighlighter
        style={tomorrow}
        language={language}
        PreTag="div"
        className="rounded-lg my-4"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  }

  // 自定义组件映射
  const components = {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-3xl font-bold mb-6 mt-8 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-semibold mb-4 mt-6 text-slate-800 dark:text-slate-200">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-medium mb-3 mt-5 text-slate-700 dark:text-slate-300">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-lg font-medium mb-2 mt-4 text-slate-600 dark:text-slate-400">
        {children}
      </h4>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-4 space-y-2 text-slate-600 dark:text-slate-400">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-4 space-y-2 text-slate-600 dark:text-slate-400 list-decimal list-inside">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-yellow-500 pl-4 py-2 mb-4 bg-yellow-50 dark:bg-yellow-900/20 italic text-slate-700 dark:text-slate-300">
        {children}
      </blockquote>
    ),
    code: CodeBlock,
    pre: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-4">
        {children}
      </div>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-slate-300 dark:border-slate-600">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-left">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
        {children}
      </td>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-slate-900 dark:text-slate-200">
        {children}
      </strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-slate-700 dark:text-slate-300">
        {children}
      </em>
    ),
    hr: () => (
      <hr className="my-6 border-slate-300 dark:border-slate-600" />
    ),
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Scintirete Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Scintirete
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-1">
                <Badge variant="secondary">文档</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/Scintirete/Scintirete/" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href="https://manager.scintirete.wj2015.com" target="_blank" rel="noopener noreferrer">
                  <Monitor className="w-4 h-4 mr-2" />
                  管理UI
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* 左侧目录 */}
          <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen sticky top-16">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  文档目录
                </h3>
                <Separator />
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                {structureLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {renderDocTree(docsStructure)}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">加载文档中...</p>
                  </div>
                </div>
              ) : docContent ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{docContent.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {docContent.description && (
                          <Badge variant="outline" className="text-xs">
                            {docContent.description}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {docContent.lastModified.toLocaleDateString('zh-CN')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={components}
                      >
                        {docContent.content}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">文档加载失败</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}