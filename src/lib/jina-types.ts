/**
 * Jina AI Embedding 相关类型定义
 */

// 支持的 Embedding 模型
export type JinaEmbeddingModel = 
  | 'jina-clip-v2'              // 多模态、多语言、1024维、8K上下文窗口、865M参数
  | 'jina-embeddings-v3'        // 文本模型、多语言、1024维、8K上下文窗口、570M参数
  | 'jina-embeddings-v4'        // 文本模型、多语言、1024维、8K上下文窗口、380M参数
  | 'jina-colbert-v2'           // 多语言ColBERT模型，8K token上下文，560M参数
  | 'jina-embeddings-v2-base-code'; // 针对代码和文档搜索优化，768维，8K上下文窗口，137M参数

// 支持的 Rerank 模型
export type JinaRerankModel = 'jina-reranker-m0'; // 多模态多语言文档重排序器，10K上下文，2.4B参数

// 嵌入格式类型
export type EmbeddingFormat = 'float' | 'binary_int8' | 'binary_uint8' | 'base64';

// 维度选项
export type EmbeddingDimensions = 1024 | 768;

// 多模态输入类型
export interface MultimodalInput {
  text?: string;
  image?: string; // URL 或 base64 编码
}

// Embedding 请求参数
export interface EmbeddingRequest {
  model: JinaEmbeddingModel;
  input: string[] | MultimodalInput[];
  embedding_format?: EmbeddingFormat;
  dimensions?: EmbeddingDimensions;
}

// Embedding 响应
export interface EmbeddingResponse {
  object: 'list';
  data: {
    object: 'embedding';
    index: number;
    embedding: number[] | string; // 根据 embedding_format 决定类型
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Rerank 文档类型
export interface RerankDocument {
  text?: string;
  image?: string; // URL 或图片数据
}

// Rerank 请求参数
export interface RerankRequest {
  model: JinaRerankModel;
  query: string;
  documents: RerankDocument[];
  top_n?: number;
  max_chunk_per_doc?: number;
}

// Rerank 响应
export interface RerankResponse {
  model: string;
  results: {
    index: number;
    relevance_score: number;
    document: RerankDocument;
  }[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// DeepSearch 消息类型
export interface DeepSearchMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

// DeepSearch 请求参数
export interface DeepSearchRequest {
  model: string; // 通常使用 'jina-deepsearch'
  messages: DeepSearchMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

// DeepSearch 响应
export interface DeepSearchResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 客户端配置
export interface JinaClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// 错误类型
export interface JinaError {
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
