# 部署指南

本章将介绍如何在生产环境中部署 Scintirete 向量数据库，包括单机部署、集群部署和容器化部署等多种方案。

## 部署前准备

### 系统要求

#### 硬件要求

| 组件 | 最低配置 | 推荐配置 | 生产环境 |
|------|----------|----------|----------|
| CPU | 2核心 | 4核心 | 8核心+ |
| 内存 | 4GB | 8GB | 16GB+ |
| 存储 | 50GB SSD | 200GB SSD | 1TB+ SSD |
| 网络 | 1Gbps | 1Gbps | 10Gbps |

#### 软件要求

- **操作系统**: Linux (Ubuntu 20.04+, CentOS 8+), macOS 10.15+, Windows Server 2019+
- **Go**: 1.24+ (仅源码构建需要)
- **Docker**: 20.10+ (容器化部署需要)
- **Docker Compose**: 1.29+ (容器编排需要)

### 网络配置

#### 端口规划

| 端口 | 协议 | 用途 | 说明 |
|------|------|------|------|
| 8080 | HTTP | HTTP/JSON API | 客户端访问 |
| 9090 | gRPC | gRPC API | 高性能通信 |
| 8081 | HTTP | 管理界面 | Web 管理界面 |
| 9091 | HTTP | Prometheus 指标 | 监控指标 |

#### 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp
sudo ufw allow 9090/tcp
sudo ufw allow 8081/tcp
sudo ufw allow 9091/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=9090/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=9091/tcp
sudo firewall-cmd --reload
```

## 单机部署

### 二进制部署

#### 1. 下载并安装

```bash
# 创建工作目录
sudo mkdir -p /opt/scintirete/{bin,config,data,logs}
sudo chown -R $USER:$USER /opt/scintirete

# 下载最新版本
cd /opt/scintirete
wget https://github.com/scintirete/scintirete/releases/latest/download/scintirete-linux-amd64.tar.gz
tar -xzf scintirete-linux-amd64.tar.gz

# 移动二进制文件
mv bin/scintirete-server /opt/scintirete/bin/
mv bin/scintirete-cli /opt/scintirete/bin/

# 添加到 PATH
echo 'export PATH=/opt/scintirete/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 2. 创建配置文件

```bash
# 复制配置模板
cp config/scintirete.template.toml /opt/scintirete/config/scintirete.toml

# 编辑配置文件
nano /opt/scintirete/config/scintirete.toml
```

配置文件示例：

```toml
# 服务器配置
[server]
host = "0.0.0.0"
http_port = 8080
grpc_port = 9090
password = "your-secure-password"

# 存储配置
[storage]
data_dir = "/opt/scintirete/data"
max_memory = "8GB"
enable_compression = true

# 持久化配置
[persistence]
enable_aof = true
aof_file = "/opt/scintirete/data/scintirete.aof"
enable_rdb = true
rdb_file = "/opt/scintirete/data/scintirete.rdb"
rdb_save_interval = "5m"

# 嵌入服务配置
[embedding]
base_url = "https://api.openai.com/v1/embeddings"
api_key = "your-openai-api-key"
rpm_limit = 3500
tpm_limit = 90000

# 日志配置
[logging]
level = "info"
file = "/opt/scintirete/logs/scintirete.log"
max_size = "100MB"
max_backups = 10
max_age = "30d"

# 监控配置
[monitoring]
enable_metrics = true
metrics_port = 9091
enable_health_check = true
```

#### 3. 创建 systemd 服务

```bash
# 创建服务文件
sudo nano /etc/systemd/system/scintirete.service
```

服务文件内容：

```ini
[Unit]
Description=Scintirete Vector Database
After=network.target

[Service]
Type=simple
User=scintirete
Group=scintirete
WorkingDirectory=/opt/scintirete
ExecStart=/opt/scintirete/bin/scintirete-server -c /opt/scintirete/config/scintirete.toml
Restart=always
RestartSec=5
LimitNOFILE=65536

# 环境变量
Environment=SCINTIRETE_CONFIG_DIR=/opt/scintirete/config
Environment=SCINTIRETE_DATA_DIR=/opt/scintirete/data

[Install]
WantedBy=multi-user.target
```

#### 4. 启动服务

