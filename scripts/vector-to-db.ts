#!/usr/bin/env tsx

/**
 * 向量数据存储脚本
 * 功能：将指定目录下的向量JSON文件批量存入Scintirete向量数据库
 * 
 * 使用方法：
 *   npx tsx scripts/vector-to-db.ts <vector_directory> <database> <collection> [options]
 * 
 * 参数：
 *   vector_directory: 向量JSON文件所在目录
 *   database: 数据库名称
 *   collection: 集合名称
 * 
 * 选项：
 *   -f, --force: 如果数据库/集合已存在，自动删除重建
 *   --batch-size: 批量插入大小，默认为100
 *   --skip-existing: 跳过已存在的向量（基于img_name）
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { getScintireteClient } from '../src/lib/vectordb';
import { loadEnv, validateRequiredEnv, logger, formatDuration, sleep } from './common';

interface VectorData {
  vector: number[];
  img_name: string;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

interface ScriptOptions {
  force: boolean;
  batchSize: number;
  skipExisting: boolean;
}

/**
 * 解析命令行参数
 */
function parseArguments(): { vectorDirectory: string; database: string; collection: string; options: ScriptOptions } {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('❌ 使用方法: npx tsx scripts/vector-to-db.ts <vector_directory> <database> <collection> [options]');
    console.error('选项:');
    console.error('  -f, --force          如果数据库/集合已存在，自动删除重建');
    console.error('  --batch-size <size>  批量插入大小，默认为100');
    console.error('  --skip-existing      跳过已存在的向量');
    process.exit(1);
  }
  
  const vectorDirectory = args[0];
  const database = args[1];
  const collection = args[2];
  
  const options: ScriptOptions = {
    force: false,
    batchSize: 100,
    skipExisting: false
  };
  
  // 解析选项
  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-f':
      case '--force':
        options.force = true;
        break;
      case '--batch-size':
        const batchSize = parseInt(args[++i]);
        if (isNaN(batchSize) || batchSize <= 0) {
          console.error('❌ batch-size 必须是正整数');
          process.exit(1);
        }
        options.batchSize = batchSize;
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      default:
        console.error(`❌ 未知选项: ${arg}`);
        process.exit(1);
    }
  }
  
  return { vectorDirectory, database, collection, options };
}

/**
 * 扫描目录获取所有向量JSON文件
 */
