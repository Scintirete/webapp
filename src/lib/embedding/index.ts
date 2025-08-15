/**
 * Embedding 模块入口文件
 * 统一导出所有embedding相关的类型和功能
 */

// 导出类型定义
export type {
  DoubaoEmbeddingModel,
  DoubaoMultimodalInput,
  DoubaoEmbeddingRequest,
  DoubaoEmbeddingResponse,
  DoubaoClientConfig,
  DoubaoError,
  RetryConfig
} from './types';

// 导出配置管理
export {
  getDoubaoConfig,
  validateDoubaoConfig
} from './config';

// 导出客户端
export {
  DoubaoEmbeddingClient,
  DoubaoEmbeddingClientManager,
  getDoubaoEmbeddingClient,
  reinitializeDoubaoEmbeddingClient,
  healthCheckDoubaoEmbeddingClient
} from './client';