```bash
# 创建用户
sudo useradd -r -s /bin/false scintirete
sudo chown -R scintirete:scintirete /opt/scintirete

# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start scintirete

# 设置开机自启
sudo systemctl enable scintirete

# 查看服务状态
sudo systemctl status scintirete
```

#### 5. 验证部署

```bash
# 健康检查
curl http://localhost:8080/health

# 查看日志
sudo journalctl -u scintirete -f

# 使用 CLI 测试
scintirete-cli -p "your-password" health
```

### 源码部署

#### 1. 环境准备

```bash
# 安装 Go
wget https://golang.org/dl/go1.24.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.24.0.linux-amd64.tar.gz
echo 'export PATH=/usr/local/go/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 验证安装
go version
```

#### 2. 编译安装

```bash
# 克隆源码
git clone https://github.com/scintirete/scintirete.git
cd scintirete

# 编译
make all

# 安装
sudo make install
```

## 容器化部署

### Docker 部署

#### 1. 基本部署

```bash
# 拉取镜像
docker pull ghcr.io/scintirete/scintirete:latest

# 创建数据目录
sudo mkdir -p /opt/scintirete/{data,config,logs}
sudo chown -R $USER:$USER /opt/scintirete

# 运行容器
docker run -d \
  --name scintirete \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 9090:9090 \
  -p 9091:9091 \
  -v /opt/scintirete/data:/data \
  -v /opt/scintirete/config:/config \
  -v /opt/scintirete/logs:/logs \
  -e SCINTIRETE_PASSWORD="your-secure-password" \
  -e SCINTIRETE_MAX_MEMORY="8GB" \
  ghcr.io/scintirete/scintirete:latest
```

#### 2. 使用自定义配置

```bash
# 创建配置文件
cat > /opt/scintirete/config/scintirete.toml << EOF
[server]
host = "0.0.0.0"
http_port = 8080
grpc_port = 9090
password = "your-secure-password"

[storage]
data_dir = "/data"
max_memory = "8GB"

[embedding]
base_url = "https://api.openai.com/v1/embeddings"
api_key = "your-openai-api-key"
rpm_limit = 3500
tpm_limit = 90000
EOF

# 运行容器
docker run -d \
  --name scintirete \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 9090:9090 \
  -v /opt/scintirete/data:/data \
  -v /opt/scintirete/config:/config \
  ghcr.io/scintirete/scintirete:latest \
  -c /config/scintirete.toml
```

### Docker Compose 部署

#### 1. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  scintirete:
    image: ghcr.io/scintirete/scintirete:latest
    container_name: scintirete
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "9090:9090"
      - "9091:9091"
    volumes:
      - ./data:/data
      - ./config:/config
      - ./logs:/logs
    environment:
      - SCINTIRETE_PASSWORD=${SCINTIRETE_PASSWORD}
      - SCINTIRETE_MAX_MEMORY=${SCINTIRETE_MAX_MEMORY:-8GB}
      - SCINTIRETE_EMBEDDING_API_KEY=${OPENAI_API_KEY}
    networks:
      - scintirete-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  prometheus:
    image: prom/prometheus:latest
    container_name: scintirete-prometheus
    restart: unless-stopped
    ports:
      - "9092:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - scintirete-network

  grafana:
    image: grafana/grafana:latest
    container_name: scintirete-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    networks:
      - scintirete-network

networks:
  scintirete-network:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:
```

#### 2. 创建环境变量文件

```bash
# .env
SCINTIRETE_PASSWORD=your-secure-password
SCINTIRETE_MAX_MEMORY=8GB
OPENAI_API_KEY=your-openai-api-key
GRAFANA_PASSWORD=your-grafana-password
```

#### 3. 创建监控配置

```bash
# 创建监控目录
mkdir -p monitoring/{prometheus,grafana/{dashboards,datasources}}

# Prometheus 配置
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'scintirete'
    static_configs:
      - targets: ['scintirete:9091']
    metrics_path: '/metrics'
    scrape_interval: 15s
EOF

# Grafana 数据源配置
cat > monitoring/grafana/datasources/datasources.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    orgId: 1
    url: http://prometheus:9090
    basicAuth: false
    isDefault: true
    version: 1
    editable: false
EOF
```

#### 4. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f scintirete
```

## 集群部署

### 主从复制

