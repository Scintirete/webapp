import { NextRequest, NextResponse } from 'next/server'
import { DoubaoEmbeddingResponse, getDoubaoEmbeddingClient } from '@/lib/embedding'
import { DoubaoEmbeddingRequest, DoubaoMultimodalInput } from '@/lib/embedding'
import { AI_GALLERY_CONFIG, SEARCH_CONFIG, validateFile, validateFileCount } from '@/lib/ai-gallery-config'
import { createGallerySearchService } from '@/lib/gallery'
import type { GallerySearchResponse } from '@/lib/gallery'

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
    
    console.log('📊 向量化完成 - 维度:', embedding_response.data.embedding.length)
    console.log('🔍 查询向量预览:', embedding_response.data.embedding.slice(0, 5), '...')
    console.log("📈 消耗 token:", embedding_response.usage.total_tokens, "prompt_tokens:", embedding_response.usage.prompt_tokens)
    
    // 使用相册搜索服务进行向量搜索
    const gallerySearchService = createGallerySearchService()
    
    const searchResult = await gallerySearchService.search({
      queryVector: embedding_response.data.embedding,
      limit: 300,  // 召回300条
      minSimilarity: 30, // 匹配度>30的结果
    })
    
    const databaseSearchTime = Date.now() - databaseSearchStart
    const totalTime = Date.now() - startTime
    
    // 构建响应
    const response: GallerySearchResponse = {
      results: searchResult.results,
      total: searchResult.total,
      timing: {
        imageProcessing: imageProcessingTime,
        vectorization: vectorizationTime,
        databaseSearch: databaseSearchTime,
        total: totalTime
      },
      hasMore: false // 前端分页，所以一次性返回所有符合条件的结果
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
