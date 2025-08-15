/**
 * AI Gallery 搜索服务
 * 负责向量搜索和结果处理
 */

import { getScintireteClient } from '@/lib/vectordb';
import { getGalleryConfig } from './config';
import { 
  GallerySearchOptions, 
  GallerySearchResult, 
  GalleryImageMetadata 
} from './types';

export class GallerySearchService {
  private config = getGalleryConfig();
  private scintireteClient = getScintireteClient();

  /**
   * 执行向量搜索
   */
  async search(options: GallerySearchOptions): Promise<{
    results: GallerySearchResult[];
    total: number;
    searchTime: number;
  }> {
    const startTime = Date.now();
    
    const {
      queryVector,
      limit = this.config.defaultRecallLimit,
      minSimilarity = this.config.minSimilarityThreshold,
      database = this.config.defaultDatabase,
      collection = this.config.defaultCollection,
    } = options;

    console.log(`🔍 开始向量搜索 - 数据库: ${database}, 集合: ${collection}, 限制: ${limit}`);

    try {
      // 使用 Scintirete 进行向量搜索
      const searchResults = await this.scintireteClient.search({
        dbName: database,
        collectionName: collection,
        queryVector: queryVector,
        topK: limit,
        efSearch: limit * 2,
      });

      console.log(`📊 向量搜索完成 - 找到 ${searchResults.results?.length || 0} 个结果`);

      // 处理搜索结果
      const processedResults = this.processSearchResults(searchResults.results || [], minSimilarity);
      
      const searchTime = Date.now() - startTime;
      console.log(`⏱️ 搜索耗时: ${searchTime}ms, 筛选后结果: ${processedResults.length} 个`);

      return {
        results: processedResults,
        total: searchResults.results?.length || 0,
        searchTime,
      };
    } catch (error) {
      console.error('❌ 向量搜索失败:', error);
      throw new Error(`向量搜索失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 处理搜索结果，计算匹配度并过滤
   */
  private processSearchResults(
    results: any[], 
    minSimilarity: number
  ): GallerySearchResult[] {
    return results
      .map((result: any) => {
        // 计算匹配度: 匹配度 = (max(0, 余弦相似度))^k * 100，嵌入空间太稀疏了，幂缩放一下优化展示效果
        const k = 0.5;
        // Scintirete返回的distance需要转换为相似度
        const distance = result.distance || 0;
        // 对于余弦距离，相似度 = distance^k，然后乘以100
        const similarity = Math.round(Math.max(0, distance) ** k * 100 * 100) / 100;
        
        // 构建图片URL - Scintirete在metadata中存储img_name
        const metadata = result.metadata || {};
        const imageName = metadata.img_name || result.id || 'unknown';
        const imageUrl = this.buildImageUrl(imageName);

        return {
          id: result.id || String(Math.random()),
          img_name: imageName,
          similarity: similarity, // 保留两位小数
          src: imageUrl,
          distance: distance,
        } as GallerySearchResult;
      })
      .filter((result: GallerySearchResult) => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity); // 按相似度降序排列
  }

  /**
   * 构建图片访问URL
   */
  private buildImageUrl(imageName: string): string {
    // 确保 publicUrl 以 / 结尾
    const baseUrl = this.config.publicUrl.endsWith('/') 
      ? this.config.publicUrl 
      : this.config.publicUrl + '/';
    
    return `${baseUrl}${imageName}`;
  }

  /**
   * 健康检查 - 验证搜索服务是否可用
   */
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    config?: any;
  }> {
    try {
      // 检查向量数据库连接
      await this.scintireteClient.listDatabases();
      
      return {
        success: true,
        message: '相册搜索服务正常',
        config: this.config,
      };
    } catch (error) {
      return {
        success: false,
        message: `相册搜索服务不可用: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

/**
 * 创建搜索服务实例的工厂函数
 */
export function createGallerySearchService(): GallerySearchService {
  return new GallerySearchService();
}