#### 1. 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Master Node   │    │   Slave Node 1  │    │   Slave Node 2  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   HTTP   │  │    │  │   HTTP   │  │    │  │   HTTP   │  │
│  │   8080   │  │    │  │   8080   │  │    │  │   8080   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   gRPC   │  │    │  │   gRPC   │  │    │  │   gRPC   │  │
│  │   9090   │  │    │  │   9090   │  │    │  │   9090   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │  Storage  │  │    │  │  Storage  │  │    │  │  Storage  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│      │         │    │      │         │    │      │         │
│      └─────────┼────┼──────┘         │    │      └─────────┘
│                │    │                │    │                │
└────────────────┘    └────────────────┘    └────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │   Load Balancer │
                    │                 │
                    │  ┌───────────┐  │
                    │  │   HTTP   │  │
                    │  │   80     │  │
                    │  └───────────┘  │
                    │                 │
                    └─────────────────┘
```

#### 2. 主节点配置

```toml
# master.toml
[server]
host = "0.0.0.0"
http_port = 8080
grpc_port = 9090
password = "your-secure-password"

[replication]
role = "master"
enable_replication = true
slave_addresses = ["slave1:9090", "slave2:9090"]
replication_interval = "1s"

[storage]
data_dir = "/opt/scintirete/data"
max_memory = "16GB"
```

#### 3. 从节点配置

```toml
# slave.toml
[server]
host = "0.0.0.0"
http_port = 8080
grpc_port = 9090
password = "your-secure-password"

[replication]
role = "slave"
enable_replication = true
master_address = "master:9090"

[storage]
data_dir = "/opt/scintirete/data"
max_memory = "8GB"
```

#### 4. 负载均衡配置

```nginx
# nginx.conf
upstream scintirete_backend {
    server master:8080;
    server slave1:8080;
    server slave2:8080;
}

server {
    listen 80;
    server_name scintirete.example.com;

    location / {
        proxy_pass http://scintirete_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 分片集群

#### 1. 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Shard 1       │    │   Shard 2       │    │   Shard 3       │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   HTTP   │  │    │  │   HTTP   │  │    │  │   HTTP   │  │
│  │   8081   │  │    │  │   8082   │  │    │  │   8083   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   gRPC   │  │    │  │   gRPC   │  │    │  │   gRPC   │  │
│  │   9091   │  │    │  │   9092   │  │    │  │   9093   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │  Storage  │  │    │  │  Storage  │  │    │  │  Storage  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │   Router        │
                    │                 │
                    │  ┌───────────┐  │
                    │  │   HTTP   │  │
                    │  │   8080   │  │
                    │  └───────────┘  │
                    │                 │
                    │  ┌───────────┐  │
                    │  │ Routing  │  │
                    │  │ Logic    │  │
                    │  └───────────┘  │
                    │                 │
                    └─────────────────┘
```

#### 2. 路由器配置

```javascript
// 路由逻辑示例
class ScintireteRouter {
  constructor(shards) {
    this.shards = shards;
  }

  getShard(key) {
    // 一致性哈希路由
    const hash = this.hash(key);
    const shardIndex = hash % this.shards.length;
    return this.shards[shardIndex];
  }

  hash(key) {
    // 简单哈希函数
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async search(query) {
    // 并行查询所有分片
    const promises = this.shards.map(shard => 
      shard.search(query)
    );
    
    const results = await Promise.all(promises);
    
    // 合并和排序结果
    return this.mergeResults(results);
  }
}
```

## 监控和日志

### Prometheus 监控

#### 1. 配置 Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'scintirete'
    static_configs:
      - targets: ['localhost:9091']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'scintirete-cluster'
    static_configs:
      - targets: ['node1:9091', 'node2:9091', 'node3:9091']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

#### 2. 关键指标

```prometheus
# 查询性能
scintirete_query_duration_seconds_bucket{le="0.1"}
scintirete_query_total

# 存储使用
scintirete_storage_bytes_total
scintirete_storage_vectors_total

# 内存使用
scintirete_memory_bytes_used

# 复制状态
scintirete_replication_lag_seconds
scintirete_replication_connected_slaves
```

### 日志管理

#### 1. 日志配置

```toml
[logging]
level = "info"
format = "json"
output = "file"
file = "/opt/scintirete/logs/scintirete.log"
max_size = "100MB"
max_backups = 10
max_age = "30d"
compress = true
```

#### 2. 日志轮转

```bash
# logrotate 配置
/opt/scintirete/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 scintirete scintirete
    postrotate
        systemctl kill -s USR1 scintirete.service
    endscript
}
```

#### 3. 结构化日志

```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "info",
  "component": "query_engine",
  "message": "Query executed successfully",
  "duration_ms": 15,
  "database": "my_app",
  "collection": "documents",
  "query_type": "search",
  "results_count": 5,
  "client_ip": "192.168.1.100",
  "user_agent": "Scintirete CLI/1.0.0"
}
```

## 安全配置

### 网络安全

#### 1. 防火墙配置

```bash
# 限制访问IP
sudo ufw allow from 192.168.1.0/24 to any port 8080
sudo ufw allow from 192.168.1.0/24 to any port 9090

# 限制访问频率
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

#### 2. SSL/TLS 配置

```nginx
# nginx SSL 配置
server {
    listen 443 ssl http2;
    server_name scintirete.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 认证和授权

#### 1. API 认证

```bash
# 使用环境变量设置密码
export SCINTIRETE_PASSWORD="your-secure-password"

# 或在配置文件中设置
[server]
password = "your-secure-password"
```

#### 2. 访问控制

```javascript
// 中间件示例
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  
  const token = authHeader.substring(7);
  if (token !== process.env.SCINTIRETE_PASSWORD) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  next();
}
```

## 性能调优

### 系统优化

#### 1. 内核参数调优

```bash
# sysctl.conf
# 增加文件描述符限制
fs.file-max = 1000000

