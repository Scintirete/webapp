# 故障排除

本章将介绍 Scintirete 向量数据库的常见问题、诊断方法和解决方案。

## 常见问题

### 安装和启动问题

#### 问题: 无法启动 Scintirete 服务器

**错误信息**:
```
FATA[0000] Failed to start server: bind: address already in use
```

**可能原因**:
- 端口 8080 或 9090 已被其他进程占用
- 配置文件错误
- 权限不足

**解决方案**:

1. **检查端口占用**:
```bash
# 检查端口占用
lsof -i :8080
lsof -i :9090

# 或者使用 netstat
netstat -tulpn | grep :8080
netstat -tulpn | grep :9090
```

2. **终止占用进程**:
```bash
# 终止占用端口的进程
sudo kill -9 <PID>
```

3. **修改配置文件**:
```toml
# 修改 scintirete.toml
[server]
http_port = 8081    # 修改为其他端口
grpc_port = 9091    # 修改为其他端口
```

4. **检查配置文件**:
```bash
# 验证配置文件语法
./bin/scintirete-server --validate-config /path/to/config.toml
```

#### 问题: 权限错误

**错误信息**:
```
FATA[0000] Failed to create data directory: permission denied
```

**解决方案**:

1. **检查目录权限**:
```bash
# 检查数据目录权限
ls -la /var/lib/scintirete/

# 设置正确权限
sudo chown -R scintirete:scintirete /var/lib/scintirete/
sudo chmod -R 750 /var/lib/scintirete/
```

2. **以正确用户运行**:
```bash
# 使用专用用户运行
sudo -u scintirete ./bin/scintirete-server
```

### 连接问题

#### 问题: 无法连接到服务器

**错误信息**:
```
Error: connection refused
```

**可能原因**:
- 服务器未启动
- 防火墙阻止
- 网络连接问题
- 地址或端口错误

**诊断步骤**:

1. **检查服务器状态**:
```bash
# 检查进程状态
ps aux | grep scintirete

# 检查服务状态（systemd）
sudo systemctl status scintirete
```

2. **检查网络连接**:
```bash
# 测试端口连通性
telnet localhost 8080
telnet localhost 9090

# 或者使用 curl
curl http://localhost:8080/health
```

3. **检查防火墙**:
```bash
# 检查防火墙状态
sudo ufw status

# 允许端口
sudo ufw allow 8080/tcp
sudo ufw allow 9090/tcp
```

4. **检查日志**:
```bash
# 查看服务器日志
sudo journalctl -u scintirete -f

# 或者查看日志文件
tail -f /var/log/scintirete/scintirete.log
```

#### 问题: 认证失败

**错误信息**:
```
Error: unauthorized access
```

**解决方案**:

1. **检查密码**:
```bash
# 确认密码正确
./bin/scintirete-cli -p "your-password" health
```

2. **重置密码**:
```bash
# 临时禁用密码验证
./bin/scintirete-server --no-auth

# 然后重新设置密码
```

3. **检查配置文件**:
```toml
# 确认密码配置正确
[server]
password = "your-secure-password"
```

### 性能问题

#### 问题: 查询响应缓慢

**症状**:
- 查询延迟超过 100ms
- CPU 使用率过高
- 内存使用率过高

**诊断步骤**:

1. **监控性能指标**:
```bash
# 获取性能指标
curl http://localhost:8080/api/v1/system/metrics \
  -H "Authorization: Bearer your-password"
```

2. **检查系统资源**:
```bash
# 检查 CPU 使用
top -p $(pgrep scintirete-server)

# 检查内存使用
free -h

# 检查磁盘 I/O
iostat -x 1
```

3. **分析查询日志**:
```bash
# 查看查询日志
grep "query" /var/log/scintirete/scintirete.log | tail -20
```

**解决方案**:

1. **优化 HNSW 参数**:
```toml
# 调整 HNSW 参数
[hnsw]
max_connections = 16    # 减少连接数
ef_construction = 40   # 减少构建候选数
ef_search = 50        # 减少搜索候选数
```

