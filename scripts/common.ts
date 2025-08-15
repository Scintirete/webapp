/**
 * 脚本通用工具函数
 * 包含环境变量解析、日志工具等共用逻辑
 */

import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 环境变量配置接口
 */
export interface EnvConfig {
  // Doubao API 配置
  ARK_API_KEY?: string;
  ARK_BASE_URL?: string;
  ARK_TIMEOUT?: string;
  ARK_MAX_RETRIES?: string;
  ARK_RETRY_DELAY?: string;
  
  // Scintirete 数据库配置
  SCINTIRETE_ADDRESS?: string;
  SCINTIRETE_PASSWORD?: string;
  SCINTIRETE_USE_TLS?: string;
  SCINTIRETE_TIMEOUT?: string;
  SCINTIRETE_DATABASE_NAME?: string;
  
  [key: string]: string | undefined;
}

/**
 * 解析 .env 文件内容
 */
function parseEnvContent(content: string): EnvConfig {
  const config: EnvConfig = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    // 跳过空行和注释行
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // 解析键值对
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }
    
    const key = trimmedLine.substring(0, equalIndex).trim();
    let value = trimmedLine.substring(equalIndex + 1).trim();
    
    // 处理引号包围的值
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // 处理转义字符
    value = value.replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\\\/g, '\\')
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'");
    
    config[key] = value;
  }
  
  return config;
}

/**
 * 查找并读取环境变量文件
 */
async function findAndReadEnvFile(startDir: string): Promise<EnvConfig> {
  const envFiles = ['.env.local', '.env'];
  let currentDir = startDir;
  
  // 向上查找环境变量文件，直到项目根目录
  while (currentDir !== path.dirname(currentDir)) {
    for (const envFile of envFiles) {
      const envPath = path.join(currentDir, envFile);
      try {
        await fs.access(envPath);
        console.log(`🔧 找到环境变量文件: ${envPath}`);
        
        const content = await fs.readFile(envPath, 'utf8');
        return parseEnvContent(content);
      } catch {
        // 文件不存在，继续查找
      }
    }
    
    // 检查是否到达项目根目录（通过package.json判断）
    const packageJsonPath = path.join(currentDir, 'package.json');
    try {
      await fs.access(packageJsonPath);
      // 如果找到package.json但没有环境变量文件，停止查找
      break;
    } catch {
      // 继续向上查找
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  console.log('⚠️  未找到环境变量文件，将使用系统环境变量');
  return {};
}

/**
 * 加载和应用环境变量
 */
export async function loadEnv(scriptDir?: string): Promise<void> {
  try {
    // 确定搜索起始目录
    const startDir = scriptDir || process.cwd();
    
    console.log('🔍 加载环境变量...');
    
    // 读取环境变量文件
    const envConfig = await findAndReadEnvFile(startDir);
    
    // 将环境变量应用到 process.env（不覆盖已存在的）
    let loadedCount = 0;
    for (const [key, value] of Object.entries(envConfig)) {
      if (value !== undefined && process.env[key] === undefined) {
        process.env[key] = value;
        loadedCount++;
      }
    }
    
    if (loadedCount > 0) {
      console.log(`✅ 成功加载 ${loadedCount} 个环境变量`);
    }
    
    // 验证关键环境变量
    const criticalVars = ['ARK_API_KEY', 'SCINTIRETE_ADDRESS'];
    const missingVars = criticalVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  缺少关键环境变量: ${missingVars.join(', ')}`);
      console.warn('   请确保在 .env.local 文件或系统环境变量中配置');
    }
    
  } catch (error) {
    console.error('❌ 加载环境变量失败:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * 检查必需的环境变量
 */
export function validateRequiredEnv(requiredVars: string[]): void {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少必需的环境变量:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 请在 .env.local 文件中配置，或使用系统环境变量');
    process.exit(1);
  }
}

/**
 * 获取环境变量配置摘要（隐藏敏感信息）
 */
export function getEnvSummary(): Record<string, string> {
  const summary: Record<string, string> = {};
  const envVars = [
    'ARK_API_KEY',
    'ARK_BASE_URL', 
    'ARK_TIMEOUT',
    'SCINTIRETE_ADDRESS',
    'SCINTIRETE_USE_TLS',
    'SCINTIRETE_TIMEOUT'
  ];
  
  for (const varName of envVars) {
    const value = process.env[varName];
    if (value) {
      // 隐藏API密钥等敏感信息
      if (varName.includes('KEY') || varName.includes('PASSWORD')) {
        summary[varName] = '***';
      } else {
        summary[varName] = value;
      }
    } else {
      summary[varName] = '(未设置)';
    }
  }
  
  return summary;
}

/**
 * 通用日志工具
 */
export const logger = {
  info: (message: string) => console.log(`ℹ️  ${message}`),
  success: (message: string) => console.log(`✅ ${message}`),
  warn: (message: string) => console.warn(`⚠️  ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),
  progress: (current: number, total: number, message: string) => {
    const percent = Math.round((current / total) * 100);
    console.log(`🔄 [${current}/${total}] ${percent}% - ${message}`);
  }
};

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 格式化持续时间
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * 睡眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
