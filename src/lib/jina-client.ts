/**
 * Jina AI 客户端封装
 * 基于 axios 实现，支持 embedding、rerank 和 deepsearch 功能
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import {
  JinaClientConfig,
  EmbeddingRequest,
  EmbeddingResponse,
  RerankRequest,
  RerankResponse,
  DeepSearchRequest,
  DeepSearchResponse,
  JinaError,
  RetryConfig
} from './jina-types';
import { getJinaConfig, validateJinaConfig } from './jina-config';

/**
 * Jina AI 客户端类
 */
export class JinaClient {
  private axiosInstance: AxiosInstance;
  private config: JinaClientConfig;
  private retryConfig: RetryConfig;

  constructor(config?: Partial<JinaClientConfig>) {
    // 从环境变量获取默认配置，然后与传入配置合并
    const defaultConfig = getJinaConfig();
    this.config = { ...defaultConfig, ...config };
    
    // 验证配置
    validateJinaConfig(this.config);

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
        'User-Agent': 'JinaClient/1.0.0'
      }
    });

    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 发送 Jina AI 请求: ${config.method?.toUpperCase()} ${config.url}`);
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
        console.log(`✅ Jina AI 响应成功: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ Jina AI 响应错误:', error.response?.data || error.message);
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
      const axiosError = error as AxiosError<JinaError>;
      
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
        const jinaError = axiosError.response.data;
        throw new Error(`Jina AI 错误: ${jinaError.error.message} (${jinaError.error.type})`);
      }

      throw new Error(`请求失败: ${axiosError.message}`);
    }
  }

  /**
   * 向量嵌入服务
   */
  async embedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    console.log(`🔤 开始向量嵌入，模型: ${request.model}, 输入数量: ${request.input.length}`);
    
    const response = await this.requestWithRetry<EmbeddingResponse>({
      method: 'POST',
      url: '/embeddings',
      data: request
    });

    console.log(`✅ 向量嵌入完成，生成了 ${response.data.length} 个向量`);
    return response;
  }

  /**
   * 重排序服务
   */
  async rerank(request: RerankRequest): Promise<RerankResponse> {
    console.log(`🔄 开始重排序，模型: ${request.model}, 文档数量: ${request.documents.length}`);
    
    const response = await this.requestWithRetry<RerankResponse>({
      method: 'POST',
      url: '/rerank',
      data: request
    });

    console.log(`✅ 重排序完成，返回了 ${response.results.length} 个结果`);
    return response;
  }

  /**
   * 深度搜索服务
   */
  async deepsearch(request: DeepSearchRequest): Promise<DeepSearchResponse> {
    console.log(`🔍 开始深度搜索，模型: ${request.model}, 消息数量: ${request.messages.length}`);
    
    const response = await this.requestWithRetry<DeepSearchResponse>({
      method: 'POST',
      url: '/chat/completions',
      data: request
    });

    console.log(`✅ 深度搜索完成，生成了回复`);
    return response;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ success: boolean; message: string; config?: JinaClientConfig }> {
    try {
      // 使用最简单的 embedding 请求来测试连接
      await this.embedding({
        model: 'jina-embeddings-v3',
        input: ['health check']
      });

      return {
        success: true,
        message: 'Jina AI 客户端连接正常',
        config: this.config
      };
    } catch (error) {
      return {
        success: false,
        message: `Jina AI 客户端连接失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): JinaClientConfig {
    return { ...this.config, apiKey: '***' }; // 隐藏 API 密钥
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<JinaClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    validateJinaConfig(this.config);

    // 更新 axios 实例的配置
    this.axiosInstance.defaults.baseURL = this.config.baseURL;
    this.axiosInstance.defaults.timeout = this.config.timeout;
    this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${this.config.apiKey}`;

    // 更新重试配置
    this.retryConfig.maxRetries = this.config.maxRetries || 2;
    this.retryConfig.retryDelay = this.config.retryDelay || 1000;

    console.log('🔧 Jina AI 客户端配置已更新');
  }
}

/**
 * 客户端实例管理器（单例模式）
 */
export class JinaClientManager {
  private static instance: JinaClient | null = null;

  /**
   * 获取客户端实例
   */
  static getInstance(config?: Partial<JinaClientConfig>): JinaClient {
    if (!this.instance) {
      this.instance = new JinaClient(config);
      console.log('✅ Jina AI 客户端初始化成功');
    }
    return this.instance;
  }

  /**
   * 重新初始化客户端
   */
  static reinitialize(config?: Partial<JinaClientConfig>): JinaClient {
    this.instance = new JinaClient(config);
    console.log('🔄 Jina AI 客户端重新初始化');
    return this.instance;
  }

  /**
   * 清除实例
   */
  static clear(): void {
    this.instance = null;
    console.log('🗑️ Jina AI 客户端实例已清除');
  }
}

/**
 * 便捷的客户端访问函数
 */
export function getJinaClient(config?: Partial<JinaClientConfig>): JinaClient {
  return JinaClientManager.getInstance(config);
}

/**
 * 重新初始化客户端
 */
export function reinitializeJinaClient(config?: Partial<JinaClientConfig>): JinaClient {
  return JinaClientManager.reinitialize(config);
}

/**
 * 健康检查便捷函数
 */
export async function healthCheckJinaClient(): Promise<{
  success: boolean;
  message: string;
  config?: JinaClientConfig;
}> {
  try {
    const client = getJinaClient();
    return await client.healthCheck();
  } catch (error) {
    return {
      success: false,
      message: `Jina AI 客户端初始化失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
