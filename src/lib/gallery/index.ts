/**
 * AI Gallery 模块入口文件
 * 统一导出所有相册相关的类型和功能
 */

// 导出类型定义
export type { 
  GallerySearchOptions,
  GallerySearchResult,
  GallerySearchResponse,
  GalleryImageMetadata 
} from './types';

// 导出配置管理
export {
  getGalleryConfig,
  GALLERY_CONFIG,
  buildImageUrl,
  AI_GALLERY_CONFIG,
  SEARCH_CONFIG,
  ERROR_KEYS,
  validateFile,
  validateFileCount
} from './config';