# 最佳实践

本章将介绍使用 Scintirete 向量数据库的最佳实践，帮助您构建高性能、可扩展的应用程序。

## 数据建模

### 向量设计

#### 1. 选择合适的向量维度

向量维度直接影响性能和准确性：

```python
# 推荐的向量维度
text_embeddings = {
    "small": 384,      # sentence-transformers/all-MiniLM-L6-v2
    "medium": 768,     # sentence-transformers/all-mpnet-base-v2
    "large": 1536     # OpenAI text-embedding-ada-002
}

image_embeddings = {
    "small": 512,      # ResNet-18
    "medium": 1024,    # ResNet-50
    "large": 2048     # ViT-B/32
}
```

**最佳实践**:
- **文本数据**: 使用 384-1536 维
- **图像数据**: 使用 512-2048 维
- **音频数据**: 使用 512-1024 维
- **平衡考虑**: 维度越高，准确性越好，但性能越差

#### 2. 向量预处理

```python
import numpy as np
from sklearn.preprocessing import normalize

def preprocess_vector(vector, method='l2'):
    """向量预处理"""
    vector = np.array(vector, dtype=np.float32)
    
    if method == 'l2':
        # L2 归一化
        return normalize(vector.reshape(1, -1), norm='l2')[0]
    elif method == 'max':
        # 最大值归一化
        return vector / np.max(np.abs(vector))
    elif method == 'standard':
        # 标准化
        return (vector - np.mean(vector)) / np.std(vector)
    
    return vector

# 使用示例
raw_vector = [1.0, 2.0, 3.0, 4.0]
processed_vector = preprocess_vector(raw_vector, method='l2')
```

#### 3. 向量质量检查

```python
def validate_vector(vector, expected_dim=None):
    """验证向量质量"""
    if not isinstance(vector, (list, np.ndarray)):
        raise ValueError("Vector must be a list or numpy array")
    
    if len(vector) == 0:
        raise ValueError("Vector cannot be empty")
    
    if expected_dim and len(vector) != expected_dim:
        raise ValueError(f"Expected dimension {expected_dim}, got {len(vector)}")
    
    # 检查 NaN 或 Inf 值
    if np.any(np.isnan(vector)) or np.any(np.isinf(vector)):
        raise ValueError("Vector contains NaN or Inf values")
    
    # 检查向量范数
    norm = np.linalg.norm(vector)
    if norm == 0:
        raise ValueError("Vector norm is zero")
    
    return True
```

### 元数据设计

#### 1. 元数据结构

```json
{
  "id": "doc_001",
  "vector": [0.1, 0.2, 0.3, ...],
  "metadata": {
    "content": {
      "title": "向量数据库简介",
      "summary": "介绍向量数据库的基本概念",
      "language": "zh",
      "word_count": 1500
    },
    "classification": {
      "category": "技术文档",
      "tags": ["数据库", "向量", "AI"],
      "difficulty": "入门"
    },
    " temporal": {
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "published_date": "2024-01-01"
    },
    "source": {
      "author": "scintirete-team",
      "website": "https://scintirete.example.com",
      "license": "MIT"
    },
    "technical": {
      "embedding_model": "text-embedding-ada-002",
      "processing_time": 0.25,
      "confidence_score": 0.95
    }
  }
}
```

#### 2. 元数据索引策略

```python
# 为常用查询字段创建索引
metadata_indexes = {
    "category": "string",        # 分类字段
    "created_at": "datetime",    # 时间字段
    "tags": "array",            # 标签字段
    "difficulty": "enum",       # 枚举字段
    "word_count": "numeric"     # 数值字段
}
```

#### 3. 元数据验证

```python
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

class ContentMetadata(BaseModel):
    title: str
    summary: Optional[str] = None
    language: str = "zh"
    word_count: int = 0

class ClassificationMetadata(BaseModel):
    category: str
    tags: List[str] = []
    difficulty: str = "入门"
    
    @validator('difficulty')
    def validate_difficulty(cls, v):
        allowed = ["入门", "中级", "高级"]
        if v not in allowed:
            raise ValueError(f"Difficulty must be one of {allowed}")
        return v

class DocumentMetadata(BaseModel):
    content: ContentMetadata
    classification: ClassificationMetadata
    created_at: datetime = datetime.now()
    # ... 其他字段
```

## 性能优化

### 索引优化

#### 1. HNSW 参数调优

