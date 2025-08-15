/**
 * 向量数据库模块入口文件
 * 统一导出所有Scintirete相关的类型和功能
 */

// 导出类型定义
export type { ScintireteConfig } from './types';

// 导出配置管理
export {
  getScintireteConfig,
  validateScintireteConfig
} from './config';

// 导出客户端
export {
  ScintireteClientManager,
  getScintireteClient,
  reinitializeScintireteClient,
  closeScintireteClient,
  getScintireteClientConfig,
  isScintireteClientInitialized,
  healthCheckScintireteClient
} from './client';
