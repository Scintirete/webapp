'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypePrismPlus from 'rehype-prism-plus'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'

interface MarkdownRendererProps {
  content: string
  className?: string
  locale?: string
}

export function MarkdownRenderer({ content, className = '', locale = 'zh' }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // 转换相对链接为正确的路由链接
  const transformLink = (href: string) => {
    if (!href) return href
    
    // 外部链接保持不变
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href
    }
    
    // 锚点链接保持不变
    if (href.startsWith('#')) {
      return href
    }
    
    // 处理相对路径的markdown文件链接
    if (href.endsWith('.md')) {
      const docPath = href.replace('.md', '')
      return `/${locale}/docs?path=${docPath}`
    }
    
    // 处理其他相对路径
    if (href.startsWith('./') || href.startsWith('../')) {
      // 简化处理，移除相对路径前缀
      const cleanPath = href.replace(/^\.\.?\//g, '')
      if (cleanPath.endsWith('.md')) {
        const docPath = cleanPath.replace('.md', '')
        return `/${locale}/docs?path=${docPath}`
      }
    }
    
    return href
  }

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          [remarkToc, { tight: true, ordered: true }]
        ]}
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          rehypePrismPlus
        ]}
        components={{
          // 代码块渲染
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            
            // 递归提取文本内容的函数
            const extractTextContent = (content: any): string => {
              if (content === null || content === undefined) return ''
              if (typeof content === 'string') return content
              if (typeof content === 'number') return String(content)
              if (Array.isArray(content)) {
                return content.map(extractTextContent).join('')
              }
              if (typeof content === 'object') {
                if (content.props && content.props.children) {
                  return extractTextContent(content.props.children)
                }
                if (content.children) {
                  return extractTextContent(content.children)
                }
                // 对于其他对象，尝试提取有用的文本
                if (content.toString && content.toString !== Object.prototype.toString) {
                  const str = content.toString()
                  if (str !== '[object Object]') return str
                }
              }
              return ''
            }
            
            const codeContent = extractTextContent(children)
            
            // 判断是否是代码块：有className（即使没有语言）或者内容包含换行符
            const isCodeBlock = className || codeContent.includes('\n')
            // 确定渲染语言，plaintext 和 text 使用 text 作为语言
            const renderLanguage = language === 'plaintext' || language === 'text' || !language ? 'text' : language
            
            return isCodeBlock ? (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={renderLanguage}
                PreTag="div"
                className="rounded-lg !mt-4 !mb-4"
                customStyle={{
                  margin: '1rem 0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                {codeContent.replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {codeContent}
              </code>
            )
          },
          
          // 表格样式
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-600">
                  {children}
                </table>
              </div>
            )
          },
          
          th({ children }) {
            return (
              <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 bg-slate-50 dark:bg-slate-800 font-semibold text-left">
                {children}
              </th>
            )
          },
          
          td({ children }) {
            return (
              <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                {children}
              </td>
            )
          },
          
          // 链接样式
          a({ children, href, ...props }) {
            const transformedHref = transformLink(href || '')
            const isExternal = transformedHref.startsWith('http')
            
            return (
              <a
                href={transformedHref}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            )
          },
          
          // 标题样式
          h1({ children, ...props }) {
            return (
              <h1 className="text-3xl font-bold mb-6 mt-8 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2" {...props}>
                {children}
              </h1>
            )
          },
          
          h2({ children, ...props }) {
            return (
              <h2 className="text-2xl font-semibold mb-4 mt-6 text-slate-800 dark:text-slate-200" {...props}>
                {children}
              </h2>
            )
          },
          
          h3({ children, ...props }) {
            return (
              <h3 className="text-xl font-medium mb-3 mt-5 text-slate-700 dark:text-slate-300" {...props}>
                {children}
              </h3>
            )
          },
          
          h4({ children, ...props }) {
            return (
              <h4 className="text-lg font-medium mb-2 mt-4 text-slate-600 dark:text-slate-400" {...props}>
                {children}
              </h4>
            )
          },
          
          // 段落样式
          p({ children }) {
            return (
              <p className="mb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                {children}
              </p>
            )
          },
          
          // 列表样式
          ul({ children }) {
            return (
              <ul className="mb-4 space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                {children}
              </ul>
            )
          },
          
          ol({ children }) {
            return (
              <ol className="mb-4 space-y-2 text-slate-600 dark:text-slate-400 list-decimal list-inside">
                {children}
              </ol>
            )
          },
          
          li({ children }) {
            return (
              <li className="leading-relaxed ml-4">
                {children}
              </li>
            )
          },
          
          // 引用样式
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">
                {children}
              </blockquote>
            )
          },
          
          // 分割线样式
          hr() {
            return (
              <hr className="my-6 border-slate-200 dark:border-slate-700" />
            )
          },
          
          // 图片样式
          img({ src, alt, ...props }) {
            // 处理相对路径，将 (../)+ 转换为 /
            let imgSrc = src
            if (imgSrc && typeof imgSrc === 'string') {
              // 将多个 ../ 替换为根路径
              imgSrc = imgSrc.replace(/^(\.\.\/)+/, '/')
              // 如果以 ./ 开头，也转为根路径
              imgSrc = imgSrc.replace(/^\.\//, '/')
            }
            
            return (
              <img
                src={imgSrc}
                alt={alt}
                className="max-w-full h-auto rounded-lg my-4 border border-slate-200 dark:border-slate-700"
                {...props}
              />
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}