```python
# 不同场景的 HNSW 参数配置
hnsw_configs = {
    "high_accuracy": {
        "max_connections": 64,
        "ef_construction": 400,
        "ef_search": 200
    },
    "balanced": {
        "max_connections": 32,
        "ef_construction": 200,
        "ef_search": 100
    },
    "high_performance": {
        "max_connections": 16,
        "ef_construction": 40,
        "ef_search": 50
    }
}

def get_hnsw_config(use_case):
    """根据使用场景获取 HNSW 配置"""
    return hnsw_configs.get(use_case, hnsw_configs["balanced"])
```

#### 2. 分区策略

```python
# 按时间分区
def get_partition_name(timestamp):
    """根据时间戳获取分区名称"""
    return f"partition_{timestamp.strftime('%Y_%m')}"

# 按数据类型分区
partition_schemes = {
    "text": "text_data",
    "image": "image_data", 
    "audio": "audio_data",
    "video": "video_data"
}

# 按业务域分区
business_partitions = {
    "ecommerce": ["products", "reviews", "users"],
    "content": ["articles", "videos", "podcasts"],
    "research": ["papers", "datasets", "models"]
}
```

#### 3. 内存管理

```python
class MemoryManager:
    def __init__(self, max_memory_gb=8):
        self.max_memory = max_memory_gb * 1024 * 1024 * 1024
        self.current_usage = 0
        self.cache = {}
        
    def check_memory(self, vector_size):
        """检查内存使用情况"""
        estimated_usage = len(self.cache) * vector_size * 4  # 4 bytes per float
        
        if estimated_usage > self.max_memory * 0.8:
            self.evict_cache()
            
        return estimated_usage < self.max_memory
    
    def evict_cache(self):
        """清理缓存"""
        # LRU 缓存清理策略
        oldest_keys = sorted(self.cache.keys(), key=lambda k: self.cache[k]['access_time'])[:len(self.cache)//2]
        for key in oldest_keys:
            del self.cache[key]
```

### 查询优化

#### 1. 批量查询

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

class BatchQueryOptimizer:
    def __init__(self, batch_size=100):
        self.batch_size = batch_size
        
    async def batch_search(self, queries, collection_name):
        """批量搜索优化"""
        results = []
        
        # 分批处理
        for i in range(0, len(queries), self.batch_size):
            batch = queries[i:i + self.batch_size]
            
            # 并行执行批量查询
            tasks = [
                self._search_single(query, collection_name)
                for query in batch
            ]
            
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)
            
        return results
    
    async def _search_single(self, query, collection_name):
        """单个查询"""
        # 实现单个查询逻辑
        pass
```

#### 2. 查询缓存

```python
from functools import lru_cache
import hashlib

class QueryCache:
    def __init__(self, max_size=1000):
        self.max_size = max_size
        
    def _get_query_hash(self, query_vector, top_k, filters):
        """生成查询哈希"""
        query_str = f"{query_vector[:10]}_{top_k}_{str(filters)}"
        return hashlib.md5(query_str.encode()).hexdigest()
    
    @lru_cache(maxsize=1000)
    def get_cached_result(self, query_hash):
        """获取缓存结果"""
        pass
    
    def cache_result(self, query_hash, result, ttl=3600):
        """缓存查询结果"""
        pass
```

#### 3. 预过滤优化

```python
class PreFilterOptimizer:
    def __init__(self, metadata_index):
        self.metadata_index = metadata_index
        
    def optimize_filters(self, filters):
        """优化过滤条件"""
        optimized_filters = {}
        
        for field, condition in filters.items():
            # 评估过滤条件的选择性
            selectivity = self._estimate_selectivity(field, condition)
            
            # 高选择性条件优先执行
            if selectivity < 0.1:  # 选择性 < 10%
                optimized_filters[field] = condition
                
        return optimized_filters
    
    def _estimate_selectivity(self, field, condition):
        """估算过滤条件的选择性"""
        # 实现选择性估算逻辑
        pass
```

### 插入优化

#### 1. 批量插入

```python
class BatchInserter:
    def __init__(self, client, batch_size=1000):
        self.client = client
        self.batch_size = batch_size
        self.buffer = []
        
    def add_vector(self, vector_id, vector, metadata=None):
        """添加向量到缓冲区"""
        self.buffer.append({
            "id": vector_id,
            "vector": vector,
            "metadata": metadata or {}
        })
        
        if len(self.buffer) >= self.batch_size:
            self.flush()
    
    def flush(self):
        """刷新缓冲区"""
        if not self.buffer:
            return
            
        try:
            # 批量插入
            self.client.insert_batch(
                database="my_app",
                collection="documents",
                vectors=self.buffer
            )
            
            self.buffer.clear()
            
        except Exception as e:
            # 处理错误，可以考虑重试
            print(f"Batch insert failed: {e}")
            raise
