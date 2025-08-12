import { createScintireteClient, Scintirete, type ScintireteClientOptions } from 'scintirete';
import { getScintireteConfig, validateScintireteConfig, type ScintireteConfig } from './scintirete-config';

/**
 * Scintirete 客户端实例管理器
 */
export class ScintireteClientManager {
  private static instance: Scintirete | null = null;
  private static config: ScintireteConfig | null = null;

  /**
   * 获取 Scintirete 客户端实例（单例模式）
   */
  static getInstance(): Scintirete {
    if (!this.instance || !this.config) {
      this.initialize();
    }
    return this.instance!;
  }

  /**
   * 初始化客户端实例
   */
  private static initialize(): void {
    try {
      // 从环境变量获取配置
      this.config = getScintireteConfig();
      
      // 验证配置
      validateScintireteConfig(this.config);

      // 创建客户端配置
      const clientOptions: ScintireteClientOptions = {
        address: this.config.address,
        password: this.config.password,
        useTLS: this.config.useTLS,
        defaultDeadlineMs: this.config.timeout,
        enableGzip: true, // 启用 gzip 压缩以提高性能
      };

      // 创建 gRPC 客户端
      const client = createScintireteClient(clientOptions);
      
      // 创建 Scintirete 实例
      this.instance = new Scintirete(client);

      console.log(`✅ Scintirete 客户端初始化成功 - 地址: ${this.config.address}, TLS: ${this.config.useTLS}`);
    } catch (error) {
      console.error('❌ Scintirete 客户端初始化失败:', error);
      throw new Error(`Scintirete 客户端初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 重新初始化客户端（用于配置更新）
   */
  static reinitialize(): void {
    this.close();
    this.initialize();
  }

  /**
   * 关闭客户端连接
   */
  static close(): void {
    if (this.instance) {
      // 注意：Scintirete 类没有 close 方法，这里可以扩展
      this.instance = null;
      this.config = null;
      console.log('🔒 Scintirete 客户端连接已关闭');
    }
  }

  /**
   * 获取当前配置信息
   */
  static getConfig(): ScintireteConfig | null {
    return this.config;
  }

  /**
   * 检查客户端是否已初始化
   */
  static isInitialized(): boolean {
    return this.instance !== null && this.config !== null;
  }
}

/**
 * 便捷的客户端访问函数
 */
export function getScintireteClient(): Scintirete {
  return ScintireteClientManager.getInstance();
}

/**
 * 重新初始化客户端
 */
export function reinitializeScintireteClient(): void {
  return ScintireteClientManager.reinitialize();
}

/**
 * 关闭客户端连接
 */
export function closeScintireteClient(): void {
  return ScintireteClientManager.close();
}

/**
 * 获取客户端配置信息
 */
export function getScintireteClientConfig(): ScintireteConfig | null {
  return ScintireteClientManager.getConfig();
}

/**
 * 检查客户端是否已初始化
 */
export function isScintireteClientInitialized(): boolean {
  return ScintireteClientManager.isInitialized();
}

/**
 * 健康检查 - 测试客户端连接
 */
export async function healthCheckScintireteClient(): Promise<{
  success: boolean;
  message: string;
  config?: ScintireteConfig;
}> {
  try {
    const client = getScintireteClient();
    const config = getScintireteClientConfig();
    
    // 尝试列出数据库来验证连接
    await client.listDatabases();
    
    return {
      success: true,
      message: 'Scintirete 客户端连接正常',
      config: config || undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: `Scintirete 客户端连接失败: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}