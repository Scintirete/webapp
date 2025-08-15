/**
 * AI Gallery 类型定义
 */

export interface GalleryImageMetadata {
  id: string;
  img_name: string;
  vector: number[];
  filepath?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface GallerySearchOptions {
  /** 搜索向量 */
  queryVector: number[];
  /** 返回结果数量，默认300 */
  limit?: number;
  /** 最小匹配度阈值，默认30 */
  minSimilarity?: number;
  /** 数据库名称 */
  database?: string;
  /** 集合名称 */
  collection?: string;
}

export interface GallerySearchResult {
  id: string;
  img_name: string;
  similarity: number;
  src: string;
}

export interface GallerySearchResponse {
  results: GallerySearchResult[];
  total: number;
  timing: {
    imageProcessing: number;
    vectorization: number;
    databaseSearch: number;
    total: number;
  };
  hasMore: boolean;
}

export interface GalleryConfig {
  /** 相册公共URL前缀 */
  publicUrl: string;
  /** 默认数据库名称 */
  defaultDatabase: string;
  /** 默认集合名称 */
  defaultCollection: string;
  /** 默认召回数量 */
  defaultRecallLimit: number;
  /** 最小匹配度阈值 */
  minSimilarityThreshold: number;
}