2. **增加内存限制**:
```toml
# 增加内存限制
[storage]
max_memory = "16GB"
```

3. **启用缓存**:
```toml
# 启用查询缓存
[cache]
enabled = true
max_size = "1GB"
ttl = "1h"
```

#### 问题: 插入性能低下

**症状**:
- 批量插入速度慢
- 单条插入延迟高
- 内存使用增长过快

**解决方案**:

1. **使用批量插入**:
```bash
# 批量插入示例
./bin/scintirete-cli -p "password" vector batch-insert \
  --database my_app \
  --collection documents \
  --file vectors.json
```

2. **调整批量大小**:
```python
# 优化批量大小
batch_size = 1000  # 根据实际情况调整
```

3. **禁用实时索引**:
```toml
# 临时禁用实时索引
[index]
real_time_index = false
flush_interval = "5m"
```

### 内存问题

#### 问题: 内存泄漏

**症状**:
- 内存使用持续增长
- 服务器响应变慢
- 最终被 OOM Killer 终止

**诊断步骤**:

1. **监控内存使用**:
```bash
# 监控内存使用
watch -n 1 'ps -p $(pgrep scintirete-server) -o pid,ppid,cmd,%mem,%cpu --sort=-%mem'

# 使用 pmap 分析
pmap -x $(pgrep scintirete-server)
```

2. **检查内存分配**:
```bash
# 使用 GDB 分析内存
gdb -p $(pgrep scintirete-server)
(gdb) info proc mappings
```

**解决方案**:

1. **重启服务**:
```bash
# 重启服务释放内存
sudo systemctl restart scintirete
```

2. **调整内存限制**:
```toml
# 设置内存限制
[storage]
max_memory = "8GB"
enable_memory_limit = true
```

3. **启用内存压缩**:
```toml
# 启用内存压缩
[storage]
enable_compression = true
compression_level = 6
```

#### 问题: 内存不足

**错误信息**:
```
FATA[0000] Out of memory
```

**解决方案**:

1. **增加系统内存**:
```bash
# 检查系统内存
free -h

# 增加 swap 空间
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

2. **优化内存使用**:
```toml
# 优化内存配置
[storage]
max_memory = "4GB"
enable_persistence = true
auto_save_interval = "1m"
```

3. **清理无用数据**:
```bash
# 清理旧数据
./bin/scintirete-cli -p "password" collection cleanup \
  --database my_app \
  --collection documents \
  --older-than 30d
```

### 存储问题

#### 问题: 磁盘空间不足

**症状**:
- 磁盘使用率接近 100%
- 写入操作失败
- 服务器响应缓慢

**解决方案**:

1. **检查磁盘使用**:
```bash
# 检查磁盘使用
df -h

