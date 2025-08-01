'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Github, ExternalLink, BookOpen, LayoutDashboard, Sparkles } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* 火花闪光背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-2 h-2 text-yellow-400 opacity-70" />
          </div>
        ))}
      </div>

      {/* 导航栏 */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Scintirete Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Scintirete
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="/docs" 
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>文档</span>
              </a>
              <a 
                href="https://manager.scintirete.wj2015.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>管理UI</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Button asChild>
              <a href="https://github.com/Scintirete/Scintirete/" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="pt-20">
        {/* Hero 区域 */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 text-sm">
                开源高性能向量数据库
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Scintirete
              </h1>
              <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 mb-4 font-light">
                点亮数据之网，发现无限近邻
              </p>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                简单、轻量、面向生产的高性能向量数据库，为中小型项目和边缘计算场景而设计
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <a href="https://github.com/Scintirete/Scintirete/" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5 mr-2" />
                  开始使用
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToFeatures}>
                了解更多
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 blur-3xl"></div>
              <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">毫秒级</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">搜索响应</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">HNSW</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">图索引算法</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">双接口</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">gRPC + HTTP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">跨平台</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">多架构支持</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 快速上手区域 */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                快速上手
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                几分钟即可启动并运行 Scintirete 向量数据库
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">环境要求</CardTitle>
                  <CardDescription>
                    <ul className="space-y-2 text-sm">
                      <li>• Go 1.24+（从源码构建时需要）</li>
                      <li>• Docker（可选，用于容器化部署）</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg">安装方式</CardTitle>
                  <CardDescription>
                    <ul className="space-y-2 text-sm">
                      <li>• 下载预编译二进制文件</li>
                      <li>• 从源码构建</li>
                      <li>• Docker 容器化部署</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg">启动服务</CardTitle>
                  <CardDescription>
                    <ul className="space-y-2 text-sm">
                      <li>• gRPC API：9090 端口</li>
                      <li>• HTTP/JSON API：8080 端口</li>
                      <li>• 支持 docker-compose</li>
                    </ul>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">快速启动示例</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">二进制文件启动</h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400"># 下载并启动</div>
                    <div>./bin/scintirete-server</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Docker 启动</h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400"># 拉取并运行</div>
                    <div>docker run -p 8080:8080 -p 9090:9090</div>
                    <div>ghcr.io/scintirete/scintirete:latest</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <a href="/docs">
                  <BookOpen className="w-5 h-5 mr-2" />
                  查看完整文档
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* 特性区域 */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                核心特性
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                为现代应用而设计的向量数据库，兼具高性能与易用性
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span>简单轻量</span>
                  </CardTitle>
                  <CardDescription>
                    核心逻辑自主实现，无冗余依赖，专注于向量搜索的核心功能
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <span>高性能</span>
                  </CardTitle>
                  <CardDescription>
                    基于内存中的 HNSW 图索引，提供毫秒级的最近邻搜索
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-red-500" />
                    <span>数据安全</span>
                  </CardTitle>
                  <CardDescription>
                    基于 flatbuffers 实现了类似于 Redis 的 AOF + RDB 高效持久化机制
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>现代接口</span>
                  </CardTitle>
                  <CardDescription>
                    原生支持 gRPC 和 HTTP/JSON 双接口，易于集成到任何现代应用架构中
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>易于运维</span>
                  </CardTitle>
                  <CardDescription>
                    提供结构化日志、审计日志、Prometheus 指标和便捷的命令行工具
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <span>跨平台</span>
                  </CardTitle>
                  <CardDescription>
                    支持 Linux、macOS、Windows 及 arm64 、amd64 架构开箱即用
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA 区域 */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              准备好开始了吗？
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              加入我们的开源社区，体验下一代向量数据库的强大功能
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <a href="https://github.com/Scintirete/Scintirete/" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5 mr-2" />
                  查看源码
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://manager.scintirete.wj2015.com" target="_blank" rel="noopener noreferrer">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  体验管理UI
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Scintirete Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Scintirete
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 Scintirete. 开源高性能向量数据库
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        
        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}