/**
 * Scintirete 向量数据库配置管理
 */

import { ScintireteConfig } from './types';

/**
 * 从环境变量获取 Scintirete 配置
 */
export function getScintireteConfig(): ScintireteConfig {
  const address = process.env.SCINTIRETE_ADDRESS;
  const password = process.env.SCINTIRETE_PASSWORD;
  const useTLS = process.env.SCINTIRETE_USE_TLS === 'true';
  const timeout = process.env.SCINTIRETE_TIMEOUT 
    ? parseInt(process.env.SCINTIRETE_TIMEOUT, 10) 
    : 30000;
  const databaseName = process.env.SCINTIRETE_DATABASE_NAME;

  if (!address) {
    throw new Error('SCINTIRETE_ADDRESS 环境变量未配置');
  }

  return {
    address,
    password,
    useTLS,
    timeout,
    databaseName,
  };
}

/**
 * 验证配置的有效性
 */
export function validateScintireteConfig(config: ScintireteConfig): void {
  if (!config.address) {
    throw new Error('Scintirete 地址不能为空');
  }

  if (!config.address.includes(':')) {
    throw new Error('Scintirete 地址格式无效，应为 host:port 格式');
  }

  if (config.timeout && config.timeout <= 0) {
    throw new Error('超时时间必须大于 0');
  }
}
