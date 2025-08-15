/**
 * Doubao Embedding 相关类型定义
 */

// 支持的 Embedding 模型
export type DoubaoEmbeddingModel = 'doubao-embedding-vision-250615';

// 多模态输入类型
export interface DoubaoMultimodalInput {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // 支持HTTP URL或data URI格式的base64图片
  };
}

// Embedding 请求参数
export interface DoubaoEmbeddingRequest {
  model: DoubaoEmbeddingModel;
  input: DoubaoMultimodalInput[];
}

// Embedding 响应
export interface DoubaoEmbeddingResponse {
  id: string;
  object: 'list';
  created: number;
  model: string;
  data: {
    object: 'embedding';
    embedding: number[];
  };
  usage: {
    prompt_tokens: number;
    prompt_tokens_details: {
      image_tokens: number;
      text_tokens: number;
    };
    total_tokens: number;
  };
}

// 客户端配置
export interface DoubaoClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// 错误类型
export interface DoubaoError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// 重试配置
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}