# 检查目录大小
du -sh /var/lib/scintirete/*
```

2. **清理日志文件**:
```bash
# 清理旧日志
find /var/log/scintirete -name "*.log" -mtime +7 -delete

# 配置日志轮转
sudo nano /etc/logrotate.d/scintirete
```

3. **启用数据压缩**:
```toml
# 启用数据压缩
[storage]
enable_compression = true
compression_level = 6
```

4. **清理旧数据**:
```bash
# 删除旧数据库
./bin/scintirete-cli -p "password" db delete old_db

# 或者归档数据
./bin/scintirete-cli -p "password" db archive old_db
```

#### 问题: 数据损坏

**错误信息**:
```
FATA[0000] Data corruption detected
```

**解决方案**:

1. **检查数据完整性**:
```bash
# 检查数据完整性
./bin/scintirete-cli -p "password" db check my_app
```

2. **恢复备份数据**:
```bash
# 从备份恢复
./bin/scintirete-cli -p "password" db restore \
  --backup-file /backups/scintirete_backup_20240101.tar.gz
```

3. **重建索引**:
```bash
# 重建索引
./bin/scintirete-cli -p "password" collection rebuild-index \
  --database my_app \
  --collection documents
```

### 网络问题

#### 问题: 网络超时

**错误信息**:
```
Error: request timeout
```

**解决方案**:

1. **增加超时时间**:
```toml
# 增加超时时间
[server]
read_timeout = "30s"
write_timeout = "30s"
idle_timeout = "60s"
```

2. **检查网络连接**:
```bash
# 测试网络延迟
ping localhost

# 测试带宽
iperf3 -s
```

3. **优化网络配置**:
```bash
# 优化 TCP 参数
echo 'net.core.rmem_max = 134217728' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max = 134217728' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 诊断工具

### 系统诊断

#### 1. 系统信息检查

```bash
#!/bin/bash
# system-diagnosis.sh

echo "=== Scintirete 系统诊断报告 ==="
echo "生成时间: $(date)"
echo

# 系统信息
echo "=== 系统信息 ==="
uname -a
echo "操作系统: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2)"
echo "CPU 信息: $(lscpu | grep 'Model name' | cut -d: -f2 | xargs)"
echo "内存信息: $(free -h | grep Mem | awk '{print $2}')"
echo "磁盘信息: $(df -h / | tail -1 | awk '{print $4}') 可用"
echo

# Scintirete 进程状态
echo "=== Scintirete 进程状态 ==="
ps aux | grep scintirete-server | grep -v grep
echo

# 端口监听状态
echo "=== 端口监听状态 ==="
netstat -tulpn | grep -E ':8080|:9090'
echo

# 系统资源使用
echo "=== 系统资源使用 ==="
echo "CPU 使用率:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}'
echo "内存使用率:"
free -m | grep Mem | awk '{printf "%.2f%%", $3/$2 * 100.0}'
echo
echo "磁盘使用率:"
df -h / | tail -1 | awk '{print $5}'
echo

# Scintirete 日志
echo "=== 最近 10 条日志 ==="
tail -n 10 /var/log/scintirete/scintirete.log
echo

echo "=== 诊断完成 ==="
```

#### 2. 性能分析

```bash
#!/bin/bash
# performance-analysis.sh

echo "=== Scintirete 性能分析 ==="
echo "分析时间: $(date)"
echo

# 获取性能指标
echo "=== 性能指标 ==="
curl -s http://localhost:8080/api/v1/system/metrics \
  -H "Authorization: Bearer your-password" | jq .
echo

# 查询性能测试
echo "=== 查询性能测试 ==="
start_time=$(date +%s.%N)
for i in {1..100}; do
    curl -s http://localhost:8080/api/v1/databases/test_db/collections/test/search \
        -H "Authorization: Bearer your-password" \
        -H "Content-Type: application/json" \
        -d '{"vector": [0.1, 0.2, 0.3], "top_k": 10}' > /dev/null
done
end_time=$(date +%s.%N)

avg_latency=$(echo "($end_time - $start_time) / 100" | bc -l)
echo "平均查询延迟: ${avg_latency}s"
echo "QPS: $(echo "100 / $avg_latency" | bc -l)"
echo

# 内存使用分析
echo "=== 内存使用分析 ===
ps -p $(pgrep scintirete-server) -o pid,rss,vsz,pcpu,pmem --no-headers
echo

# 磁盘 I/O 分析
echo "=== 磁盘 I/O 分析 ==="
iostat -d -x 1 3 | grep -E 'Device|sda'
echo

echo "=== 分析完成 ==="
```

### 日志分析

#### 1. 错误日志分析

```bash
#!/bin/bash
# error-log-analysis.sh

LOG_FILE="/var/log/scintirete/scintirete.log"

echo "=== 错误日志分析 ==="
echo "分析文件: $LOG_FILE"
echo "分析时间: $(date)"
echo

# 统计错误类型
echo "=== 错误类型统计 ==="
grep -i "error\|failed\|exception" $LOG_FILE | \
    awk '{print $0}' | \
    sort | uniq -c | sort -nr
echo

# 最近错误
echo "=== 最近 10 个错误 ==="
grep -i "error\|failed\|exception" $LOG_FILE | tail -10
echo

# 错误趋势
echo "=== 错误趋势 (每小时) ==="
grep -i "error\|failed\|exception" $LOG_FILE | \
    awk '{print $1 " " $2}' | \
    cut -d: -f1 | \
    sort | uniq -c
echo

echo "=== 分析完成 ==="
```

#### 2. 查询日志分析

```bash
#!/bin/bash
# query-log-analysis.sh

LOG_FILE="/var/log/scintirete/scintirete.log"

echo "=== 查询日志分析 ==="
echo "分析文件: $LOG_FILE"
echo "分析时间: $(date)"
echo

# 查询统计
echo "=== 查询统计 ==="
total_queries=$(grep -c "query" $LOG_FILE)
echo "总查询数: $total_queries"

successful_queries=$(grep -c "query.*success" $LOG_FILE)
echo "成功查询数: $successful_queries"

failed_queries=$(grep -c "query.*failed" $LOG_FILE)
echo "失败查询数: $failed_queries"
echo

# 查询延迟分析
echo "=== 查询延迟分析 ==="
grep "query.*duration" $LOG_FILE | \
    awk '{print $NF}' | \
    sed 's/ms//' | \
    awk '{sum+=$1; count++} END {print "平均延迟:", sum/count "ms"}'
echo

# 慢查询
echo "=== 慢查询 (>100ms) ==="
grep "query.*duration.*[0-9][0-9][0-9]\." $LOG_FILE | \
    tail -5
echo

# 热门查询
echo "=== 热门查询 (按数据库) ==="
grep "query.*database:" $LOG_FILE | \
    awk -F'database:' '{print $2}' | \
    awk '{print $1}' | \
    sort | uniq -c | sort -nr | head -5
echo

echo "=== 分析完成 ==="
```

## 常见解决方案

### 性能优化方案

#### 1. 内存优化

```toml
# 内存优化配置
[storage]
max_memory = "8GB"
enable_compression = true
compression_level = 6
enable_memory_limit = true

[cache]
enabled = true
max_size = "1GB"
ttl = "1h"
eviction_policy = "lru"

[hnsw]
max_connections = 16
ef_construction = 40
ef_search = 50
```

#### 2. 查询优化

```python
# 查询优化示例
import asyncio
from concurrent.futures import ThreadPoolExecutor

class QueryOptimizer:
    def __init__(self, client):
        self.client = client
        self.cache = {}
        
    async def optimized_search(self, query_vector, top_k=10, filters=None):
        """优化搜索"""
        # 检查缓存
        cache_key = self._get_cache_key(query_vector, top_k, filters)
        if cache_key in self.cache:
            return self.cache[cache_key]
            
        # 优化过滤条件
        optimized_filters = self._optimize_filters(filters)
        
        # 执行搜索
        results = await self._execute_search(query_vector, top_k, optimized_filters)
        
        # 缓存结果
        self.cache[cache_key] = results
        
        return results
    
    def _optimize_filters(self, filters):
        """优化过滤条件"""
        if not filters:
            return None
            
        # 按选择性排序
        optimized_filters = {}
        for field, condition in sorted(filters.items(), key=lambda x: self._get_selectivity(x[0], x[1])):
            optimized_filters[field] = condition
            
        return optimized_filters
    
    async def _execute_search(self, query_vector, top_k, filters):
        """执行搜索"""
        # 实现搜索逻辑
        pass
```

### 数据恢复方案

#### 1. 从备份恢复

```bash
#!/bin/bash
# restore-from-backup.sh

BACKUP_FILE=$1
DATABASE_NAME=$2

if [ -z "$BACKUP_FILE" ] || [ -z "$DATABASE_NAME" ]; then
    echo "Usage: $0 <backup-file> <database-name>"
    exit 1
fi

echo "开始恢复数据..."
echo "备份文件: $BACKUP_FILE"
echo "数据库名称: $DATABASE_NAME"

# 停止服务
sudo systemctl stop scintirete

# 创建临时目录
TEMP_DIR="/tmp/scintirete-restore-$(date +%s)"
mkdir -p $TEMP_DIR

# 解压备份文件
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# 恢复数据
cp -r $TEMP_DIR/data/* /var/lib/scintirete/

# 恢复配置
if [ -f "$TEMP_DIR/config/scintirete.toml" ]; then
    cp $TEMP_DIR/config/scintirete.toml /etc/scintirete/
fi

# 设置权限
sudo chown -R scintirete:scintirete /var/lib/scintirete/
sudo chmod -R 750 /var/lib/scintirete/

# 启动服务
sudo systemctl start scintirete

# 清理临时文件
rm -rf $TEMP_DIR

echo "数据恢复完成！"
```

#### 2. 数据重建

```bash
#!/bin/bash
# rebuild-data.sh

DATABASE_NAME=$1
COLLECTION_NAME=$2

if [ -z "$DATABASE_NAME" ] || [ -z "$COLLECTION_NAME" ]; then
    echo "Usage: $0 <database-name> <collection-name>"
    exit 1
fi

echo "开始重建数据..."
echo "数据库名称: $DATABASE_NAME"
echo "集合名称: $COLLECTION_NAME"

# 创建备份
BACKUP_FILE="/backups/pre-rebuild-$(date +%Y%m%d_%H%M%S).tar.gz"
./bin/scintirete-cli -p "password" db backup $DATABASE_NAME -o $BACKUP_FILE

# 重建索引
./bin/scintirete-cli -p "password" collection rebuild-index \
    --database $DATABASE_NAME \
    --collection $COLLECTION_NAME

# 验证数据完整性
./bin/scintirete-cli -p "password" collection verify \
    --database $DATABASE_NAME \
    --collection $COLLECTION_NAME

echo "数据重建完成！"
echo "备份文件: $BACKUP_FILE"
```

### 监控和告警方案

#### 1. Prometheus 监控配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "scintirete_rules.yml"

scrape_configs:
  - job_name: 'scintirete'
    static_configs:
      - targets: ['localhost:9091']
    metrics_path: '/metrics'
    scrape_interval: 5s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - 'localhost:9093'
```

#### 2. 告警规则

```yaml
# scintirete_rules.yml
groups:
  - name: scintirete
    rules:
      - alert: ScintireteDown
        expr: up{job="scintirete"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Scintirete instance is down"
          description: "Scintirete instance {{ $labels.instance }} has been down for more than 1 minute"

      - alert: HighMemoryUsage
        expr: scintirete_memory_bytes_used / scintirete_memory_bytes_total * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Scintirete memory usage is {{ $value }}%"

      - alert: HighQueryLatency
        expr: histogram_quantile(0.95, rate(scintirete_query_duration_seconds_bucket[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High query latency detected"
          description: "95th percentile query latency is {{ $value }}s"
```

## 联系支持

### 获取帮助

如果以上解决方案无法解决您的问题，可以通过以下方式获取帮助：

1. **GitHub Issues**: [报告问题](https://github.com/scintirete/scintirete/issues)
2. **社区论坛**: [技术讨论](https://github.com/scintirete/scintirete/discussions)
3. **邮件支持**: [dev@scintirete.wj2015.com](mailto:dev@scintirete.wj2015.com)

### 报告问题的模板

```markdown
## 问题描述
简要描述您遇到的问题

## 环境信息
- Scintirete 版本:
- 操作系统:
- 硬件配置:
- 部署方式:

## 复现步骤
1. 执行步骤一
2. 执行步骤二
3. 观察到的结果

## 期望结果
描述您期望的结果

## 实际结果
描述实际发生的结果

## 错误信息
```
粘贴完整的错误信息
```

## 日志信息
```
粘贴相关的日志信息
```

## 附加信息
任何其他有用的信息
```

### 诊断信息收集

在报告问题之前，请运行以下命令收集诊断信息：

```bash
# 生成诊断报告
./bin/scintirete-cli -p "password" diagnostics > diagnostics-report.txt

# 收集系统信息
./bin/scintirete-cli -p "password" system-info >> diagnostics-report.txt

# 收集日志
tail -n 100 /var/log/scintirete/scintirete.log >> diagnostics-report.txt
```

将生成的 `diagnostics-report.txt` 文件附加到您的问题报告中。

---

通过本章的故障排除指南，您应该能够诊断和解决大多数 Scintirete 相关问题。如果问题仍然存在，请按照上述方式联系技术支持。