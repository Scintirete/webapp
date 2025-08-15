/**
 * Doubao Embedding 客户端封装
 * 基于 axios 实现，支持多模态embedding功能
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import {
  DoubaoClientConfig,
  DoubaoEmbeddingRequest,
  DoubaoEmbeddingResponse,
  DoubaoError,
  RetryConfig
} from './types';
import { getDoubaoConfig, validateDoubaoConfig } from './config';

/**
 * Doubao Embedding 客户端类
 */
export class DoubaoEmbeddingClient {
  private axiosInstance: AxiosInstance;
  private config: DoubaoClientConfig;
  private retryConfig: RetryConfig;

  constructor(config?: Partial<DoubaoClientConfig>) {
    // 从环境变量获取默认配置，然后与传入配置合并
    const defaultConfig = getDoubaoConfig();
    this.config = { ...defaultConfig, ...config };
    
    // 验证配置
    validateDoubaoConfig(this.config);

    // 设置重试配置
    this.retryConfig = {
      maxRetries: this.config.maxRetries || 2,
      retryDelay: this.config.retryDelay || 1000,
      retryCondition: (error: AxiosError) => {
        // 重试条件：网络错误、超时、5xx 服务器错误
        return !error.response || 
               error.code === 'ECONNABORTED' ||
               (error.response.status >= 500 && error.response.status < 600);
      }
    };

    // 创建 axios 实例
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'User-Agent': 'DoubaoEmbeddingClient/1.0.0'
      }
    });

    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 发送 Doubao Embedding 请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ 请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 添加响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ Doubao Embedding 响应成功: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ Doubao Embedding 响应错误:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 带重试机制的请求方法
   */
  private async requestWithRetry<T>(
    requestConfig: AxiosRequestConfig,
    retryCount = 0
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(requestConfig);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<DoubaoError>;
      
      // 检查是否应该重试
      if (
        retryCount < this.retryConfig.maxRetries &&
        this.retryConfig.retryCondition &&
        this.retryConfig.retryCondition(axiosError)
      ) {
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount); // 指数退避
        console.log(`🔄 重试请求 (${retryCount + 1}/${this.retryConfig.maxRetries}), ${delay}ms 后重试...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry<T>(requestConfig, retryCount + 1);
      }

      // 格式化错误信息
      if (axiosError.response?.data?.error) {
        const doubaoError = axiosError.response.data;
        throw new Error(`Doubao API 错误: ${doubaoError.error.message} (${doubaoError.error.type})`);
      }

      throw new Error(`请求失败: ${axiosError.message}`);
    }
  }

  /**
   * 向量嵌入服务
   */
  async embedding(request: DoubaoEmbeddingRequest): Promise<DoubaoEmbeddingResponse> {
    console.log(`🔤 开始向量嵌入，模型: ${request.model}, 输入数量: ${request.input.length}`);
    
    const response = await this.requestWithRetry<DoubaoEmbeddingResponse>({
      method: 'POST',
      url: '/api/v3/embeddings/multimodal',
      data: request
    });

    console.log(`✅ 向量嵌入完成，向量维度: ${response.data.embedding.length}`);
    return response;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ success: boolean; message: string; config?: DoubaoClientConfig }> {
    try {
      // 使用最简单的 embedding 请求来测试连接
      await this.embedding({
        model: 'doubao-embedding-vision-250615',
        input: [{
          type: 'text',
          text: 'health check'
        }]
      });

      return {
        success: true,
        message: 'Doubao Embedding 客户端连接正常',
        config: this.config
      };
    } catch (error) {
      return {
        success: false,
        message: `Doubao Embedding 客户端连接失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): DoubaoClientConfig {
    return { ...this.config, apiKey: '***' }; // 隐藏 API 密钥
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<DoubaoClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    validateDoubaoConfig(this.config);

    // 更新 axios 实例的配置
    this.axiosInstance.defaults.baseURL = this.config.baseURL;
    this.axiosInstance.defaults.timeout = this.config.timeout;
    this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${this.config.apiKey}`;

    // 更新重试配置
    this.retryConfig.maxRetries = this.config.maxRetries || 2;
    this.retryConfig.retryDelay = this.config.retryDelay || 1000;

    console.log('🔧 Doubao Embedding 客户端配置已更新');
  }
}

/**
 * 客户端实例管理器（单例模式）
 */
export class DoubaoEmbeddingClientManager {
  private static instance: DoubaoEmbeddingClient | null = null;

  /**
   * 获取客户端实例
   */
  static getInstance(config?: Partial<DoubaoClientConfig>): DoubaoEmbeddingClient {
    if (!this.instance) {
      this.instance = new DoubaoEmbeddingClient(config);
      console.log('✅ Doubao Embedding 客户端初始化成功');
    }
    return this.instance;
  }

  /**
   * 重新初始化客户端
   */
  static reinitialize(config?: Partial<DoubaoClientConfig>): DoubaoEmbeddingClient {
    this.instance = new DoubaoEmbeddingClient(config);
    console.log('🔄 Doubao Embedding 客户端重新初始化');
    return this.instance;
  }

  /**
   * 清除实例
   */
  static clear(): void {
    this.instance = null;
    console.log('🗑️ Doubao Embedding 客户端实例已清除');
  }
}

/**
 * 便捷的客户端访问函数
 */
export function getDoubaoEmbeddingClient(config?: Partial<DoubaoClientConfig>): DoubaoEmbeddingClient {
  return DoubaoEmbeddingClientManager.getInstance(config);
}

/**
 * 重新初始化客户端
 */
export function reinitializeDoubaoEmbeddingClient(config?: Partial<DoubaoClientConfig>): DoubaoEmbeddingClient {
  return DoubaoEmbeddingClientManager.reinitialize(config);
}

/**
 * 健康检查便捷函数
 */
export async function healthCheckDoubaoEmbeddingClient(): Promise<{
  success: boolean;
  message: string;
  config?: DoubaoClientConfig;
}> {
  try {
    const client = getDoubaoEmbeddingClient();
    return await client.healthCheck();
  } catch (error) {
    return {
      success: false,
      message: `Doubao Embedding 客户端初始化失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