# 网络参数调优
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1

# 内存管理
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2
```

#### 2. 文件系统优化

```bash
# 挂载选项
/dev/sdb1 /opt/scintirete/data ext4 defaults,noatime,nodiratime,data=writeback 0 0

# 文件系统调优
tune2fs -o journal_data_writeback /dev/sdb1
```

### 应用优化

#### 1. 内存配置

```toml
[storage]
max_memory = "16GB"
enable_compression = true
compression_level = 6

[index]
max_connections = 64
ef_construction = 200
ef_search = 100
```

#### 2. 并发配置

```toml
[server]
max_connections = 10000
read_timeout = "30s"
write_timeout = "30s"
idle_timeout = "60s"

[pool]
worker_count = 16
queue_size = 1000
```

## 备份和恢复

### 数据备份

#### 1. RDB 备份

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/opt/scintirete/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 停止写入
scintirete-cli -p "your-password" maintenance pause

# 创建 RDB 快照
cp /opt/scintirete/data/scintirete.rdb $BACKUP_DIR/scintirete_$DATE.rdb

# 恢复写入
scintirete-cli -p "your-password" maintenance resume

# 压缩备份
gzip $BACKUP_DIR/scintirete_$DATE.rdb

# 清理旧备份（保留7天）
find $BACKUP_DIR -name "*.rdb.gz" -mtime +7 -delete
```

#### 2. AOF 备份

```bash
# AOF 备份脚本
#!/bin/bash
BACKUP_DIR="/opt/scintirete/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份 AOF 文件
cp /opt/scintirete/data/scintirete.aof $BACKUP_DIR/scintirete_$DATE.aof

# 重写 AOF
scintirete-cli -p "your-password" bgrewriteaof
```

### 数据恢复

#### 1. 从 RDB 恢复

```bash
# 停止服务
sudo systemctl stop scintirete

# 备份当前数据
mv /opt/scintirete/data/scintirete.rdb /opt/scintirete/data/scintirete.rdb.backup

# 恢复数据
cp /path/to/backup/scintirete_20240101_120000.rdb /opt/scintirete/data/scintirete.rdb

# 启动服务
sudo systemctl start scintirete
```

#### 2. 从 AOF 恢复

```bash
# 停止服务
sudo systemctl stop scintirete

# 备份当前数据
mv /opt/scintirete/data/scintirete.aof /opt/scintirete/data/scintirete.aof.backup

# 恢复 AOF
cp /path/to/backup/scintirete_20240101_120000.aof /opt/scintirete/data/scintirete.aof

# 启动服务
sudo systemctl start scintirete
```

---

通过本章的部署指南，您应该能够在生产环境中成功部署和管理 Scintirete 向量数据库。如有任何问题，请参考 [故障排除](./troubleshooting.md) 章节。