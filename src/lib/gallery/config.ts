/**
 * AI Gallery 配置管理
 */

import { GalleryConfig } from './types';

/**
 * 获取相册配置
 */
export function getGalleryConfig(): GalleryConfig {
  return {
    publicUrl: process.env.GALLARY_PUBLIC_URL || '/gallary/',
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
