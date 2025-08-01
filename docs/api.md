# API 参考

Scintirete 提供了完整的 HTTP/JSON 和 gRPC API，支持所有数据库操作。

## 概述

### 端点信息

- **HTTP API**: `http://localhost:8080`
- **gRPC API**: `http://localhost:9090`
- **健康检查**: `GET /health`

### 认证方式

所有 API 请求都需要在 Header 中包含密码：

```http
Authorization: Bearer your-password
```

或通过查询参数：

```http
GET /api/v1/databases?password=your-password
```

## 数据库操作

### 创建数据库

#### HTTP API

```http
POST /api/v1/databases
Content-Type: application/json
Authorization: Bearer your-password

{
  "name": "my_app",
  "options": {
    "enable_persistence": true,
    "max_memory": "4GB"
  }
}
```

#### gRPC API

```go
message CreateDatabaseRequest {
  string name = 1;
  DatabaseOptions options = 2;
}

message DatabaseOptions {
  bool enable_persistence = 1;
  string max_memory = 2;
}
```

#### 响应

```json
{
  "success": true,
  "message": "Database created successfully",
  "data": {
    "name": "my_app",
    "created_at": "2024-01-01T10:00:00Z",
    "status": "active"
  }
}
```

### 删除数据库

#### HTTP API

```http
DELETE /api/v1/databases/my_app
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "message": "Database deleted successfully"
}
```

### 列出数据库

#### HTTP API

```http
GET /api/v1/databases
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "data": {
    "databases": [
      {
        "name": "my_app",
        "created_at": "2024-01-01T10:00:00Z",
        "collections_count": 3,
        "vectors_count": 1250,
        "memory_usage": "2.5MB"
      }
    ]
  }
}
```

## 集合操作

### 创建集合

#### HTTP API

```http
POST /api/v1/databases/my_app/collections
Content-Type: application/json
Authorization: Bearer your-password

{
  "name": "documents",
  "dimension": 1536,
  "metric": "Cosine",
  "options": {
    "max_connections": 32,
    "ef_construction": 200,
    "ef_search": 100
  }
}
```

#### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| name | string | 是 | 集合名称 |
| dimension | int | 是 | 向量维度 |
| metric | string | 是 | 距离度量：Cosine, Euclidean, InnerProduct, Manhattan |
| options.max_connections | int | 否 | HNSW 最大连接数，默认 16 |
| options.ef_construction | int | 否 | 构建时候选数，默认 40 |
| options.ef_search | int | 否 | 搜索时候选数，默认 50 |

#### 响应

```json
{
  "success": true,
  "message": "Collection created successfully",
  "data": {
    "name": "documents",
    "dimension": 1536,
    "metric": "Cosine",
    "created_at": "2024-01-01T10:00:00Z",
    "vectors_count": 0
  }
}
```

### 删除集合

#### HTTP API

```http
DELETE /api/v1/databases/my_app/collections/documents
Authorization: Bearer your-password
```

### 获取集合信息

#### HTTP API

```http
GET /api/v1/databases/my_app/collections/documents
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "data": {
    "name": "documents",
    "dimension": 1536,
    "metric": "Cosine",
    "vectors_count": 1250,
    "memory_usage": "1.8MB",
    "index_type": "HNSW",
    "created_at": "2024-01-01T10:00:00Z",
    "last_updated": "2024-01-01T12:00:00Z",
    "config": {
      "max_connections": 32,
      "ef_construction": 200,
      "ef_search": 100
    }
  }
}
```

### 列出集合

#### HTTP API

```http
GET /api/v1/databases/my_app/collections
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "name": "documents",
        "dimension": 1536,
        "metric": "Cosine",
        "vectors_count": 1250,
        "created_at": "2024-01-01T10:00:00Z"
      },
      {
        "name": "images",
        "dimension": 512,
        "metric": "Euclidean",
        "vectors_count": 5000,
        "created_at": "2024-01-01T11:00:00Z"
      }
    ]
  }
}
```

## 向量操作

### 插入向量

#### HTTP API

```http
POST /api/v1/databases/my_app/collections/documents/vectors
Content-Type: application/json
Authorization: Bearer your-password

{
  "vectors": [
    {
      "id": "doc1",
      "vector": [0.1, 0.2, 0.3, 0.4],
      "metadata": {
        "title": "Introduction to Vector Databases",
        "category": "documentation",
        "author": "scintirete-team"
      }
    },
    {
      "id": "doc2",
      "vector": [0.5, 0.6, 0.7, 0.8],
      "metadata": {
        "title": "HNSW Algorithm Explained",
        "category": "technical",
        "author": "scintirete-team"
      }
    }
  ]
}
```

