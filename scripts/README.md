# 图片向量化脚本使用指南

这里提供了两个脚本来处理图片向量化和存储：

## 1. 图片转向量脚本 (`image-to-vector.ts`)

将指定目录下的所有 `.jpg` 图片转换为向量，并保存为 JSON 格式。

### 使用方法

```bash
npx tsx scripts/image-to-vector.ts <directory>
```

### 功能特性

- 自动扫描目录下所有 `.jpg` 和 `.jpeg` 文件
- 使用 Doubao Embedding API 生成向量
- 在输入目录下创建 `vector/` 子目录
- 为每个图片生成对应的 `{name}.json` 文件
- 跳过已处理的图片（断点续传）
- 包含错误处理和重试机制

### 输出格式

```json
{
  "vector": [0.1, 0.2, 0.3, ...],
  "img_name": "example.jpg"
}
```

### 环境变量配置

脚本支持从 `.env.local` 文件自动加载环境变量。

#### 方法1：使用 .env.local 文件（推荐）

```bash
# 复制环境变量模板
cp scripts/env.example .env.local

# 编辑 .env.local 文件，填入真实配置
vim .env.local
```

#### 方法2：使用系统环境变量

确保配置以下环境变量：

- `ARK_API_KEY`: Doubao API 密钥（必需）
- `ARK_BASE_URL`: Doubao API 基础地址（可选，默认：https://ark.cn-beijing.volces.com）
- `ARK_TIMEOUT`: 请求超时时间（可选，默认：30000ms）

### 示例

```bash
# 处理测试目录中的图片
npx tsx scripts/image-to-vector.ts ./test-images

# 处理画廊目录中的图片
npx tsx scripts/image-to-vector.ts ./public/gallary
```

## 2. 向量数据库存储脚本 (`vector-to-db.ts`)

将向量 JSON 文件批量存入 Scintirete 向量数据库。

### 使用方法

```bash
npx tsx scripts/vector-to-db.ts <vector_directory> <database> <collection> [options]
```

### 参数说明

- `vector_directory`: 向量JSON文件所在目录
- `database`: 数据库名称
- `collection`: 集合名称

### 选项

- `-f, --force`: 如果数据库/集合已存在，自动删除重建
- `--batch-size <size>`: 批量插入大小，默认为100
- `--skip-existing`: 跳过已存在的向量（基于img_name）

### 功能特性

- 自动创建数据库和集合
- 批量插入优化性能
- 支持断点续传
- 自动检测向量维度
- 详细的导入统计信息

### 环境变量配置

脚本会自动从 `.env.local` 文件加载环境变量，也支持系统环境变量：

- `SCINTIRETE_ADDRESS`: Scintirete 数据库地址（必需，格式：host:port）
- `SCINTIRETE_PASSWORD`: 数据库密码（可选）
- `SCINTIRETE_USE_TLS`: 是否使用TLS连接（可选，true/false）
- `SCINTIRETE_TIMEOUT`: 连接超时时间（可选，默认：30000ms）

### 示例

```bash
# 基本用法
npx tsx scripts/vector-to-db.ts ./test-images/vector test_db image_vectors

# 强制重建集合
npx tsx scripts/vector-to-db.ts ./test-images/vector test_db image_vectors -f

# 自定义批量大小
npx tsx scripts/vector-to-db.ts ./test-images/vector test_db image_vectors --batch-size 50

# 跳过已存在的向量
npx tsx scripts/vector-to-db.ts ./test-images/vector test_db image_vectors --skip-existing
```

## 快速开始

### 使用 npm 脚本

```bash
# 图片转向量
npm run images:vectorize ./test-images

# 向量存储到数据库
npm run images:to-db ./test-images/vector gallery_db image_collection -f

# 一键批量处理
npm run images:batch ./test-images gallery_db image_collection -f
```

## 完整工作流程

### 1. 准备环境

```bash
# 方法1：创建 .env.local 文件（推荐）
cp scripts/env.example .env.local
vim .env.local  # 填入真实配置

# 方法2：设置环境变量
export ARK_API_KEY="your_doubao_api_key"
export SCINTIRETE_ADDRESS="localhost:6333"
export SCINTIRETE_USE_TLS="false"
```

### 2. 图片转向量

```bash
# 将图片转换为向量
npx tsx scripts/image-to-vector.ts ./test-images
```

### 3. 存储到数据库

```bash
# 将向量存储到数据库
npx tsx scripts/vector-to-db.ts ./test-images/vector gallery_db image_collection -f
```

## 性能建议

### 大量图片处理

对于数万张图片的处理，建议：

1. **分批处理**: 将图片分成多个子目录分别处理
2. **监控API限流**: 注意 Doubao API 的调用频率限制
3. **磁盘空间**: 确保有足够空间存储向量文件
4. **内存使用**: 大批量处理时适当调整 batch-size

### 错误处理

- 脚本支持断点续传，可以重复运行而不会重复处理
- 详细的日志输出帮助诊断问题
- 自动重试机制处理临时网络问题

## 故障排除

### 常见问题

1. **API 连接失败**
   - 检查网络连接
   - 验证 API 密钥和地址配置
   - 查看防火墙设置

2. **向量维度不匹配**
   - 确保所有向量使用相同的 embedding 模型
   - 重新生成有问题的向量文件

3. **数据库连接失败**
   - 检查 Scintirete 服务是否运行
   - 验证连接参数和权限

4. **磁盘空间不足**
   - 清理临时文件
   - 增加磁盘空间
   - 分批处理减少内存占用

### 日志分析

脚本输出包含详细的状态信息：
- `🚀` 开始处理
- `✅` 成功完成
- `❌` 错误信息
- `⏭️` 跳过操作
- `📊` 统计信息

通过这些标识可以快速了解处理状态和定位问题。
