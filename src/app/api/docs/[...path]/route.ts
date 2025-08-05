import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, resolve, normalize } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const docPath = resolvedParams.path.join('/')
    
    // 安全检查：防止路径遍历攻击
    const docsRoot = resolve(process.cwd(), 'docs')
    const requestedPath = normalize(join(docsRoot, docPath))
    
    // 检查最终路径是否在docs目录下
    if (!requestedPath.startsWith(docsRoot)) {
      return new NextResponse('Access denied', { status: 403 })
    }
    
    // 确保请求的是markdown文件
    if (!requestedPath.endsWith('.md')) {
      return new NextResponse('Invalid file type', { status: 400 })
    }
    
    // 读取 Markdown 文件
    const content = await readFile(requestedPath, 'utf-8')
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error reading document:', error)
    // 如果文件不存在，返回 404
    return new NextResponse('Document not found', { status: 404 })
  }
}