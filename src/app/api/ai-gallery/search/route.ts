import { NextRequest, NextResponse } from 'next/server'
import { DoubaoEmbeddingResponse, getDoubaoEmbeddingClient } from '@/lib/embedding'
import { DoubaoEmbeddingRequest, DoubaoMultimodalInput } from '@/lib/embedding'
import { AI_GALLERY_CONFIG, SEARCH_CONFIG, validateFile, validateFileCount } from '@/lib/ai-gallery-config'

interface SearchResult {
  id: number
  src: string
  similarity: number
}

interface SearchResponse {
  results: SearchResult[]
  timing: {
    imageProcessing: number
    vectorization: number
    databaseSearch: number
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 解析表单数据
    const formData = await request.formData()
    const query = formData.get('query') as string
    const imageFiles = formData.getAll('images') as File[]
    
    // 验证输入
    if (!query && imageFiles.length === 0) {
      return NextResponse.json(
        { error: '请提供搜索查询或上传图片' },
        { status: 400 }
      )
    }
    
    // 验证文件数量
    const fileCountValidation = validateFileCount(0, imageFiles.length);
    if (!fileCountValidation.valid) {
      return NextResponse.json(
        { error: `最多只能上传 ${AI_GALLERY_CONFIG.MAX_FILES} 张图片` },
        { status: 400 }
      )
    }
    
    const imageProcessingStart = Date.now()
    
    // 处理上传的图片
    const processedImages: string[] = []
    for (const file of imageFiles) {
      // 验证文件
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          { error: `文件 ${file.name} 验证失败` },
          { status: 400 }
        )
      }
      
      // 转换为 base64
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      
      processedImages.push(base64)
    }
    
    const imageProcessingTime = Date.now() - imageProcessingStart
    const vectorizationStart = Date.now()
    
    // 准备向量化输入
    const embeddingInputs: DoubaoMultimodalInput[] = []
    
    // 添加图片（转换为data URI格式）
    processedImages.forEach(imageData => {
      embeddingInputs.push({ 
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageData}`
        }
      })
    })

    // 添加文本查询
    if (query) {
      embeddingInputs.push({ 
        type: 'text',
        text: query 
      })
    }
    
    // 调用 Doubao embedding API
    const doubaoClient = getDoubaoEmbeddingClient()
    
    const embeddingRequest: DoubaoEmbeddingRequest = {
      model: SEARCH_CONFIG.DOUBAO_MODEL,
      input: embeddingInputs
    }
    
    let embedding_response: DoubaoEmbeddingResponse
    try {
      embedding_response = await doubaoClient.embedding(embeddingRequest)
    } catch (error) {
      console.error('Doubao API 调用失败:', error)
      // TODO: 如果 Doubao API 失败，可以考虑使用其他模型或返回错误
      throw new Error('向量化服务暂时不可用')
    }
    
    const vectorizationTime = Date.now() - vectorizationStart
    const databaseSearchStart = Date.now()
    
    // TODO: 这里应该使用 Scintirete 进行向量搜索
    // 目前返回示例数据用于演示
    console.log('TODO: 实现 Scintirete 向量搜索')
    console.log('嵌入向量维度:', embedding_response.data.embedding.length)
    console.log('查询嵌入向量:', embedding_response.data.embedding.slice(0, 5), '...')
    console.log("消耗 token:", embedding_response.usage.total_tokens, "prompt_tokens:", embedding_response.usage.prompt_tokens, "prompt_tokens_details:", embedding_response.usage.prompt_tokens_details)
    
    // 示例搜索结果（实际应该从 Scintirete 获取）
    const mockResults: SearchResult[] = [
      { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', similarity: 0.98 },
      { id: 2, src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', similarity: 0.94 },
      { id: 3, src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', similarity: 0.91 },
      { id: 4, src: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=300&h=300&fit=crop', similarity: 0.88 },
      { id: 5, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop', similarity: 0.85 },
      { id: 6, src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop', similarity: 0.82 }
    ]
    
    const databaseSearchTime = Date.now() - databaseSearchStart
    
    // 构建响应
    const response: SearchResponse = {
      results: mockResults,
      timing: {
        imageProcessing: imageProcessingTime,
        vectorization: vectorizationTime,
        databaseSearch: databaseSearchTime
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('AI Gallery 搜索失败:', error)
    return NextResponse.json(
      { 
        error: '搜索失败', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

// 支持的 HTTP 方法
export const runtime = 'nodejs'