#### 批量插入

支持批量插入以提高性能：

```http
POST /api/v1/databases/my_app/collections/documents/vectors/batch
Content-Type: application/json
Authorization: Bearer your-password

{
  "vectors": [
    // 最多 1000 个向量
  ]
}
```

#### 响应

```json
{
  "success": true,
  "message": "Vectors inserted successfully",
  "data": {
    "inserted_count": 2,
    "failed_count": 0,
    "errors": []
  }
}
```

### 搜索向量

#### HTTP API

```http
POST /api/v1/databases/my_app/collections/documents/search
Content-Type: application/json
Authorization: Bearer your-password

{
  "vector": [0.15, 0.25, 0.35, 0.45],
  "top_k": 5,
  "include_metadata": true,
  "filter": {
    "category": "documentation"
  }
}
```

#### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| vector | array[float] | 是 | 查询向量 |
| top_k | int | 否 | 返回结果数量，默认 10 |
| include_metadata | bool | 否 | 是否包含元数据，默认 true |
| filter | object | 否 | 元数据过滤条件 |
| ef_search | int | 否 | 搜索候选数，覆盖集合默认值 |

#### 过滤条件

支持多种过滤操作：

```json
{
  "filter": {
    "category": "documentation",  // 等值过滤
    "author": {"$in": ["alice", "bob"]},  // IN 操作
    "created_at": {"$gt": "2024-01-01"},  // 大于
    "score": {"$gte": 0.8},  // 大于等于
    "tags": {"$contains": ["AI", "ML"]}  // 包含
  }
}
```

#### 响应

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "doc1",
        "score": 0.95,
        "distance": 0.05,
        "metadata": {
          "title": "Introduction to Vector Databases",
          "category": "documentation",
          "author": "scintirete-team"
        }
      },
      {
        "id": "doc2",
        "score": 0.87,
        "distance": 0.13,
        "metadata": {
          "title": "HNSW Algorithm Explained",
          "category": "technical",
          "author": "scintirete-team"
        }
      }
    ],
    "total_count": 2,
    "search_time_ms": 15
  }
}
```

### 删除向量

#### HTTP API

```http
DELETE /api/v1/databases/my_app/collections/documents/vectors
Content-Type: application/json
Authorization: Bearer your-password

{
  "ids": ["doc1", "doc2"]
}
```

#### 响应

```json
{
  "success": true,
  "message": "Vectors deleted successfully",
  "data": {
    "deleted_count": 2,
    "failed_ids": []
  }
}
```

### 获取向量

#### HTTP API

```http
GET /api/v1/databases/my_app/collections/documents/vectors/doc1
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "data": {
    "id": "doc1",
    "vector": [0.1, 0.2, 0.3, 0.4],
    "metadata": {
      "title": "Introduction to Vector Databases",
      "category": "documentation",
      "author": "scintirete-team"
    },
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

## 文本嵌入

### 文本转向量

#### HTTP API

```http
POST /api/v1/embeddings
Content-Type: application/json
Authorization: Bearer your-password

{
  "texts": [
    "Scintirete is a high-performance vector database",
    "HNSW algorithm provides efficient similarity search"
  ],
  "model": "text-embedding-ada-002"
}
```

#### 响应

```json
{
  "success": true,
  "data": {
    "embeddings": [
      {
        "text": "Scintirete is a high-performance vector database",
        "vector": [0.1, 0.2, 0.3, ...],
        "tokens": 12,
        "model": "text-embedding-ada-002"
      },
      {
        "text": "HNSW algorithm provides efficient similarity search",
        "vector": [0.4, 0.5, 0.6, ...],
        "tokens": 10,
        "model": "text-embedding-ada-002"
      }
    ],
    "total_tokens": 22,
    "processing_time_ms": 250
  }
}
```

### 文本插入（自动嵌入）

#### HTTP API

```http
POST /api/v1/databases/my_app/collections/documents/text
Content-Type: application/json
Authorization: Bearer your-password

{
  "texts": [
    {
      "id": "doc1",
      "text": "Scintirete is a high-performance vector database",
      "metadata": {
        "category": "documentation",
        "author": "scintirete-team"
      }
    },
    {
      "id": "doc2",
      "text": "HNSW algorithm provides efficient similarity search",
      "metadata": {
        "category": "technical",
        "author": "scintirete-team"
      }
    }
  ]
}
```

### 文本搜索（语义搜索）

#### HTTP API

```http
POST /api/v1/databases/my_app/collections/documents/text/search
Content-Type: application/json
Authorization: Bearer your-password

{
  "query": "What is a vector database?",
  "top_k": 5,
  "filter": {
    "category": "documentation"
  }
}
```

#### 响应

```json
{
  "success": true,
  "data": {
    "query": "What is a vector database?",
    "query_embedding": [0.1, 0.2, 0.3, ...],
    "results": [
      {
        "id": "doc1",
        "text": "Scintirete is a high-performance vector database",
        "score": 0.92,
        "metadata": {
          "category": "documentation",
          "author": "scintirete-team"
        }
      }
    ],
    "search_time_ms": 280
  }
}
```

## 系统管理

### 健康检查

#### HTTP API

```http
GET /health
```

#### 响应

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "uptime": "2h30m",
  "version": "1.0.0",
  "components": {
    "storage": "healthy",
    "index": "healthy",
    "embedding": "healthy"
  }
}
```

### 系统信息

#### HTTP API

```http
GET /api/v1/system/info
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "build_date": "2024-01-01T00:00:00Z",
    "git_commit": "abc123def456",
    "go_version": "go1.24.0",
    "platform": "linux/amd64",
    "uptime": "2h30m",
    "memory_usage": {
      "total": "8GB",
      "used": "2.5GB",
      "available": "5.5GB"
    },
    "storage_usage": {
      "total": "100GB",
      "used": "1.2GB",
      "available": "98.8GB"
    }
  }
}
```

### 指标统计

#### HTTP API

```http
GET /api/v1/system/metrics
Authorization: Bearer your-password
```

#### 响应

```json
{
  "success": true,
  "data": {
    "queries": {
      "total": 12500,
      "qps": 15.5,
      "avg_latency_ms": 12.3,
      "p95_latency_ms": 25.6,
      "p99_latency_ms": 45.2
    },
    "vectors": {
      "total": 50000,
      "inserted_today": 1200,
      "deleted_today": 50
    },
    "databases": {
      "total": 5,
      "active": 5
    },
    "collections": {
      "total": 15,
      "active": 15
    }
  }
}
```

### 配置管理

#### 获取配置

```http
GET /api/v1/system/config
Authorization: Bearer your-password
```

#### 更新配置

```http
PUT /api/v1/system/config
Content-Type: application/json
Authorization: Bearer your-password

