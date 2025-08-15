/**
 * AI Gallery 统一配置管理
 * 包含相册配置、文件上传限制、搜索配置等
 */

import { GalleryConfig } from './types';

/**
 * 构建图片URL的工具函数
 */
export function buildImageUrl(imageName: string, baseUrl?: string): string {
  const publicUrl = baseUrl || getGalleryConfig().publicUrl;
  const normalizedUrl = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/';
  return `${normalizedUrl}${imageName}`;
}

/**
 * 获取相册配置
 */
export function getGalleryConfig(): GalleryConfig {
  return {
    publicUrl: process.env.NEXT_PUBLIC_GALLARY_BASE_URL || 'https://cdn.scintirete.top/gallary/',
    defaultDatabase: 'webapp',
    defaultCollection: 'gallary',
    defaultRecallLimit: 300,
    minSimilarityThreshold: 30,
  };
}

/**
 * 相册配置常量
 */
export const GALLERY_CONFIG = getGalleryConfig();

// ============================================================================
// 文件上传配置
// ============================================================================

/**
 * 文件上传限制配置
 */
export const AI_GALLERY_CONFIG = {
  // 最大文件数量
  MAX_FILES: 3,
  // 最大文件大小 (KB)
  MAX_FILE_SIZE_KB: 500,
  // 最大文件大小 (字节)
  get MAX_FILE_SIZE_BYTES() {
    return this.MAX_FILE_SIZE_KB * 1024;
  },
  // 支持的文件类型
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  // 文件类型检查正则
  FILE_TYPE_PATTERN: /^image\//,
} as const;

// ============================================================================
// 搜索配置
// ============================================================================

/**
 * 搜索相关配置
 */
export const SEARCH_CONFIG = {
  // 默认页面大小
  DEFAULT_PAGE_SIZE: 6,
  // 最小相似度阈值
  MIN_SIMILARITY_THRESHOLD: 0.3,
  // 向量维度（Doubao embedding 模型的输出维度）
  VECTOR_DIMENSIONS: 1024,
  // Doubao 模型名称
  DOUBAO_MODEL: 'doubao-embedding-vision-250615' as const,
  // 默认召回数量
  DEFAULT_RECALL_LIMIT: 300,
  // 匹配度阈值
  SIMILARITY_THRESHOLD: 30,
} as const;

// ============================================================================
// 错误消息配置
// ============================================================================

/**
 * 错误消息键
 */
export const ERROR_KEYS = {
  TOO_MANY_FILES: 'demos.ai_gallery.error_too_many_files',
  INVALID_FILE_TYPE: 'demos.ai_gallery.error_invalid_file_type',
  FILE_TOO_LARGE: 'demos.ai_gallery.error_file_too_large',
  LOAD_EXAMPLE_FAILED: 'demos.ai_gallery.error_load_example',
  SEARCH_FAILED: 'demos.ai_gallery.error_search_failed',
} as const;

// ============================================================================
// 验证函数
// ============================================================================

/**
 * 文件上传验证函数
 */
export function validateFile(file: File): { valid: boolean; errorKey?: string; errorParams?: Record<string, any> } {
  // 检查文件类型
  if (!AI_GALLERY_CONFIG.FILE_TYPE_PATTERN.test(file.type)) {
    return {
      valid: false,
      errorKey: ERROR_KEYS.INVALID_FILE_TYPE,
    };
  }

  // 检查文件大小
  if (file.size > AI_GALLERY_CONFIG.MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      errorKey: ERROR_KEYS.FILE_TOO_LARGE,
      errorParams: {
        filename: file.name,
        size: Math.round(file.size / 1024),
        max: AI_GALLERY_CONFIG.MAX_FILE_SIZE_KB,
      },
    };
  }

  return { valid: true };
}

/**
 * 文件数量验证函数
 */
export function validateFileCount(currentCount: number, newFileCount: number): { valid: boolean; errorKey?: string; errorParams?: Record<string, any> } {
  const totalFiles = currentCount + newFileCount;
  
  if (totalFiles > AI_GALLERY_CONFIG.MAX_FILES) {
    return {
      valid: false,
      errorKey: ERROR_KEYS.TOO_MANY_FILES,
      errorParams: {
        max: AI_GALLERY_CONFIG.MAX_FILES,
      },
    };
  }

  return { valid: true };
}
