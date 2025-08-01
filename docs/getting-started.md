# 快速上手

本指南将帮助您快速安装和运行 Scintirete 向量数据库。

## 环境要求

### 必需组件
- **操作系统**: Linux, macOS, Windows
- **架构**: amd64, arm64
- **内存**: 建议 4GB 以上 RAM
- **存储**: 建议 1GB 以上可用空间

### 可选组件
- **Go 1.24+**: 仅在从源码构建时需要
- **Docker**: 用于容器化部署
- **Docker Compose**: 用于多容器编排

## 安装方式

### 选项 1：下载预编译二进制文件（推荐）

这是最简单的安装方式，适合大多数用户。

1. 访问 [Releases 页面](https://github.com/scintirete/scintirete/releases)
2. 根据您的操作系统和架构下载对应的压缩包
3. 解压文件：

```bash
# Linux amd64
wget https://github.com/scintirete/scintirete/releases/latest/download/scintirete-linux-amd64.tar.gz
tar -xzf scintirete-linux-amd64.tar.gz

# Linux arm64
wget https://github.com/scintirete/scintirete/releases/latest/download/scintirete-linux-arm64.tar.gz
tar -xzf scintirete-linux-arm64.tar.gz

# macOS amd64
wget https://github.com/scintirete/scintirete/releases/latest/download/scintirete-darwin-amd64.tar.gz
tar -xzf scintirete-darwin-amd64.tar.gz

# macOS arm64
wget https://github.com/scintirete/scintirete/releases/latest/download/scintirete-darwin-arm64.tar.gz
tar -xzf scintirete-darwin-arm64.tar.gz
```

4. 将二进制文件移动到系统路径：

```bash
sudo mv bin/scintirete-server /usr/local/bin/
sudo mv bin/scintirete-cli /usr/local/bin/
```

### 选项 2：从源码构建

如果您需要自定义构建或贡献代码，可以从源码构建：

```bash
# 克隆仓库
git clone https://github.com/scintirete/scintirete.git
cd scintirete

# 构建所有组件
make all

# 或者单独构建
make server    # 构建服务器
make cli       # 构建命令行工具
```

### 选项 3：使用 Docker

Docker 提供了最便捷的部署方式：

```bash
# 拉取最新镜像
docker pull ghcr.io/scintirete/scintirete:latest

# 运行容器
docker run -d \
  --name scintirete \
  -p 8080:8080 \
  -p 9090:9090 \
  -v $(pwd)/data:/data \
  ghcr.io/scintirete/scintirete:latest
```

### 选项 4：使用 Docker Compose

对于生产环境，推荐使用 Docker Compose：

```yaml
# docker-compose.yml
version: '3.8'
services:
  scintirete:
    image: ghcr.io/scintirete/scintirete:latest
    ports:
      - "8080:8080"  # HTTP API
      - "9090:9090"  # gRPC API
    volumes:
      - ./data:/data
      - ./configs:/app/configs
    environment:
      - SCINTIRETE_PASSWORD=your-secure-password
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

## 基本使用

### 1. 启动服务器

#### 二进制文件方式

```bash
# 使用默认配置启动
./bin/scintirete-server

# 指定配置文件
./bin/scintirete-server -c /path/to/config.toml

# 设置密码
./bin/scintirete-server -p "your-password"
```

#### Docker 方式

```bash
# 基本启动
docker run -p 8080:8080 -p 9090:9090 ghcr.io/scintirete/scintirete:latest

# 设置密码
docker run -e SCINTIRETE_PASSWORD="your-password" \
  -p 8080:8080 -p 9090:9090 \
  ghcr.io/scintirete/scintirete:latest
```

#### 服务端口

启动后，服务将在以下端口监听：

- **HTTP/JSON API**: `8080` 端口
- **gRPC API**: `9090` 端口

### 2. 配置文本嵌入功能

要使用文本嵌入功能，需要配置 OpenAI 兼容的 API：

```bash
# 复制配置模板
cp configs/scintirete.template.toml configs/scintirete.toml

# 编辑配置文件
nano configs/scintirete.toml
```

配置文件内容：

```toml
[embedding]
# OpenAI 兼容 API 的 base URL
base_url = "https://api.openai.com/v1/embeddings"
# API Key
api_key = "your-api-key-here"
# 每分钟请求数限制
rpm_limit = 3500
# 每分钟 Token 数限制
tpm_limit = 90000
```

### 3. 使用管理 UI

访问 [manager.scintirete.wj2015.com](https://manager.scintirete.wj2015.com) 打开 Web 管理界面：

1. 输入服务器地址：`localhost:8080`
2. 输入密码（如果设置了）
3. 开始管理您的向量数据库

### 4. 命令行基本操作

#### 创建数据库和集合

```bash
# 创建数据库
./bin/scintirete-cli -p "your-password" db create my_app

# 创建集合（指定向量维度和距离度量）
./bin/scintirete-cli -p "your-password" collection create my_app documents \
  --dimension 1536 \
  --metric Cosine
```

#### 插入文本数据

```bash
# 插入单个文档
./bin/scintirete-cli -p "your-password" text insert my_app documents \
  "doc1" \
  "Scintirete 是一个为生产环境优化的轻量级向量数据库。" \
  '{"source":"documentation","type":"intro"}'

# 插入多个文档
./bin/scintirete-cli -p "your-password" text insert my_app documents \
  "doc2" \
  "HNSW 算法提供高效的近似最近邻搜索。" \
  '{"source":"documentation","type":"technical"}'

./bin/scintirete-cli -p "your-password" text insert my_app documents \
  "doc3" \
  "支持多种距离度量方式，包括余弦相似度、欧氏距离等。" \
  '{"source":"documentation","type":"features"}'
```

#### 搜索相似内容

```bash
# 语义搜索
./bin/scintirete-cli -p "your-password" text search my_app documents \
  "什么是向量数据库？" \
  5

# 带过滤条件的搜索
./bin/scintirete-cli -p "your-password" text search my_app documents \
  "HNSW 算法" \
  3 \
  --filter '{"source":"documentation"}'
```

#### 使用预计算向量

```bash
# 插入预计算向量
./bin/scintirete-cli -p "your-password" vector insert my_app vectors \
  --id "vec1" \
  --vector '[0.1, 0.2, 0.3, 0.4]' \
  --metadata '{"category":"example"}'

# 向量搜索
./bin/scintirete-cli -p "your-password" vector search my_app vectors \
  --vector '[0.15, 0.25, 0.35, 0.45]' \
  --top-k 3
```

#### 查看集合信息

```bash
# 获取集合详细信息
./bin/scintirete-cli -p "your-password" collection info my_app documents

# 列出所有数据库
./bin/scintirete-cli -p "your-password" db list

# 列出指定数据库的所有集合
./bin/scintirete-cli -p "your-password" collection list my_app
```

## 验证安装

### 1. 健康检查

```bash
# HTTP API 健康检查
curl http://localhost:8080/health

# 或使用 CLI
./bin/scintirete-cli health
```

### 2. 测试基本功能

```bash
# 创建测试数据库
./bin/scintirete-cli -p "test" db create test_db

# 创建测试集合
./bin/scintirete-cli -p "test" collection create test_db test_collection \
  --dimension 3 \
  --metric Euclidean

# 插入测试向量
./bin/scintirete-cli -p "test" vector insert test_db test_collection \
  --id "test1" \
  --vector '[1.0, 2.0, 3.0]'

# 搜索测试
./bin/scintirete-cli -p "test" vector search test_db test_collection \
  --vector '[1.1, 2.1, 3.1]' \
  --top-k 1
```

## 下一步

现在您已经成功安装并运行了 Scintirete，建议您继续阅读：

- [基础概念](./concepts.md) - 了解向量数据库的核心概念
- [API 参考](./api.md) - 学习如何通过 API 使用 Scintirete
- [部署指南](./deployment.md) - 了解生产环境部署方案
- [管理 UI](./manager-ui.md) - 掌握 Web 管理界面的使用

---

恭喜！您已经成功开始了 Scintirete 之旅！🎉