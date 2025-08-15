# Scintirete TypeScript SDK 集成文档

本文档介绍了在 Next.js 项目中集成和使用 Scintirete 向量数据库 TypeScript SDK 的完整指南。

## 📁 项目结构

```
src/
├── lib/
│   └── vectordb/               # 向量数据库模块
│       ├── config.ts           # 配置管理
│       ├── client.ts           # 客户端封装
│       ├── types.ts            # 类型定义
│       └── index.ts            # 模块入口
├── types/
│   └── scintirete.ts          # 类型定义
├── app/api/scintirete/
│   ├── health/route.ts        # 健康检查 API
│   └── databases/route.ts     # 数据库管理 API
└── examples/
    └── scintirete-usage.ts    # 使用示例

.env.development               # 开发环境配置
.env.production               # 生产环境配置
.env.local.example           # 本地配置示例
```

## 🔧 环境变量配置

### 配置文件说明

- **`.env.development`**: 开发环境默认配置
- **`.env.production`**: 生产环境默认配置  
- **`.env.local`**: 本地开发配置（不会提交到版本控制）

### 配置参数

| 参数名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| `SCINTIRETE_ADDRESS` | 向量数据库服务器地址 | string | 必填 |
| `SCINTIRETE_PASSWORD` | 连接密码 | string | 可选 |
| `SCINTIRETE_USE_TLS` | 是否启用 TLS | boolean | false |
| `SCINTIRETE_TIMEOUT` | 连接超时时间（毫秒） | number | 30000 |
| `SCINTIRETE_DATABASE_NAME` | 默认数据库名称 | string | 可选 |

### 配置示例

```bash
# .env.development
SCINTIRETE_ADDRESS=localhost:50051
SCINTIRETE_PASSWORD=development-password
SCINTIRETE_USE_TLS=false
SCINTIRETE_TIMEOUT=30000
SCINTIRETE_DATABASE_NAME=dev_database

# .env.production
SCINTIRETE_ADDRESS=prod.scintirete.com:50051
SCINTIRETE_PASSWORD=production-password
SCINTIRETE_USE_TLS=true
SCINTIRETE_TIMEOUT=30000
SCINTIRETE_DATABASE_NAME=prod_database
```

## 🚀 快速开始

### 1. 基础用法

```typescript
import { getScintireteClient } from '@/lib/vectordb';

// 获取客户端实例
const client = getScintireteClient();

// 列出所有数据库
const databases = await client.listDatabases();
console.log('数据库列表:', databases.names);
```

### 2. 健康检查

```typescript
import { healthCheckScintireteClient } from '@/lib/vectordb';

const health = await healthCheckScintireteClient();
if (health.success) {
  console.log('连接正常:', health.message);
} else {
  console.error('连接失败:', health.message);
}
```

### 3. 数据库操作

```typescript
import { getScintireteClient } from '@/lib/vectordb';

const client = getScintireteClient();

// 创建数据库
const createResult = await client.createDatabase({ 
  name: 'my_database' 
});

// 删除数据库
const dropResult = await client.dropDatabase({ 
  name: 'my_database' 
});
```

### 4. 集合操作

```typescript
import { getScintireteClient } from '@/lib/vectordb';
import { DistanceMetric } from '@/types/scintirete';

const client = getScintireteClient();

// 创建集合
const collection = await client.createCollection({
  dbName: 'my_database',
  collectionName: 'text_embeddings',
  metricType: DistanceMetric.COSINE,
  hnswConfig: {
    m: 16,
    efConstruction: 200,
  },
});

// 获取集合信息
const info = await client.getCollectionInfo({
  dbName: 'my_database',
  collectionName: 'text_embeddings',
});
```

### 5. 文本嵌入和搜索

```typescript
import { getScintireteClient } from '@/lib/vectordb';

const client = getScintireteClient();

// 插入文本（自动生成嵌入）
const insertResult = await client.embedAndInsert({
  dbName: 'my_database',
  collectionName: 'text_embeddings',
  texts: [
    {
      text: '人工智能是计算机科学的一个分支',
      metadata: { category: 'technology' },
    },
    {
      text: '机器学习是人工智能的重要子领域',
      metadata: { category: 'technology' },
    },
  ],
});

// 文本搜索（自动生成查询嵌入）
const searchResult = await client.embedAndSearch({
  dbName: 'my_database',
  collectionName: 'text_embeddings',
  queryText: '什么是深度学习？',
  topK: 5,
  includeVector: false,
});
```

## 🔍 API 端点

项目提供了以下 REST API 端点：

### 健康检查
```
GET /api/scintirete/health
```

### 数据库管理
```
GET /api/scintirete/databases        # 获取数据库列表
POST /api/scintirete/databases       # 创建数据库
```

## 📖 完整示例

查看 `src/examples/scintirete-usage.ts` 文件了解完整的使用示例，包括：

- 健康检查
- 数据库管理
- 集合管理
- 文本嵌入
- 向量搜索
- 模型列表获取

## 🔧 高级配置

### 客户端管理

```typescript
import { 
  getScintireteClient,
  reinitializeScintireteClient,
  closeScintireteClient,
  isScintireteClientInitialized,
  getScintireteClientConfig,
} from '@/lib/vectordb';

// 检查客户端是否已初始化
if (!isScintireteClientInitialized()) {
  console.log('客户端尚未初始化');
}

// 获取当前配置
const config = getScintireteClientConfig();

// 重新初始化客户端（配置更新后）
reinitializeScintireteClient();

// 关闭客户端连接
closeScintireteClient();
```

### 错误处理

```typescript
import { ScintireteError, ScintireteErrorType } from '@/types/scintirete';

try {
  const client = getScintireteClient();
  await client.listDatabases();
} catch (error) {
  if (error instanceof ScintireteError) {
    console.error('Scintirete 错误:', error.type, error.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 📋 类型定义

项目提供了丰富的 TypeScript 类型定义，包括：

- `ExtendedVectorData`: 扩展的向量数据类型
- `ExtendedTextData`: 扩展的文本数据类型
- `SearchQuery`: 搜索查询参数
- `CreateCollectionParams`: 集合创建参数
- `DatabaseOperationResult`: 数据库操作结果
- `ClientStatus`: 客户端状态信息

详细信息请查看 `src/types/scintirete.ts` 文件。

## 🚨 注意事项

1. **环境变量安全性**: 
   - 不要在 `.env.local` 中存储生产环境密码
   - 确保 `.env.local` 文件不被提交到版本控制系统

2. **连接管理**:
   - 客户端使用单例模式，确保连接复用
   - 应用关闭时建议调用 `closeScintireteClient()` 清理连接

3. **错误处理**:
   - 所有操作都应包含适当的错误处理
   - 使用提供的 `ScintireteError` 类型进行错误分类

4. **性能优化**:
   - 搜索时设置 `includeVector: false` 可提高性能
   - 根据需要调整 `topK` 参数以平衡准确性和性能

## 🔗 相关链接

- [Scintirete 官方文档](https://github.com/Scintirete/Scintirete)
- [Next.js 环境变量文档](https://nextjs.org/docs/pages/guides/environment-variables)
- [TypeScript SDK 源码](https://github.com/Scintirete/scintirete-sdk-node)
