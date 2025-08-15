/**
 * Scintirete 向量数据库相关类型定义
 */

export interface ScintireteConfig {
  /** 向量数据库地址 */
  address: string;
  /** 向量数据库密码 */
  password?: string;
  /** 是否启用 TLS 连接 */
  useTLS: boolean;
  /** 连接超时时间（毫秒） */
  timeout?: number;
  /** 数据库名称 */
  databaseName?: string;
}
