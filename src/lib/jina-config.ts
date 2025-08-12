/**
 * Jina AI 配置管理
 */

import { JinaClientConfig } from './jina-types';

/**
 * 从环境变量获取 Jina AI 配置
 */
export function getJinaConfig(): JinaClientConfig {
  const apiKey = process.env.AIHUBMIX_API_KEY;
  const baseURL = process.env.AIHUBMIX_BASE_URL || 'https://aihubmix.com/v1';
  const timeout = process.env.AIHUBMIX_TIMEOUT 
    ? parseInt(process.env.AIHUBMIX_TIMEOUT, 10) 
    : 30000;
  const maxRetries = process.env.AIHUBMIX_MAX_RETRIES
    ? parseInt(process.env.AIHUBMIX_MAX_RETRIES, 10)
    : 2;
  const retryDelay = process.env.AIHUBMIX_RETRY_DELAY
    ? parseInt(process.env.AIHUBMIX_RETRY_DELAY, 10)
    : 1000;

  if (!apiKey) {
    throw new Error('AIHUBMIX_API_KEY 环境变量未配置');
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
export function validateJinaConfig(config: JinaClientConfig): void {
  if (!config.apiKey) {
    throw new Error('Jina AI API 密钥不能为空');
  }

  if (!config.apiKey.startsWith('sk-')) {
    throw new Error('Jina AI API 密钥格式无效，应以 sk- 开头');
  }

  if (!config.baseURL) {
    throw new Error('Jina AI API 基础 URL 不能为空');
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