async function getVectorFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);
    const jsonFiles = files.filter(file => file.toLowerCase().endsWith('.json'));
    return jsonFiles.map(file => path.join(directory, file));
  } catch (error) {
    throw new Error(`扫描向量目录失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 读取向量JSON文件
 */
async function readVectorFile(filePath: string): Promise<VectorData> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content) as VectorData;
    
    // 验证数据格式
    if (!Array.isArray(data.vector) || typeof data.img_name !== 'string') {
      throw new Error('向量数据格式无效');
    }
    
    return data;
  } catch (error) {
    throw new Error(`读取向量文件失败 ${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 检查数据库是否存在
 */
async function checkDatabaseExists(client: any, databaseName: string): Promise<boolean> {
  try {
    const response = await client.listDatabases();
    return response.names.includes(databaseName);
  } catch (error) {
    console.error('检查数据库存在性失败:', error);
    return false;
  }
}

/**
 * 检查集合是否存在
 */
async function checkCollectionExists(client: any, databaseName: string, collectionName: string): Promise<boolean> {
  try {
    const response = await client.listCollections({ dbName: databaseName });
    return response.collections.some((col: any) => col.name === collectionName);
  } catch (error) {
    console.error('检查集合存在性失败:', error);
    return false;
  }
}

/**
 * 创建数据库
 */
async function createDatabase(client: any, databaseName: string): Promise<void> {
  try {
    await client.createDatabase({ name: databaseName });
    console.log(`✅ 数据库创建成功: ${databaseName}`);
  } catch (error) {
    throw new Error(`创建数据库失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建集合
 */
async function createCollection(client: any, databaseName: string, collectionName: string, vectorDimension: number): Promise<void> {
  try {
    // 导入 DistanceMetric 枚举
    const { DistanceMetric } = await import('scintirete');
    
    // 创建集合配置
    const config = {
      dbName: databaseName,
      collectionName: collectionName,
      metricType: DistanceMetric.COSINE, // 使用余弦相似度
      hnswConfig: {
        m: 16,
        efConstruction: 200,
      }
    };
    
    await client.createCollection(config);
    console.log(`✅ 集合创建成功: ${databaseName}.${collectionName} (维度: ${vectorDimension})`);
  } catch (error) {
    throw new Error(`创建集合失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 删除集合
 */
async function deleteCollection(client: any, databaseName: string, collectionName: string): Promise<void> {
  try {
    await client.dropCollection({ dbName: databaseName, collectionName: collectionName });
    console.log(`🗑️  集合删除成功: ${databaseName}.${collectionName}`);
  } catch (error) {
    throw new Error(`删除集合失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 批量插入向量数据
 */
async function insertVectorsBatch(
  client: any,
  databaseName: string,
  collectionName: string,
  vectors: VectorData[],
  startIndex: number
): Promise<number> {
  try {
    const startTime = Date.now();
    // 准备插入数据
    const insertData = vectors.map((data) => ({
      elements: data.vector,
      metadata: {
        img_name: data.img_name,
        // created_at: new Date().toISOString()
      }
    }));
    
    await client.insertVectors({
      dbName: databaseName,
      collectionName: collectionName,
      vectors: insertData
    });
    const duration = Date.now() - startTime;
    console.log(`✅ 批量插入成功: ${vectors.length} 个向量, 耗时: ${formatDuration(duration)}`);
    return vectors.length;
  } catch (error) {
    console.error(`❌ 批量插入失败: ${error instanceof Error ? error.message : String(error)}`);
    return 0;
  }
}

/**
 * 检查向量是否已存在
 */
async function checkVectorExists(
  client: any,
  databaseName: string,
  collectionName: string,
  imgName: string
): Promise<boolean> {
  try {
    // 由于 Scintirete 当前不支持基于元数据的直接查询，
    // 这里简单返回 false，让用户手动处理重复项
    return false;
  } catch {
    return false;
  }
}

/**
 * 处理向量批次
 */
async function processBatch(
  client: any,
  databaseName: string,
  collectionName: string,
  vectorFiles: string[],
  batchStart: number,
  batchSize: number,
  skipExisting: boolean,
  currentIndex: number
): Promise<{ success: number; failed: number; skipped: number; nextIndex: number }> {
  const batch: VectorData[] = [];
  let failed = 0;
  let skipped = 0;
  
  // 读取批次文件
  for (let i = batchStart; i < Math.min(batchStart + batchSize, vectorFiles.length); i++) {
    try {
      const vectorData = await readVectorFile(vectorFiles[i]);
      
      // 检查是否跳过已存在的向量
      if (skipExisting) {
        const exists = await checkVectorExists(client, databaseName, collectionName, vectorData.img_name);
        if (exists) {
          console.log(`⏭️  跳过已存在的向量: ${vectorData.img_name}`);
          skipped++;
          continue;
        }
      }
      
      batch.push(vectorData);
    } catch (error) {
      console.error(`❌ 读取向量文件失败 ${path.basename(vectorFiles[i])}: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }
  
  let success = 0;
  if (batch.length > 0) {
    success = await insertVectorsBatch(client, databaseName, collectionName, batch, currentIndex);
  }
  
  return {
    success,
    failed,
    skipped,
    nextIndex: currentIndex + success
  };
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  
  try {
    // 加载环境变量
    await loadEnv();
    
    // 验证必需的环境变量
    validateRequiredEnv(['SCINTIRETE_ADDRESS']);
    
    // 解析命令行参数
    const { vectorDirectory, database, collection, options } = parseArguments();
    
    // 检查向量目录是否存在
    try {
      await fs.access(vectorDirectory);
    } catch {
      logger.error(`向量目录不存在: ${vectorDirectory}`);
      process.exit(1);
    }
    
    logger.info(`开始处理向量目录: ${vectorDirectory}`);
    logger.info(`目标数据库: ${database}.${collection}`);
    logger.info(`选项: force=${options.force}, batchSize=${options.batchSize}, skipExisting=${options.skipExisting}`);
    
    // 初始化 Scintirete 客户端
    logger.info('初始化 Scintirete 客户端...');
    const client = getScintireteClient();
    
    // 测试连接
    try {
      await client.listDatabases();
      logger.success('Scintirete 客户端连接正常');
    } catch (error) {
      logger.error(`Scintirete 客户端连接失败: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
    
    // 扫描向量文件
    logger.info('扫描向量文件...');
    const vectorFiles = await getVectorFiles(vectorDirectory);
    
    if (vectorFiles.length === 0) {
      logger.info('未找到向量文件');
      return;
    }
    
    logger.info(`找到 ${vectorFiles.length} 个向量文件`);
    
    // 读取第一个文件来获取向量维度
    logger.info('检测向量维度...');
    const firstVector = await readVectorFile(vectorFiles[0]);
    const vectorDimension = firstVector.vector.length;
    logger.info(`向量维度: ${vectorDimension}`);
    
    // 检查和创建数据库
    const dbExists = await checkDatabaseExists(client, database);
    if (!dbExists) {
      console.log(`📁 创建数据库: ${database}`);
      await createDatabase(client, database);
    } else {
      console.log(`📁 数据库已存在: ${database}`);
    }
    
    // 检查和处理集合
    const colExists = await checkCollectionExists(client, database, collection);
    if (colExists) {
      if (options.force) {
        console.log(`🗑️  强制删除现有集合: ${collection}`);
        await deleteCollection(client, database, collection);
        console.log(`📦 重新创建集合: ${collection}`);
        await createCollection(client, database, collection, vectorDimension);
      } else {
        console.error(`❌ 集合已存在: ${collection}。使用 -f 选项强制重建，或使用 --skip-existing 跳过已存在的向量`);
        process.exit(1);
      }
    } else {
      console.log(`📦 创建集合: ${collection}`);
      await createCollection(client, database, collection, vectorDimension);
    }
    
    // 批量处理向量数据
    const stats: ImportStats = {
      total: vectorFiles.length,
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    let currentIndex = 1; // 向量ID从1开始
    console.log('🔄 开始批量导入向量...');
    
    for (let i = 0; i < vectorFiles.length; i += options.batchSize) {
      const batchNum = Math.floor(i / options.batchSize) + 1;
      const totalBatches = Math.ceil(vectorFiles.length / options.batchSize);
      
      console.log(`\n[批次 ${batchNum}/${totalBatches}] 处理 ${Math.min(options.batchSize, vectorFiles.length - i)} 个文件...`);
      
      const result = await processBatch(
        client,
        database,
        collection,
        vectorFiles,
        i,
        options.batchSize,
        options.skipExisting,
        currentIndex
      );
      
      stats.success += result.success;
      stats.failed += result.failed;
      stats.skipped += result.skipped;
      currentIndex = result.nextIndex;
      
      // 添加小延迟避免数据库压力
      if (i + options.batchSize < vectorFiles.length) {
        await sleep(200);
      }
    }
    
    // 输出统计信息
    const duration = Date.now() - startTime;
    console.log('\n📊 导入完成统计:');
    logger.info(`总文件数: ${stats.total}`);
    logger.success(`导入成功: ${stats.success}`);
    if (stats.failed > 0) {
      logger.error(`导入失败: ${stats.failed}`);
    }
    if (stats.skipped > 0) {
      logger.info(`跳过重复: ${stats.skipped}`);
    }
    logger.info(`数据库地址: ${database}.${collection}`);
    logger.info(`总耗时: ${formatDuration(duration)}`);
    
    if (stats.failed > 0) {
      logger.warn('存在导入失败的文件，请检查日志');
      process.exit(1);
    }
    
    logger.success('向量数据导入完成！');
    
  } catch (error) {
    console.error('❌ 程序执行失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 未捕获的错误:', error);
    process.exit(1);
  });
}