{
  "embedding": {
    "rpm_limit": 5000,
    "tpm_limit": 100000
  },
  "storage": {
    "max_memory": "8GB",
    "enable_compression": true
  }
}
```

## 错误处理

### 错误格式

所有 API 错误都遵循统一格式：

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_NOT_FOUND",
    "message": "Database 'my_app' not found",
    "details": {
      "database_name": "my_app"
    }
  }
}
```

### 错误代码

| 代码 | HTTP 状态 | 说明 |
|------|-----------|------|
| `UNAUTHORIZED` | 401 | 认证失败 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `DATABASE_NOT_FOUND` | 404 | 数据库不存在 |
| `COLLECTION_NOT_FOUND` | 404 | 集合不存在 |
| `VECTOR_NOT_FOUND` | 404 | 向量不存在 |
| `INVALID_INPUT` | 400 | 输入参数无效 |
| `DIMENSION_MISMATCH` | 400 | 向量维度不匹配 |
| `INDEX_ERROR` | 500 | 索引错误 |
| `STORAGE_ERROR` | 500 | 存储错误 |
| `EMBEDDING_ERROR` | 500 | 嵌入服务错误 |
| `INTERNAL_ERROR` | 500 | 内部错误 |

### 重试建议

对于某些错误，建议采用重试策略：

- `5xx` 错误：指数退避重试
- `EMBEDDING_ERROR`：检查 API 配置后重试
- `STORAGE_ERROR`：检查磁盘空间后重试

## 性能优化建议

### 批量操作

使用批量 API 提高吞吐量：

```http
# 推荐：批量插入
POST /api/v1/databases/my_app/collections/documents/vectors/batch

# 不推荐：逐个插入
POST /api/v1/databases/my_app/collections/documents/vectors
```

### 连接池

对于高并发场景，使用 HTTP 连接池：

```go
// Go 示例
transport := &http.Transport{
    MaxIdleConns:        100,
    MaxIdleConnsPerHost: 10,
    IdleConnTimeout:     90 * time.Second,
}
client := &http.Client{Transport: transport}
```

### 缓存策略

对于频繁查询的向量，实现客户端缓存：

```python
# Python 示例
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_vector(vector_id):
    # 获取向量并缓存
    return client.get_vector(vector_id)
```

---

通过本章的 API 参考，您应该能够熟练使用 Scintirete 的所有功能。如有任何问题，请参考 [故障排除](./troubleshooting.md) 章节。