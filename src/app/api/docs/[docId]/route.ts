import { NextRequest, NextResponse } from 'next/server'
import { getDocContent } from '@/lib/docs-scanner'

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const { docId } = params
    
    // 使用缓存的文档内容获取函数
    const docContent = await getDocContent(docId)
    
    if (!docContent) {
      return new NextResponse('Documentation not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }
    
    // 返回文件内容
    return new NextResponse(docContent.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    })
  } catch (error) {
    console.error('Error reading documentation file:', error)
    
    // 如果文件不存在，返回404
    return new NextResponse('Documentation not found', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}