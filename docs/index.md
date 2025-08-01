# Scintirete 文档

欢迎来到 Scintirete 开源高性能向量数据库的官方文档！

## 什么是 Scintirete？

Scintirete（发音: /skin.ti're.te/）是一个简单、轻量、面向生产的高性能向量数据库。它的名字来源于意大利语，"Scinti(lla)" 意为火花，"Rete" 意为网络，合起来就是"火花之网"或"闪光的网络"。

这个项目旨在为中小型项目、边缘计算场景以及需要快速原型验证的开发者，提供一个开箱即用、性能卓越且易于维护的向量搜索解决方案。

## 核心特性

- **简单轻量**: 核心逻辑自主实现，无冗余依赖，专注于向量搜索的核心功能
- **高性能**: 基于内存中的 HNSW 图索引，提供毫秒级的最近邻搜索
- **数据安全**: 基于 flatbuffers 实现了类似于 Redis 的 AOF + RDB 高效持久化机制
- **现代接口**: 原生支持 gRPC 和 HTTP/JSON 双接口，易于集成到任何现代应用架构中
- **易于运维**: 提供结构化日志、审计日志、Prometheus 指标和便捷的命令行工具
- **跨平台**: 支持 Linux、macOS、Windows 及 arm64 、amd64 架构开箱即用
- **支持文本嵌入**: 支持 OpenAI 兼容 API 集成，支持自动文本向量化

## 快速开始

1. **环境准备**
   - Go 1.24+（从源码构建时需要）
   - Docker（可选，用于容器化部署）

2. **安装 Scintirete**
   ```bash
   # 下载预编译二进制文件
   wget https://github.com/scintirete/scintirete/releases/latest/download/scintirete-linux-amd64.tar.gz
   tar -xzf scintirete-linux-amd64.tar.gz
   
   # 或从源码构建
   git clone https://github.com/scintirete/scintirete.git
   cd scintirete
   make all
   ```

3. **启动服务**
   ```bash
   ./bin/scintirete-server
   ```

4. **使用管理 UI**
   访问 [manager.scintirete.wj2015.com](https://manager.scintirete.wj2015.com) 进行可视化管理

## 文档导航

- [快速上手](./getting-started.md) - 详细的安装和配置指南
- [基础概念](./concepts.md) - 了解向量数据库的核心概念
- [API 参考](./api.md) - 完整的 API 文档
- [部署指南](./deployment.md) - 生产环境部署方案
- [管理 UI](./manager-ui.md) - Web 管理界面使用指南
- [最佳实践](./best-practices.md) - 使用建议和优化技巧
- [故障排除](./troubleshooting.md) - 常见问题解决方案

## 社区支持

- **GitHub Issues**: [报告问题或建议功能](https://github.com/scintirete/scintirete/issues)
- **讨论区**: [技术讨论和交流](https://github.com/scintirete/scintirete/discussions)
- **邮件列表**: [订阅更新通知](mailto:dev@scintirete.wj2015.com)

## 许可证

Scintirete 采用 MIT 许可证，详见 [LICENSE](https://github.com/scintirete/scintirete/blob/main/LICENSE) 文件。

---

*点亮数据之网，发现无限近邻* ✨