```

#### 2. 异步插入

```python
import asyncio
from aiohttp import ClientSession

class AsyncInserter:
    def __init__(self, api_url, max_concurrent=10):
        self.api_url = api_url
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        
    async def insert_vector(self, vector_data):
        """异步插入向量"""
        async with self.semaphore:
            async with ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/vectors",
                    json=vector_data
                ) as response:
                    return await response.json()
    
    async def bulk_insert(self, vectors):
        """批量异步插入"""
        tasks = [
            self.insert_vector(vector)
            for vector in vectors
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        successful = []
        failed = []
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                failed.append((vectors[i], result))
            else:
                successful.append(result)
                
        return successful, failed
```

## 数据管理

### 数据生命周期管理

#### 1. 数据归档策略

```python
class DataArchiver:
    def __init__(self, client):
        self.client = client
        
    def archive_old_data(self, days_threshold=90):
        """归档旧数据"""
        cutoff_date = datetime.now() - timedelta(days=days_threshold)
        
        # 查询旧数据
        old_data = self.client.search(
            database="my_app",
            collection="documents",
            filters={
                "created_at": {"$lt": cutoff_date.isoformat()}
            },
            limit=10000
        )
        
        # 归档到冷存储
        archived_count = self._move_to_cold_storage(old_data)
        
        # 从热存储删除
        self._delete_from_hot_storage(old_data)
        
        return archived_count
    
    def _move_to_cold_storage(self, data):
        """移动到冷存储"""
        # 实现冷存储逻辑
        pass
    
    def _delete_from_hot_storage(self, data):
        """从热存储删除"""
        # 实现删除逻辑
        pass
```

#### 2. 数据清理策略

```python
class DataCleaner:
    def __init__(self, client):
        self.client = client
        
    def cleanup_duplicates(self):
        """清理重复数据"""
        # 查找重复向量
        duplicates = self._find_duplicate_vectors()
        
        # 保留最新版本，删除旧版本
        for duplicate_group in duplicates:
            latest = max(duplicate_group, key=lambda x: x['created_at'])
            to_delete = [item for item in duplicate_group if item['id'] != latest['id']]
            
            for item in to_delete:
                self.client.delete_vector(item['id'])
                
        return len(duplicates)
    
    def cleanup_invalid_vectors(self):
        """清理无效向量"""
        invalid_count = 0
        
        # 检查向量维度
        collection_info = self.client.get_collection_info("documents")
        expected_dim = collection_info['dimension']
        
        # 批量检查
        vectors = self.client.list_vectors("documents", limit=10000)
        
        for vector in vectors:
            if len(vector['vector']) != expected_dim:
                self.client.delete_vector(vector['id'])
                invalid_count += 1
                
        return invalid_count
```

### 数据备份策略

#### 1. 增量备份

```python
class IncrementalBackup:
    def __init__(self, client, backup_dir="/backups"):
        self.client = client
        self.backup_dir = backup_dir
        
    def backup_incremental(self):
        """增量备份"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(self.backup_dir, f"incremental_{timestamp}.json")
        
        # 获取上次备份时间
        last_backup = self._get_last_backup_time()
        
        # 查询新增和修改的数据
        new_data = self.client.get_data_since(last_backup)
        
        # 保存增量数据
        with open(backup_file, 'w') as f:
            json.dump(new_data, f)
            
        # 更新备份时间戳
        self._update_last_backup_time(timestamp)
        
        return backup_file
    
    def _get_last_backup_time(self):
        """获取上次备份时间"""
        # 实现获取上次备份时间的逻辑
        pass
    
    def _update_last_backup_time(self, timestamp):
        """更新备份时间戳"""
        # 实现更新备份时间戳的逻辑
        pass
```

#### 2. 快照备份

```python
class SnapshotBackup:
    def __init__(self, client, backup_dir="/backups"):
        self.client = client
        self.backup_dir = backup_dir
        
    def create_snapshot(self):
        """创建快照"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_dir = os.path.join(self.backup_dir, f"snapshot_{timestamp}")
        
        os.makedirs(snapshot_dir, exist_ok=True)
        
        # 备份所有数据
        databases = self.client.list_databases()
        
        for db in databases:
            db_dir = os.path.join(snapshot_dir, db['name'])
            os.makedirs(db_dir, exist_ok=True)
            
            collections = self.client.list_collections(db['name'])
            
            for collection in collections:
                collection_file = os.path.join(db_dir, f"{collection['name']}.json")
                
                # 导出集合数据
                data = self.client.export_collection(db['name'], collection['name'])
                
                with open(collection_file, 'w') as f:
                    json.dump(data, f)
                    
        return snapshot_dir
```

## 监控和告警

### 性能监控

#### 1. 关键指标监控

```python
class PerformanceMonitor:
    def __init__(self, client):
        self.client = client
        
    def get_performance_metrics(self):
        """获取性能指标"""
        metrics = {
            "query_performance": self._get_query_metrics(),
            "insert_performance": self._get_insert_metrics(),
            "memory_usage": self._get_memory_metrics(),
            "storage_usage": self._get_storage_metrics()
        }
        
        return metrics
    
    def _get_query_metrics(self):
        """获取查询性能指标"""
        return {
            "qps": self.client.get_query_rate(),
            "avg_latency": self.client.get_avg_query_latency(),
            "p95_latency": self.client.get_p95_query_latency(),
            "p99_latency": self.client.get_p99_query_latency(),
            "error_rate": self.client.get_query_error_rate()
        }
    
    def _get_insert_metrics(self):
        """获取插入性能指标"""
        return {
            "insert_rate": self.client.get_insert_rate(),
            "batch_insert_rate": self.client.get_batch_insert_rate(),
            "insert_error_rate": self.client.get_insert_error_rate()
        }
    
    def _get_memory_metrics(self):
        """获取内存使用指标"""
        return {
            "total_memory": self.client.get_total_memory(),
            "used_memory": self.client.get_used_memory(),
            "memory_usage_percent": self.client.get_memory_usage_percent(),
            "cache_hit_rate": self.client.get_cache_hit_rate()
        }
    
    def _get_storage_metrics(self):
        """获取存储使用指标"""
        return {
            "total_storage": self.client.get_total_storage(),
            "used_storage": self.client.get_used_storage(),
            "storage_usage_percent": self.client.get_storage_usage_percent(),
            "index_size": self.client.get_index_size()
        }
```

#### 2. 异常检测

```python
class AnomalyDetector:
    def __init__(self, client):
        self.client = client
        self.baseline_metrics = {}
        
    def detect_anomalies(self):
        """检测异常"""
        current_metrics = self.client.get_performance_metrics()
        anomalies = []
        
        for metric_name, current_value in current_metrics.items():
            if metric_name in self.baseline_metrics:
                baseline = self.baseline_metrics[metric_name]
                
                # 检查是否超出阈值
                if self._is_anomaly(current_value, baseline):
                    anomalies.append({
                        "metric": metric_name,
                        "current_value": current_value,
                        "baseline": baseline,
                        "severity": self._calculate_severity(current_value, baseline)
                    })
                    
        return anomalies
    
    def _is_anomaly(self, current_value, baseline):
        """判断是否为异常"""
        # 实现异常检测逻辑
        # 可以使用统计方法、机器学习模型等
        pass
    
    def _calculate_severity(self, current_value, baseline):
        """计算异常严重程度"""
        # 实现严重程度计算逻辑
        pass
```

### 告警配置

#### 1. 告警规则

```python
class AlertRules:
    def __init__(self):
        self.rules = {
            "high_latency": {
                "condition": lambda metrics: metrics["p95_latency"] > 0.1,
                "severity": "warning",
                "message": "High query latency detected"
            },
            "high_memory_usage": {
                "condition": lambda metrics: metrics["memory_usage_percent"] > 80,
                "severity": "critical",
                "message": "High memory usage detected"
            },
            "high_error_rate": {
                "condition": lambda metrics: metrics["error_rate"] > 0.05,
                "severity": "critical",
                "message": "High error rate detected"
            },
            "low_cache_hit_rate": {
                "condition": lambda metrics: metrics["cache_hit_rate"] < 0.8,
                "severity": "warning",
                "message": "Low cache hit rate detected"
            }
        }
    
    def evaluate_alerts(self, metrics):
        """评估告警规则"""
        alerts = []
        
        for rule_name, rule_config in self.rules.items():
            if rule_config["condition"](metrics):
                alerts.append({
                    "rule": rule_name,
                    "severity": rule_config["severity"],
                    "message": rule_config["message"],
                    "timestamp": datetime.now().isoformat()
                })
                
        return alerts
```

#### 2. 告警通知

```python
class AlertNotifier:
    def __init__(self, config):
        self.config = config
        
    def send_alert(self, alert):
        """发送告警通知"""
        if alert["severity"] == "critical":
            self._send_critical_alert(alert)
        else:
            self._send_warning_alert(alert)
    
    def _send_critical_alert(self, alert):
        """发送严重告警"""
        # 邮件通知
        self._send_email(alert)
        
        # 短信通知
        self._send_sms(alert)
        
        # Slack 通知
        self._send_slack(alert)
    
    def _send_warning_alert(self, alert):
        """发送警告告警"""
        # Slack 通知
        self._send_slack(alert)
        
        # 邮件通知
        self._send_email(alert)
    
    def _send_email(self, alert):
        """发送邮件通知"""
        # 实现邮件发送逻辑
        pass
    
    def _send_sms(self, alert):
        """发送短信通知"""
        # 实现短信发送逻辑
        pass
    
    def _send_slack(self, alert):
        """发送 Slack 通知"""
        # 实现 Slack 通知逻辑
        pass
```

## 安全最佳实践

### 访问控制

#### 1. API 密钥管理

```python
class APIKeyManager:
    def __init__(self):
        self.keys = {}
        
    def generate_key(self, user_id, permissions):
        """生成 API 密钥"""
        import secrets
        import hashlib
        
        # 生成随机密钥
        key = secrets.token_urlsafe(32)
        
        # 计算密钥哈希
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        # 存储密钥信息
        self.keys[key_hash] = {
            "user_id": user_id,
            "permissions": permissions,
            "created_at": datetime.now(),
            "last_used": None,
            "is_active": True
        }
        
        return key
    
    def validate_key(self, key):
        """验证 API 密钥"""
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        if key_hash not in self.keys:
            return False
            
        key_info = self.keys[key_hash]
        
        if not key_info["is_active"]:
            return False
            
        # 更新最后使用时间
        key_info["last_used"] = datetime.now()
        
        return True
    
    def revoke_key(self, key):
        """撤销 API 密钥"""
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        if key_hash in self.keys:
            self.keys[key_hash]["is_active"] = False
            return True
            
        return False
```

#### 2. 权限控制

```python
class PermissionManager:
    def __init__(self):
        self.permissions = {
            "read": ["search", "get", "list"],
            "write": ["insert", "update", "delete"],
            "admin": ["create_db", "delete_db", "manage_users"]
        }
        
    def check_permission(self, user_permissions, action):
        """检查用户权限"""
        for permission in user_permissions:
            if action in self.permissions.get(permission, []):
                return True
                
        return False
    
    def require_permission(self, action):
        """权限检查装饰器"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                # 获取用户权限
                user_permissions = self._get_user_permissions()
                
                # 检查权限
                if not self.check_permission(user_permissions, action):
                    raise PermissionError(f"Permission denied for action: {action}")
                    
                return func(*args, **kwargs)
            return wrapper
        return decorator
```

### 数据加密

#### 1. 传输加密

```python
import ssl
from cryptography.fernet import Fernet

class DataEncryption:
    def __init__(self, key=None):
        self.key = key or Fernet.generate_key()
        self.cipher = Fernet(self.key)
        
    def encrypt_data(self, data):
        """加密数据"""
        if isinstance(data, str):
            data = data.encode()
        elif isinstance(data, dict):
            data = json.dumps(data).encode()
            
        return self.cipher.encrypt(data)
    
    def decrypt_data(self, encrypted_data):
        """解密数据"""
        decrypted = self.cipher.decrypt(encrypted_data)
        
        try:
            return json.loads(decrypted.decode())
        except json.JSONDecodeError:
            return decrypted.decode()
    
    def create_ssl_context(self):
        """创建 SSL 上下文"""
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(certfile="server.crt", keyfile="server.key")
        context.verify_mode = ssl.CERT_REQUIRED
        context.load_verify_locations(cafile="ca.crt")
        
        return context
```

#### 2. 数据脱敏

```python
class DataMasking:
    def __init__(self):
        self.sensitive_fields = [
            "password", "api_key", "token", "secret",
            "email", "phone", "credit_card"
        ]
        
    def mask_data(self, data):
        """脱敏敏感数据"""
        if isinstance(data, dict):
            masked_data = {}
            for key, value in data.items():
                if key in self.sensitive_fields:
                    masked_data[key] = self._mask_value(value)
                else:
                    masked_data[key] = self.mask_data(value)
            return masked_data
        elif isinstance(data, list):
            return [self.mask_data(item) for item in data]
        else:
            return data
    
    def _mask_value(self, value):
        """脱敏单个值"""
        if isinstance(value, str):
            if len(value) <= 8:
                return "*" * len(value)
            else:
                return value[:4] + "*" * (len(value) - 8) + value[-4:]
        elif isinstance(value, (int, float)):
            return "*" * len(str(value))
        else:
            return "***"
```

---

通过遵循这些最佳实践，您可以构建高性能、安全、可维护的 Scintirete 向量数据库应用。如有任何问题，请参考其他章节或联系技术支持。