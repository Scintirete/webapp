/**
 * AI Gallery 公共配置
 * 包含文件上传限制和其他相关常量
 */

// 文件上传限制配置
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

// 搜索配置
export const SEARCH_CONFIG = {
  // 默认页面大小
  DEFAULT_PAGE_SIZE: 6,
  // 最小相似度阈值
  MIN_SIMILARITY_THRESHOLD: 0.3,
  // 向量维度
  VECTOR_DIMENSIONS: 1024,
  // Jina 模型名称
  JINA_MODEL: 'jina-embeddings-v3' as const,
} as const;

// 错误消息键
export const ERROR_KEYS = {
  TOO_MANY_FILES: 'demos.ai_gallery.error_too_many_files',
  INVALID_FILE_TYPE: 'demos.ai_gallery.error_invalid_file_type',
  FILE_TOO_LARGE: 'demos.ai_gallery.error_file_too_large',
  LOAD_EXAMPLE_FAILED: 'demos.ai_gallery.error_load_example',
  SEARCH_FAILED: 'demos.ai_gallery.error_search_failed',
} as const;

// 文件上传验证函数
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

// 文件数量验证函数
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
