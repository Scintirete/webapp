# Scintirete

[![Go](https://github.com/scintirete/scintirete/actions/workflows/ci.yml/badge.svg)](https://github.com/scintirete/scintirete/actions/workflows/ci.yml)
[![Release](https://github.com/scintirete/scintirete/actions/workflows/release.yml/badge.svg)](https://github.com/scintirete/scintirete/actions/workflows/release.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Scintirete is a lightweight, production-ready vector database built on the HNSW (Hierarchical Navigable Small World) algorithm. The name derives from Latin words "Scintilla" (spark) and "Rete" (network), symbolizing a sparkling network that illuminates the crucial connections within complex data landscapes through deep similarity matching.

**Core Philosophy:** Discover infinite neighbors, illuminate the data network.

## Features

- **Lightweight & Simple**: Self-contained implementation focused on core vector search functionality with minimal dependencies
- **High Performance**: In-memory HNSW graph indexing provides millisecond-level nearest neighbor search
- **Data Safety**: Based on flatbuffers, implements a Redis-like AOF + RDB persistence mechanism to ensure data durability
- **Modern APIs**: Native support for both gRPC and HTTP/JSON interfaces for seamless integration
- **Production Ready**: Structured logging, audit logs, Prometheus metrics, and comprehensive CLI tools designed for production environments
- **Cross-platform**: Support Linux, macOS, Windows, arm64, amd64 architectures out of the box
- **Support Text Embedding**: Support OpenAI-compatible API integration, support automatic text vectorization

Scintirete targets small to medium-scale projects, edge computing scenarios, and developers who need rapid prototyping with a reliable, high-performance, and maintainable vector search solution.

## License

This project is licensed under the MIT License.

## Support

- **Issues**: [GitHub Issues](https://github.com/scintirete/scintirete/issues)
- **Discussions**: [GitHub Discussions](https://github.com/scintirete/scintirete/discussions)
