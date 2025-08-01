# Scintirete

[![Go](https://github.com/scintirete/scintirete/actions/workflows/ci.yml/badge.svg)](https://github.com/scintirete/scintirete/actions/workflows/ci.yml)
[![Release](https://github.com/scintirete/scintirete/actions/workflows/release.yml/badge.svg)](https://github.com/scintirete/scintirete/actions/workflows/release.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Scintirete 是一款基于 HNSW（分层导航小世界）算法实现的轻量级、面向生产的向量数据库。它的名字源于拉丁语 Scintilla（火花）和 Rete（网络），意为闪光的火花之网，寓意着在庞杂的数据网络中，用数据间最深层的相似性点亮那些微小却关键的火花。

**核心理念：** 点亮数据之网，发现无限近邻。

## 特性

- **简单轻量**: 核心逻辑自主实现，无冗余依赖，专注于向量搜索的核心功能
- **高性能**: 基于内存中的 HNSW 图索引，提供毫秒级的最近邻搜索
- **数据安全**: 基于 flatbuffers 实现了类似于 Redis 的 AOF + RDB 高效持久化机制，确保数据万无一失
- **现代接口**: 原生支持 gRPC 和 HTTP/JSON 双接口，易于集成到任何现代应用架构中
- **易于运维**: 提供结构化日志、审计日志、Prometheus 指标和便捷的命令行工具，为生产环境而设计
- **跨平台**: 支持 Linux、macOS、Windows 及 arm64 、amd64 架构开箱即用
- **支持文本嵌入**: 支持 OpenAI 兼容 API 集成，支持自动文本向量化

Scintirete 的目标是为中小型项目、边缘计算场景以及需要快速原型验证的开发者，提供一个开箱即用、性能卓越且易于维护的向量搜索解决方案。


## 许可证

此项目在 MIT 许可证下授权。

## 支持

- **问题**: [GitHub Issues](https://github.com/scintirete/scintirete/issues)
- **讨论**: [GitHub Discussions](https://github.com/scintirete/scintirete/discussions)