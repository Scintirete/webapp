/**
 * Doubao Embedding 配置管理
 */

import { DoubaoClientConfig } from './types';

/**
 * 从环境变量获取 Doubao 配置
 */
export function getDoubaoConfig(): DoubaoClientConfig {
  const apiKey = process.env.ARK_API_KEY;
  const baseURL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com';
  const timeout = process.env.ARK_TIMEOUT 
    ? parseInt(process.env.ARK_TIMEOUT, 10) 
    : 30000;
  const maxRetries = process.env.ARK_MAX_RETRIES
    ? parseInt(process.env.ARK_MAX_RETRIES, 10)
    : 2;
  const retryDelay = process.env.ARK_RETRY_DELAY
    ? parseInt(process.env.ARK_RETRY_DELAY, 10)
    : 1000;

  if (!apiKey) {
    throw new Error('ARK_API_KEY 环境变量未配置');
  }

  return {
    apiKey,
    baseURL,
    timeout,
    maxRetries,
    retryDelay,
  };
}

/**
 * 验证配置的有效性
 */
export function validateDoubaoConfig(config: DoubaoClientConfig): void {
  if (!config.apiKey) {
    throw new Error('Doubao API 密钥不能为空');
  }

  if (!config.baseURL) {
    throw new Error('Doubao API 基础 URL 不能为空');
  }

  if (config.timeout && config.timeout <= 0) {
    throw new Error('超时时间必须大于 0');
  }

  if (config.maxRetries && config.maxRetries < 0) {
    throw new Error('重试次数不能为负数');
  }

  if (config.retryDelay && config.retryDelay < 0) {
    throw new Error('重试延迟时间不能为负数');
  }
}
