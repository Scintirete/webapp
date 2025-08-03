import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const docPath = resolvedParams.path.join('/')
    const filePath = join(process.cwd(), 'docs', docPath)
    
    // 读取 Markdown 文件
    const content = await readFile(filePath, 'utf-8')
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    // 如果文件不存在，返回 404
    return new NextResponse('Document not found', { status: 404 })
  }
}